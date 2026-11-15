import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { verifyHmacSignature } from "./lib/security";

const http = httpRouter();

const SHARED_SECRET =
  process.env.LENDLOOP_WEBHOOK_SECRET || "lendloop_shared_hmac_secret_2026";

/**
 * GET /overdue-loans
 * Endpoint called daily by the n8n Overdue Reminders workflow.
 * Secured via HMAC signature or Bearer authentication header.
 */
http.route({
  path: "/overdue-loans",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const signature = request.headers.get("X-LendLoop-Signature");
    const timestamp = request.headers.get("X-LendLoop-Timestamp") || "";

    let isAuthorized = false;

    // Check 1: Bearer Token match
    if (authHeader && authHeader === `Bearer ${SHARED_SECRET}`) {
      isAuthorized = true;
    }

    // Check 2: HMAC signature of timestamp or path
    if (!isAuthorized && signature) {
      const payloadToVerify = timestamp ? `overdue-loans:${timestamp}` : "overdue-loans";
      isAuthorized = await verifyHmacSignature(payloadToVerify, signature, SHARED_SECRET);
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED: Invalid signature or token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const overdueLoans = await ctx.runQuery(
        internal.reminders.getOverdueLoansInternal,
        {}
      );

      return new Response(JSON.stringify(overdueLoans), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch overdue loans", message: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /record-reminder
 * Writeback endpoint called by n8n after dispatching a reminder to a borrower.
 * Secured with HMAC signature verification and enforces idempotency.
 */
http.route({
  path: "/record-reminder",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("X-LendLoop-Signature");
    const bodyText = await request.text();

    const isAuthorized = await verifyHmacSignature(
      bodyText,
      signature,
      SHARED_SECRET
    );

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          error: "UNAUTHORIZED: Invalid or missing HMAC signature",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const body = JSON.parse(bodyText);

      if (!body.loanId || !body.idempotencyKey) {
        return new Response(
          JSON.stringify({
            error: "BAD_REQUEST: Missing required fields loanId or idempotencyKey",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runMutation(
        internal.reminders.recordReminderInternal,
        {
          loanId: body.loanId,
          idempotencyKey: body.idempotencyKey,
          status: body.status === "failed" ? "failed" : "sent",
          details: body.details || "Automated reminder dispatched via n8n",
        }
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "INTERNAL_ERROR: Failed to record reminder writeback",
          message: err.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
