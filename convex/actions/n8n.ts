"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { generateHmacSignature } from "../lib/security";

/**
 * Convex internal action to dispatch signed webhook events to n8n.
 * Includes HMAC-SHA256 signature in `X-LendLoop-Signature` header.
 * Enforces data minimization: only includes essential fields for notification dispatch.
 */
export const dispatchN8nWebhook = internalAction({
  args: {
    event: v.string(),
    loanId: v.string(),
    toolName: v.string(),
    recipientEmail: v.string(),
    recipientName: v.string(),
    status: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.LENDLOOP_WEBHOOK_SECRET || "lendloop_shared_hmac_secret_2026";

    if (!webhookUrl) {
      console.warn("[n8n-action] N8N_WEBHOOK_URL not configured. Skipping webhook dispatch.");
      return { skipped: true, reason: "No webhook URL configured." };
    }

    const payload = {
      event: args.event,
      loanId: args.loanId,
      toolName: args.toolName,
      recipientEmail: args.recipientEmail,
      recipientName: args.recipientName,
      status: args.status,
      startDate: args.startDate,
      endDate: args.endDate,
      timestamp: Date.now(),
    };

    const payloadString = JSON.stringify(payload);
    const signature = await generateHmacSignature(payloadString, webhookSecret);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LendLoop-Signature": signature,
          "User-Agent": "LendLoop-Convex-Backend/1.0",
        },
        body: payloadString,
      });

      if (!response.ok) {
        console.error(
          `[n8n-action] Webhook dispatch failed with HTTP ${response.status}: ${await response.text()}`
        );
        return { success: false, status: response.status };
      }

      return { success: true };
    } catch (err: any) {
      console.error("[n8n-action] Error dispatching webhook to n8n:", err.message);
      return { success: false, error: err.message };
    }
  },
});
