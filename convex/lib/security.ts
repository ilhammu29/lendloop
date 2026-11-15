import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Computes an HMAC-SHA256 signature for a given payload using the Web Crypto API.
 * Uses standard crypto.subtle compatible with both Convex runtime and standard modern JS runtimes.
 */
export async function generateHmacSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(payload)
  );

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Constant-time string comparison to prevent timing attacks when comparing signatures.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verifies an incoming HMAC-SHA256 signature against the expected payload and secret.
 */
export async function verifyHmacSignature(
  payload: string,
  providedSignature: string | null,
  secret: string
): Promise<boolean> {
  if (!providedSignature || !secret) {
    return false;
  }

  // Normalize signature in case it has prefix like 'sha256='
  const cleanSignature = providedSignature.startsWith("sha256=")
    ? providedSignature.slice(7)
    : providedSignature;

  const expectedSignature = await generateHmacSignature(payload, secret);
  return constantTimeEqual(cleanSignature.toLowerCase(), expectedSignature.toLowerCase());
}

/**
 * Helper to fetch the authenticated user identity and database record.
 * Throws an error if the user is not authenticated.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }

  // Fetch or resolve user profile from database
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return { identity, user };
}

/**
 * Helper to strictly verify that the authenticated caller has the 'admin' role.
 * Enforced on the server inside Convex functions.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const { identity, user } = await requireAuth(ctx);
  
  // Also support admin role defined directly on Clerk token claims (metadata)
  const tokenRole = identity.role || (identity as any)["https://lendloop.app/roles"]?.[0];
  const isAdmin = user?.role === "admin" || tokenRole === "admin";

  if (!isAdmin) {
    throw new Error("FORBIDDEN: Administrative privileges required.");
  }

  return { identity, user };
}
