# Production Readiness & Architecture Notes

This document details the architectural evolutions, cloud infrastructure, observability standards, and compliance considerations required to transition **LendLoop** from a local/staging prototype to an enterprise-grade, high-availability production platform.

---

## 1. Cloud Infrastructure & AWS Architecture

Fluence heavily leverages AWS for its B2B mental health and clinician stacks. The recommended target production architecture for LendLoop on AWS is outlined below:

```
                  +----------------------------------------------+
                  |         Amazon Route 53 (DNS & Failover)     |
                  +----------------------+-----------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |    Amazon CloudFront (Edge CDN & WAF)        |
                  |  - TLS 1.3 Termination                       |
                  |  - OWASP Top 10 Rate Limiting & Bot Control  |
                  +----------------------+-----------------------+
                                         |
                  +----------------------+-----------------------+
                  |                                              |
                  v                                              v
      +------------------------+                    +------------------------+
      |  Next.js Frontend      |                    |  n8n Orchestration     |
      |  AWS ECS / Fargate     |                    |  AWS ECS / Fargate     |
      |  (Auto-scaling 2..10)  |                    |  (Private Subnet)      |
      +-----------+------------+                    +-----------+------------+
                  |                                             |
                  +----------------------+----------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |      Convex Production Cloud / BaaS          |
                  |  - ACID Serverless Database                  |
                  |  - Real-time Reactivity                      |
                  |  - Automatic Zero-downtime Indexing          |
                  +----------------------+-----------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |         AWS KMS & Secrets Manager            |
                  |  - Automated Secret Rotation (HMAC & JWT)    |
                  |  - Envelope Encryption at Rest               |
                  +----------------------------------------------+
```

### Key Infrastructure Decisions:
1. **Containerized Workloads on AWS ECS (Fargate)**:
   - Deploy both the Next.js App Router application and n8n workers as managed containers on AWS ECS with AWS Fargate.
   - Fargate eliminates server management, enforces container isolation, and supports fine-grained IAM task execution roles.
2. **Private Networking (VPC & Subnets)**:
   - n8n should run inside **private subnets** with no direct ingress from the public internet. Inbound webhooks from Convex route through an AWS Application Load Balancer (ALB) or API Gateway with strict IP allowlisting and HMAC header verification.
3. **AWS KMS & AWS Secrets Manager**:
   - Environment variables (`CLERK_SECRET_KEY`, `LENDLOOP_WEBHOOK_SECRET`) should be loaded at runtime from AWS Secrets Manager using IAM Task Roles rather than baked into Docker images or plaintext environment files.
   - Support automated 90-day secret rotation for webhook signing keys with dual-secret grace periods.

---

## 2. Observability, Logging & Reliability (Datadog & Sentry)

To ensure zero silent failures across user workflows and automated pipelines:

1. **Distributed Tracing & Sentry Integration**:
   - Instrument Next.js with `@sentry/nextjs` for full-stack error tracking, unhandled promise rejection monitoring, and performance profiling.
   - Add custom tags for loan operations (`loan_id`, `event_type`, `user_role`) to correlate frontend friction with backend actions.
2. **Datadog APM & Structured JSON Logging**:
   - Standardize all server-side logging in JSON format (`timestamp`, `level`, `trace_id`, `service`, `message`, `metadata`).
   - Monitor Convex HTTP endpoint latencies and n8n webhook response codes (HTTP 4xx/5xx alert thresholds).
3. **Synthetic Monitoring**:
   - Implement Datadog Synthetics to run a daily health-check transaction:
     - Synthetic user signs in via Clerk.
     - Fetches `/overdue-loans` endpoint with valid HMAC signature.
     - Verifies 200 OK and valid JSON schema.

---

## 3. Security, Privacy & Healthcare Compliance (HIPAA / SOC 2 Alignment)

Although LendLoop is modeled as a neighborhood tool-lending board, applying healthcare-adjacent security safeguards reflects Fluence's production standards:

1. **Data Minimization & Public Exposure Prevention**:
   - The public `/` catalog strictly enforces data minimization at the database query layer (`listPublicTools`), preventing unauthorized scraping of neighbor identities or physical addresses.
2. **Cryptographic Integrity (HMAC SHA-256)**:
   - All asynchronous communications between Convex and n8n are sealed with HMAC-SHA256 signatures and checked with constant-time equality comparisons (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
3. **Deterministic Idempotency**:
   - Webhook retries and scheduled reminders generate deterministic idempotency keys (`overdue-${loanId}-${YYYY-MM-DD}`). The backend validates keys in an ACID transaction to prevent duplicate notifications or reminder spam.
4. **Audit Trail Immutability**:
   - The `automationLogs` table records every external trigger, payload summary, execution status, and timestamp, satisfying compliance auditability requirements.

---

## 4. Scalability & Resilience Enhancements

If LendLoop scales to thousands of neighborhoods:

1. **Dead Letter Queues (DLQ) & Circuit Breakers**:
   - If n8n or an external notification vendor (SendGrid/Discord) experiences downtime, failed events should automatically push to an Amazon SQS Dead Letter Queue with exponential backoff retries.
2. **Database Geospatial Indexing**:
   - Add latitude/longitude coordinates to `tools` and integrate Convex / PostGIS geospatial indexing to filter available tools within a 5-mile neighborhood radius.
3. **AI / LLM Production Features (AWS Bedrock)**:
   - Integrate AWS Bedrock (e.g. Claude 3.5 Sonnet / Haiku) with guardrails:
     - Automated condition assessment: Users upload a photo of a tool; Bedrock verifies whether it matches the stated condition (`good`, `fair`, `like-new`).
     - Natural Language Tool Assistant: "I need to build a wooden bookshelf this weekend; what tools should I borrow?"
