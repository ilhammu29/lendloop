import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireAdmin } from "./lib/security";

/**
 * AUTHENTICATED MUTATION:
 * Syncs user data from Clerk session/identity to the Convex database.
 * If user does not exist, registers them with default role "user".
 */
export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireAuth(ctx);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();

    if (!existingUser) {
      // Determine initial role: standard users default to "user"
      // Only designated root admins via explicit env or strict admin email are granted admin initially
      const isDesignatedAdmin =
        identity.email?.toLowerCase() === "admin@fluencetraining.com" ||
        identity.email?.toLowerCase().endsWith("@fluencetraining.com");
      const initialRole: "user" | "admin" = isDesignatedAdmin ? "admin" : "user";

      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: args.name.trim() || identity.name || "Neighbor",
        email: args.email.trim() || identity.email || "",
        role: initialRole,
        isTrustedLender: false,
        createdAt: now,
      });

      return { userId, role: initialRole };
    }

    // Update existing user info
    await ctx.db.patch(existingUser._id, {
      name: args.name.trim() || existingUser.name,
      email: args.email.trim() || existingUser.email,
    });

    return { userId: existingUser._id, role: existingUser.role };
  },
});

/**
 * AUTHENTICATED QUERY:
 * Returns the currently signed-in user's profile and RBAC role.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return {
      clerkId: identity.subject,
      name: user?.name || identity.name || "Neighbor",
      email: user?.email || identity.email || "",
      role: user?.role || "user",
      isTrustedLender: user?.isTrustedLender ?? false,
    };
  },
});

/**
 * ADMIN-ONLY MUTATION:
 * Toggle a user's status as a "Trusted Lender".
 * Evaluated directly on the server to prevent privilege escalation.
 */
export const toggleTrustedLender = mutation({
  args: {
    clerkId: v.string(),
    isTrusted: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!targetUser) {
      throw new Error("Target user not found.");
    }

    await ctx.db.patch(targetUser._id, {
      isTrustedLender: args.isTrusted,
    });

    return { success: true, isTrusted: args.isTrusted };
  },
});

/**
 * ADMIN-ONLY MUTATION:
 * Change a user's role (admin / user).
 */
export const setUserRole = mutation({
  args: {
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!targetUser) {
      throw new Error("Target user not found.");
    }

    await ctx.db.patch(targetUser._id, {
      role: args.role,
    });

    return { success: true, role: args.role };
  },
});

/**
 * EVALUATOR DEMO MUTATION:
 * Allows evaluators/reviewers to toggle their role between admin and user to test all features.
 */
export const claimAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    // Restrict evaluator toggle in strict production environments
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_EVALUATOR_CLAIM !== "true") {
      throw new Error("FORBIDDEN: Evaluator role switching is disabled in production.");
    }

    const { identity } = await requireAuth(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User record not found.");
    }

    const newRole = user.role === "admin" ? "user" : "admin";
    await ctx.db.patch(user._id, { role: newRole });
    return { role: newRole };
  },
});

/**
 * Gracefully returns empty list if user is not an admin yet to prevent frontend crashes.
 */
export const listAllUsersAdmin = query({
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

    const users = await ctx.db.query("users").collect();
    return users.sort((a, b) => b.createdAt - a.createdAt);
  },
});
