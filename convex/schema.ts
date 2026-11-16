import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const toolCategoryValidator = v.union(
  v.literal("power tools"),
  v.literal("garden"),
  v.literal("kitchen"),
  v.literal("camping"),
  v.literal("woodworking"),
  v.literal("automotive"),
  v.literal("other")
);

export const toolConditionValidator = v.union(
  v.literal("new"),
  v.literal("like-new"),
  v.literal("good"),
  v.literal("fair")
);

export const toolStatusValidator = v.union(
  v.literal("available"),
  v.literal("borrowed")
);

export const loanStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("declined"),
  v.literal("returned")
);

export const userRoleValidator = v.union(
  v.literal("admin"),
  v.literal("user")
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: userRoleValidator,
    isTrustedLender: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"]),

  tools: defineTable({
    ownerId: v.string(), // Clerk user ID
    ownerName: v.string(),
    name: v.string(),
    category: toolCategoryValidator,
    condition: toolConditionValidator,
    description: v.string(),
    imageUrl: v.optional(v.string()),
    status: toolStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  loans: defineTable({
    toolId: v.id("tools"),
    toolName: v.string(),
    lenderId: v.string(), // Clerk user ID of tool owner
    borrowerId: v.string(), // Clerk user ID of borrower
    borrowerName: v.string(),
    borrowerEmail: v.string(),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
    status: loanStatusValidator,
    lastReminderSentAt: v.optional(v.number()),
    reminderCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tool", ["toolId"])
    .index("by_borrower", ["borrowerId"])
    .index("by_lender", ["lenderId"])
    .index("by_status", ["status"])
    .index("by_end_date", ["endDate"]),

  automationLogs: defineTable({
    loanId: v.id("loans"),
    workflowType: v.union(
      v.literal("request_notification"),
      v.literal("overdue_reminder")
    ),
    status: v.union(v.literal("sent"), v.literal("failed")),
    idempotencyKey: v.string(),
    payloadSummary: v.string(),
    sentAt: v.number(),
  })
    .index("by_loan", ["loanId"])
    .index("by_idempotencyKey", ["idempotencyKey"]),
});
