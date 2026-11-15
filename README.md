# 🔄 LendLoop: Neighborhood Tool-Lending Board

> **"Borrow what you need. Lend what you don’t."**  
> A pragmatic, security-minded, full-stack community tool-sharing platform featuring asynchronous automated workflows, cryptographic HMAC verification, strict server-side RBAC, and data minimization. Built for **Fluence International, Inc.** take-home assignment.

---

## 🏗 Architecture Overview

LendLoop separates concerns across modern serverless and containerized primitives:

```
                            +-------------------------------------------+
                            |         Next.js App Router (Client)       |
                            |  - Public Catalog (Data Minimization)     |
                            |  - Authenticated Dashboard & Tool CRUD    |
                            |  - Role-based Views (User vs Admin)       |
                            +---------------------+---------------------+
                                                  |
                                Clerk Auth JWT    |   Convex Client SDK
                                                  v
                            +---------------------+---------------------+
                            |           Convex Backend (BaaS)           |
                            |  - Server-Side RBAC Mutations & Queries   |
                            |  - Cryptographic HMAC Generator (SHA-256) |
                            |  - HTTP Actions (Webhook & Overdue API)   |
                            |  - Idempotency & Audit Log Tables         |
                            +----------+--------------------+-----------+
                                       |                    ^
                     HTTP POST + HMAC  |                    |  HTTP POST + HMAC
                     (Request Event)   |                    |  (Idempotent Writeback)
                                       v                    |
                            +----------+--------------------+-----------+
                            |           n8n Automation Engine           |
                            |  - Docker Container (Self-hosted)         |
                            |  - Workflow 1: Request Notification       |
                            |  - Workflow 2: Daily Overdue Cron         |
                            |  - Workflow 3: Global Error Handler       |
                            +---------------------+---------------------+
                                                  |
                                                  v
                                     Notification Sinks (Mock,
                                     Email, Discord, Slack)
```

### Core Technologies
* **Frontend:** [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons).
* **Authentication:** [Clerk](https://clerk.com/) (Session tokens, custom user metadata for RBAC).
* **Backend & Database:** [Convex](https://www.convex.dev/) (Reactive serverless database, server mutations, HTTP actions, audit logging).
* **Workflow Automation:** [n8n](https://n8n.io/) (Self-hosted via Docker Compose, event webhooks, scheduled cron jobs, error handling).

---

## 🛡 Security & Privacy Engineering Decisions

Fluence builds mission-critical B2B products for clinicians and researchers where privacy and compliance cannot be an afterthought. LendLoop reflects these standards:

### 1. Data Minimization (Privacy by Design)
* **Public Page Protection:** Unauthenticated visitors viewing the public catalog (`/`) query `api.tools.listPublicTools`. This endpoint projects **only** `name`, `category`, and `status`. Owner names, email addresses, and timestamps are stripped at the database query layer, preventing automated scraping of neighbor identities or physical addresses.
* **Webhook Payload Hygiene:** Outbound webhooks to n8n contain only the essential fields needed for notification delivery (`toolName`, `recipientName`, `recipientEmail`, `dates`), never raw auth tokens or internal system IDs.

### 2. Bidirectional Cryptographic HMAC Signatures
All inter-service communication between Convex and n8n is cryptographically verified:
* **Convex &rarr; n8n (Request Notifications):** Outbound webhook payloads are signed with an `HMAC-SHA256` digest in the `X-LendLoop-Signature` header. The n8n Code node recalculates the digest using `crypto.createHmac('sha256', secret)` and performs a **constant-time comparison** (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
* **n8n &rarr; Convex (Overdue Fetch & Writeback):** When n8n triggers the scheduled overdue check and posts reminder writebacks, it signs the payload with the shared secret. Convex's `verifyHmacSignature` rejects any request lacking a valid signature with HTTP 401 Unauthorized.

### 3. Server-Enforced RBAC (No Reliance on UI Guards)
* Client-side UI conditional rendering is treated as a presentation convenience, not an access boundary.
* Roles (`admin` and `user`) are enforced directly inside Convex mutations and queries:
  * A regular `user` can only create, edit, and delete tools they own (`tool.ownerId === identity.subject`).
  * Only the tool owner can approve or decline an incoming borrow request.
  * Only an `admin` can delete another neighbor's listing, view all platform-wide loans, or grant/revoke the **"Trusted Lender"** badge.

### 4. Deterministic Idempotency & Fault Tolerance
* To prevent duplicate reminder emails or log spam during network retries, n8n generates a deterministic key:  
  `idempotencyKey = "overdue-${loanId}-${YYYY-MM-DD}"`.
* When writing back to `POST /record-reminder`, Convex queries the indexed `by_idempotencyKey` on the `automationLogs` table. If the key exists, it returns HTTP 200 with `idempotent: true` without duplicating records or incrementing reminder counters.
* The n8n setup includes an **Error Trigger Workflow** (`error_handler.json`), ensuring workflow failures are captured and surfaced rather than failing silently.

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* **Node.js** (v18.17+ or v20+)
* **Docker** and **Docker Compose**
* Free accounts on [Clerk](https://clerk.com/) and [Convex](https://convex.dev/)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ilhammu29/lendloop.git
cd lendloop
npm install
```

### 2. Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env.local
```

Fill in your respective credentials in `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex BaaS
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-convex-deployment

# n8n Automation & Security
LENDLOOP_WEBHOOK_SECRET=lendloop_super_secret_hmac_signing_key_32bytes_min
N8N_WEBHOOK_URL=http://localhost:5678/webhook/request-notification
CONVEX_SITE_URL=http://localhost:3000
```

### 3. Start Local n8n Instance (Docker Compose)
Run the self-hosted n8n container:
```bash
docker compose up -d
```
* n8n Web Console: **`http://localhost:5678`**
* Import the workflows from the `/n8n/workflows/` folder:
  1. `request_notification.json`
  2. `overdue_reminders.json`
  3. `error_handler.json`
* Activate each workflow in the n8n UI.

### 4. Run Convex Backend
In a separate terminal:
```bash
npx convex dev
```
*(On first run, this connects to your free Convex team/project and initializes the reactive database tables).*

### 5. Run Next.js Application
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to interact with LendLoop.

---

## 🧪 Verification & Testing Commands

* **TypeScript Compilation:**
  ```bash
  npx tsc --noEmit
  ```
* **Production Build:**
  ```bash
  npm run build
  ```
* **Linting:**
  ```bash
  npm run lint
  ```

---

## 📂 Project Structure

```
lendloop/
├── docker-compose.yml              # Self-hosted n8n container specification
├── .env.example                    # Clean environment variable blueprint
├── README.md                       # Architecture, security & setup guide
├── PRODUCTION_READINESS.md         # AWS cloud architecture, Datadog/Sentry observability
├── APPLICATION_LETTER.md           # Submission draft with mandatory canary keywords
├── n8n/
│   ├── README.md                   # Detailed n8n import & configuration manual
│   └── workflows/
│       ├── request_notification.json  # Webhook trigger, HMAC verification, notifications
│       ├── overdue_reminders.json     # Daily cron, signed fetch, idempotent writebacks
│       └── error_handler.json         # Global exception catcher & alert dispatcher
├── convex/
│   ├── schema.ts                   # Relational schema (users, tools, loans, logs)
│   ├── auth.config.ts              # Clerk JWT provider binding
│   ├── lib/
│   │   └── security.ts             # HMAC-SHA256 signer/verifier & RBAC guards
│   ├── tools.ts                    # Public minimized catalog & authenticated CRUD
│   ├── loans.ts                    # Borrow requests, approvals, returns, & bonus activity
│   ├── users.ts                    # User synchronization & admin role controls
│   ├── reminders.ts                # Overdue query logic & idempotent mutation
│   ├── http.ts                     # HTTP Router for /overdue-loans and /record-reminder
│   └── actions/
│       └── n8n.ts                  # Convex action dispatching HMAC signed events
└── src/
    ├── app/
    │   ├── layout.tsx              # Root layout with ClerkProvider & ConvexProvider
    │   ├── page.tsx                # Public catalog landing page (data minimization)
    │   ├── dashboard/page.tsx      # Main authenticated tool-lending catalog
    │   ├── my-tools/page.tsx       # "My Listings" management view
    │   ├── requests/page.tsx       # "Incoming Requests" & "My Requests" hub
    │   ├── admin/page.tsx          # Super Admin moderation & Trusted Lender controls
    │   └── globals.css             # Tailwind CSS styling
    ├── components/
    │   ├── Navbar.tsx              # Responsive navigation & role indicators
    │   ├── ToolCard.tsx            # Card component with availability & badge indicators
    │   ├── BorrowModal.tsx         # Date range selector & request submission
    │   ├── CreateToolModal.tsx     # Add tool form (name, category, condition)
    │   ├── AutomationBadge.tsx     # (Bonus) Live automation activity audit log badge
    │   └── ConvexClientProvider.tsx # Client-side auth & BaaS provider wrapper
    ├── lib/
    │   └── utils.ts                # Tailwind merge and date formatting utilities
    └── types/
        └── index.ts                # Strongly-typed models & category unions
```

---

## 🚀 Running in Production

To transition LendLoop to enterprise-grade production:
1. **Container Orchestration (AWS ECS / Fargate):** Deploy Next.js and n8n as isolated tasks inside private VPC subnets.
2. **Secrets & KMS:** Store all HMAC keys and API tokens in AWS Secrets Manager with 90-day automated rotation.
3. **Observability:** Instrument full-stack distributed tracing via **Sentry** and APM / synthetic monitoring with **Datadog**.
4. **Edge Security:** Front the platform with **Amazon CloudFront** + **AWS WAF** with rate limiting on webhook routes.

*See [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md) for the complete production specification.*

---

## 📄 License
MIT License. Built with ❤️ for Fluence International, Inc.
