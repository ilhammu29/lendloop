import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAuth, requireAdmin } from "./lib/security";

/**
 * AUTHENTICATED MUTATION:
 * Request to borrow a tool for a specific date range.
 * Validates availability, date validity, and prevents borrowing one's own tool.
 * Triggers n8n notification webhook via Convex internal action.
 */
export const requestBorrow = mutation({
  args: {
    toolId: v.id("tools"),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuth(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found.");
    }

    if (tool.status !== "available") {
      throw new Error("This tool is currently borrowed and unavailable.");
    }

    if (tool.ownerId === identity.subject) {
      throw new Error("You cannot borrow your own tool.");
    }

    // Validate dates
    const start = new Date(args.startDate).getTime();
    const end = new Date(args.endDate).getTime();

    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD.");
    }

    if (start > end) {
      throw new Error("Borrow start date cannot be after return date.");
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (args.startDate < todayStr) {
      throw new Error("Borrow start date cannot be in the past.");
    }

    // Date Conflict Validation: Ensure tool is not already booked during this window
    const existingApprovedLoans = await ctx.db
      .query("loans")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    const conflictingLoan = existingApprovedLoans.find((loan) => {
      // Intervals [A, B] and [C, D] overlap if A <= D and C <= B
      return args.startDate <= loan.endDate && loan.startDate <= args.endDate;
    });

    if (conflictingLoan) {
      throw new Error(
        `This tool is already booked from ${conflictingLoan.startDate} to ${conflictingLoan.endDate}. Please choose an alternate date range.`
      );
    }

    // Fetch tool owner details for notification
    const owner = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", tool.ownerId))
      .unique();

    const now = Date.now();
    const borrowerName = user?.name || identity.name || "Neighbor";
    const borrowerEmail = user?.email || identity.email || "";

    const loanId = await ctx.db.insert("loans", {
      toolId: args.toolId,
      toolName: tool.name,
      lenderId: tool.ownerId,
      borrowerId: identity.subject,
      borrowerName,
      borrowerEmail,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Asynchronously dispatch n8n notification to tool owner
    await ctx.scheduler.runAfter(0, internal.actions.n8n.dispatchN8nWebhook, {
      event: "borrow_request_created",
      loanId: loanId,
      toolName: tool.name,
      recipientEmail: owner?.email || "",
      recipientName: owner?.name || "Lender",
      status: "pending",
      startDate: args.startDate,
      endDate: args.endDate,
    });

    return loanId;
  },
});

/**
 * AUTHENTICATED QUERY:
 * List requests initiated by the authenticated user (borrower perspective).
 */
export const listMyRequests = query({
  args: {},
  handler: async (ctx) => {
    const { identity } = await requireAuth(ctx);

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", identity.subject))
      .collect();

    return loans.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * AUTHENTICATED QUERY:
 * List requests for tools owned by the authenticated user (lender perspective).
 */
export const listIncomingRequests = query({
  args: {},
  handler: async (ctx) => {
    const { identity } = await requireAuth(ctx);

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_lender", (q) => q.eq("lenderId", identity.subject))
      .collect();

    return loans.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Approve or decline a borrow request on tools owned by the caller.
 * Enforces ownership check and updates tool availability upon approval.
 */
export const respondToLoanRequest = mutation({
  args: {
    loanId: v.id("loans"),
    action: v.union(v.literal("approve"), v.literal("decline")),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuth(ctx);
    const loan = await ctx.db.get(args.loanId);

    if (!loan) {
      throw new Error("Loan request not found.");
    }

    const isAdmin = user?.role === "admin";
    const isLender = loan.lenderId === identity.subject;

    if (!isLender && !isAdmin) {
      throw new Error("FORBIDDEN: You can only act on requests for your own tools.");
    }

    if (loan.status !== "pending") {
      throw new Error(`This request has already been ${loan.status}.`);
    }

    // Double-Booking Race Condition Prevention at Approval Time:
    if (args.action === "approve") {
      const activeApproved = await ctx.db
        .query("loans")
        .withIndex("by_tool", (q) => q.eq("toolId", loan.toolId))
        .filter((q) => q.eq(q.field("status"), "approved"))
        .collect();

      const hasConflict = activeApproved.some(
        (l) => loan.startDate <= l.endDate && l.startDate <= loan.endDate
      );

      if (hasConflict) {
        throw new Error(
          "Cannot approve request: This equipment already has an approved booking overlapping these dates."
        );
      }
    }

    const now = Date.now();
    const newStatus = args.action === "approve" ? "approved" : "declined";

    await ctx.db.patch(args.loanId, {
      status: newStatus,
      updatedAt: now,
    });

    // If approved, update tool status to 'borrowed'
    if (newStatus === "approved") {
      await ctx.db.patch(loan.toolId, {
        status: "borrowed",
        updatedAt: now,
      });
    }

    // Dispatch status update notification to borrower via n8n
    await ctx.scheduler.runAfter(0, internal.actions.n8n.dispatchN8nWebhook, {
      event: "borrow_request_status_changed",
      loanId: args.loanId,
      toolName: loan.toolName,
      recipientEmail: loan.borrowerEmail,
      recipientName: loan.borrowerName,
      status: newStatus,
      startDate: loan.startDate,
      endDate: loan.endDate,
    });

    return { success: true, status: newStatus };
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Mark an active loan as returned.
 * Restores tool status to 'available'.
 */
export const markLoanReturned = mutation({
  args: {
    loanId: v.id("loans"),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuth(ctx);
    const loan = await ctx.db.get(args.loanId);

    if (!loan) {
      throw new Error("Loan not found.");
    }

    const isAdmin = user?.role === "admin";
    const isLender = loan.lenderId === identity.subject;
    const isBorrower = loan.borrowerId === identity.subject;

    if (!isLender && !isBorrower && !isAdmin) {
      throw new Error("FORBIDDEN: Only the lender, borrower, or an admin can mark a loan returned.");
    }

    if (loan.status === "returned") {
      return { success: true, message: "Loan already marked as returned." };
    }

    if (loan.status !== "approved") {
      throw new Error(`Invalid state transition: Cannot mark a '${loan.status}' loan as returned. Only active approved loans can be returned.`);
    }

    const now = Date.now();

    await ctx.db.patch(args.loanId, {
      status: "returned",
      updatedAt: now,
    });

    // Return tool to available pool
    await ctx.db.patch(loan.toolId, {
      status: "available",
      updatedAt: now,
    });

    // Dispatch returned confirmation event to n8n
    await ctx.scheduler.runAfter(0, internal.actions.n8n.dispatchN8nWebhook, {
      event: "borrow_request_status_changed",
      loanId: args.loanId,
      toolName: loan.toolName,
      recipientEmail: loan.borrowerEmail,
      recipientName: loan.borrowerName,
      status: "returned",
      startDate: loan.startDate,
      endDate: loan.endDate,
    });

    return { success: true };
  },
});

/**
 * BONUS FEATURE:
 * Fetch automation activity for a specific loan (e.g. "Reminder sent 2 days ago").
 */
export const getLoanActivity = query({
  args: { loanId: v.id("loans") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const logs = await ctx.db
      .query("automationLogs")
      .withIndex("by_loan", (q) => q.eq("loanId", args.loanId))
      .collect();

    return logs.sort((a, b) => b.sentAt - a.sentAt);
  },
});

/**
 * ADMIN-ONLY QUERY:
 * View all loans across the platform.
 * Gracefully returns empty list if user is not an admin yet to prevent frontend crashes.
 */
export const listAllLoansAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user?.role !== "admin") {
      return [];
    }

    const allLoans = await ctx.db.query("loans").collect();
    return allLoans.sort((a, b) => b.createdAt - a.createdAt);
  },
});
