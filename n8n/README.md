# LendLoop - n8n Workflow Automation

This directory contains the production-ready n8n workflows that orchestrate LendLoop's asynchronous events, reminders, and failure handling.

---

## 1. Included Workflows

| File | Type | Description |
| :--- | :--- | :--- |
| `request_notification.json` | Webhook (Event-Driven) | Receives borrow request events from Convex, verifies HMAC-SHA256 signature, applies data minimization, and dispatches notifications. |
| `overdue_reminders.json` | Schedule (Daily Cron) | Runs daily at 09:00, fetches overdue loans from Convex HTTP endpoint, dispatches reminders, and executes idempotent writebacks. |
| `error_handler.json` | Error Trigger | Catches unhandled workflow failures and logs structured diagnostic alerts (preventing silent failures). |

---

## 2. Quick Start with Docker Compose

To start your local n8n instance:

```bash
# In the root repository directory
docker compose up -d
```

Access the n8n web console at: **`http://localhost:5678`**

---

## 3. Importing Workflows

1. Open **`http://localhost:5678`** and finish the initial account creation (first run).
2. Click **Workflows** > **Add Workflow** > **... (top right)** > **Import from File**.
3. Select `request_notification.json`, `overdue_reminders.json`, and `error_handler.json`.
4. Toggle the workflow status to **Active**.

---

## 4. Security & Environment Variables

All secrets are kept strictly in environment variables and n8n credentials, **never hardcoded in workflow JSONs**:

- **`LENDLOOP_WEBHOOK_SECRET`**: Shared secret used for bidirectional HMAC-SHA256 signature generation and verification.
- **`CONVEX_SITE_URL`**: Base URL of the Convex HTTP site (e.g., `https://your-convex-deployment.convex.site` or `http://localhost:3000`).
- **`NODE_FUNCTION_ALLOW_BUILTIN`**: Set to `crypto,buffer` (included in `docker-compose.yml`). *Note: All LendLoop Code nodes include an automatic pure-JS fallback, ensuring they execute without error even in restricted n8n sandboxes where built-in modules are disallowed.*

---

## 5. Bidirectional Security & Idempotency Specification

### A. Convex -> n8n (Request Notification)
- **Header**: `X-LendLoop-Signature` (HMAC-SHA256 of the JSON body).
- **Verification**: The `Verify HMAC & Data Minimization` node computes `crypto.createHmac('sha256', secret)` and performs a timing-safe comparison (`crypto.timingSafeEqual`).
- **Data Minimization**: The node strips all non-essential metadata and passes only `{ toolName, recipientEmail, recipientName, status, startDate, endDate }`.

### B. n8n -> Convex (Overdue Reminders & Writeback)
- **Fetch**: GET `/overdue-loans` includes `Authorization: Bearer <secret>` and `X-LendLoop-Signature`.
- **Idempotency Key**: Generated deterministically as `overdue-${loanId}-${YYYY-MM-DD}`.
- **Writeback**: POST `/record-reminder` includes `X-LendLoop-Signature`. Convex verifies that `idempotencyKey` has not been processed yet. Retries safely return HTTP 200 with `idempotent: true` without duplicating notifications.
