import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Internal query to fetch overdue loans.
 * Called by the secure HTTP endpoint when queried by n8n.
 */
export const getOverdueLoansInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Current date in YYYY-MM-DD UTC
    const today = new Date().toISOString().split("T")[0];

    const approvedLoans = await ctx.db
      .query("loans")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    // Filter loans where endDate is strictly before today
    const overdueLoans = approvedLoans.filter((loan) => loan.endDate < today);

    return overdueLoans.map((loan) => {
      const endTimestamp = new Date(loan.endDate).getTime();
      const currentTimestamp = Date.now();
      const daysOverdue = Math.max(
        1,
        Math.floor((currentTimestamp - endTimestamp) / (1000 * 60 * 60 * 24))
      );

      return {
        loanId: loan._id,
        toolId: loan.toolId,
        toolName: loan.toolName,
        borrowerId: loan.borrowerId,
        borrowerName: loan.borrowerName,
        borrowerEmail: loan.borrowerEmail,
        startDate: loan.startDate,
        endDate: loan.endDate,
        daysOverdue,
        reminderCount: loan.reminderCount ?? 0,
        lastReminderSentAt: loan.lastReminderSentAt ?? null,
      };
    });
  },
});

/**
 * Internal mutation to record a reminder writeback from n8n.
 * Implements strict idempotency via idempotencyKey.
 */
export const recordReminderInternal = internalMutation({
  args: {
    loanId: v.id("loans"),
    idempotencyKey: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Idempotency Check: check if key already exists
    const existingLog = await ctx.db
      .query("automationLogs")
      .withIndex("by_idempotencyKey", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey)
      )
      .unique();

    if (existingLog) {
      return {
        idempotent: true,
        message: "Duplicate request ignored. Reminder already logged.",
        logId: existingLog._id,
      };
    }

    // 2. Fetch loan record
    const loan = await ctx.db.get(args.loanId);
    if (!loan) {
      throw new Error("Loan record not found.");
    }

    const now = Date.now();

    // 3. Insert audit log
    const logId = await ctx.db.insert("automationLogs", {
      loanId: args.loanId,
      workflowType: "overdue_reminder",
      status: args.status,
      idempotencyKey: args.idempotencyKey,
      payloadSummary: args.details,
      sentAt: now,
    });

    // 4. Update loan reminder metadata
    if (args.status === "sent") {
      const currentCount = loan.reminderCount ?? 0;
      await ctx.db.patch(args.loanId, {
        lastReminderSentAt: now,
        reminderCount: currentCount + 1,
        updatedAt: now,
      });
    }

    return {
      idempotent: false,
      message: "Reminder recorded successfully.",
      logId,
    };
  },
});
