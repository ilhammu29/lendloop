import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth } from "./lib/security";
import {
  toolCategoryValidator,
  toolConditionValidator,
} from "./schema";

/**
 * PUBLIC QUERY (Data Minimization applied):
 * Unauthenticated endpoint returning available tools.
 * Exposes ONLY tool name, category, and availability status.
 * Intentionally hides owner identity, descriptions, and audit timestamps.
 */
export const listPublicTools = query({
  args: {},
  handler: async (ctx) => {
    const availableTools = await ctx.db
      .query("tools")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    // Enforce data minimization: project only safe, public fields
    return availableTools.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      category: tool.category,
      status: tool.status,
    }));
  },
});

/**
 * AUTHENTICATED QUERY:
 * Returns all tools with optional category filter.
 * Includes condition, description, owner information, and owner's Trusted Lender status.
 */
export const listAllTools = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    let toolsQuery = ctx.db.query("tools");

    const tools = args.category && args.category !== "all"
      ? await toolsQuery
          .withIndex("by_category", (q) =>
            q.eq("category", args.category as any)
          )
          .collect()
      : await toolsQuery.collect();

    // Enrich with owner's Trusted Lender badge
    const enrichedTools = await Promise.all(
      tools.map(async (tool) => {
        const owner = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", tool.ownerId))
          .unique();

        return {
          ...tool,
          isTrustedLender: owner?.isTrustedLender ?? false,
        };
      })
    );

    return enrichedTools.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * AUTHENTICATED QUERY:
 * Fetch a single tool by its ID.
 */
export const getToolById = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    const owner = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", tool.ownerId))
      .unique();

    return {
      ...tool,
      isTrustedLender: owner?.isTrustedLender ?? false,
    };
  },
});

/**
 * AUTHENTICATED QUERY:
 * Returns only tools listed by the authenticated caller.
 */
export const listMyTools = query({
  args: {},
  handler: async (ctx) => {
    const { identity } = await requireAuth(ctx);

    const myTools = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .collect();

    return myTools.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Create a new tool listing.
 */
export const createTool = mutation({
  args: {
    name: v.string(),
    category: toolCategoryValidator,
    condition: toolConditionValidator,
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuth(ctx);

    // Sanitize and trim inputs
    const name = args.name.trim();
    const description = args.description.trim();

    if (!name || name.length < 2) {
      throw new Error("Tool name must be at least 2 characters long.");
    }

    const now = Date.now();
    const toolId = await ctx.db.insert("tools", {
      ownerId: identity.subject,
      ownerName: user?.name || identity.name || "Neighbor",
      name,
      category: args.category,
      condition: args.condition,
      description,
      status: "available",
      createdAt: now,
      updatedAt: now,
    });

    return toolId;
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Update an existing tool listing (owner or admin only).
 */
export const updateTool = mutation({
  args: {
    toolId: v.id("tools"),
    name: v.string(),
    category: toolCategoryValidator,
    condition: toolConditionValidator,
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuth(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found.");
    }

    const isAdmin = user?.role === "admin";
    const isOwner = tool.ownerId === identity.subject;

    if (!isOwner && !isAdmin) {
      throw new Error("FORBIDDEN: You can only edit your own listings.");
    }

    const now = Date.now();
    await ctx.db.patch(args.toolId, {
      name: args.name.trim(),
      category: args.category,
      condition: args.condition,
      description: args.description.trim(),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Delete a tool listing (owner or admin only).
 */
export const deleteTool = mutation({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuth(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found.");
    }

    const isAdmin = user?.role === "admin";
    const isOwner = tool.ownerId === identity.subject;

    if (!isOwner && !isAdmin) {
      throw new Error("FORBIDDEN: You do not have permission to delete this listing.");
    }

    // Prevent deletion if currently on an active loan
    if (tool.status === "borrowed") {
      throw new Error("Cannot delete a tool that is currently on an active loan.");
    }

    await ctx.db.delete(args.toolId);
    return { success: true };
  },
});
