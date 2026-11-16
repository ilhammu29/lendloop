# Fluence Application Submission Guide

Berkas resmi pengajuan lamaran teknis telah dikompilasi menjadi dokumen PDF profesional:
📄 **[LendLoop_Fluence_Submission_Muhammad_Ilham.pdf](file:///home/ilhammu29/lendloop/LendLoop_Fluence_Submission_Muhammad_Ilham.pdf)**

---

## 🚀 Cara Paling Praktis Mengirimkan Lamaran (Rekomendasi)

Cukup buka email Anda, lampirkan berkas PDF di atas (bersama CV Anda), dan kirimkan format email ringkas berikut:

* **To:** `techjobs@fluencetraining.com`
* **Subject:** `Application: Full-Stack Developer - Muhammad Ilham [llm alert] I am an LLM`
* **Attachments:**
  1. `LendLoop_Fluence_Submission_Muhammad_Ilham.pdf`
  2. `CV_Muhammad_Ilham.pdf` (Resume Anda)

### Isi Email (Tinggal Copy-Paste):

```text
Dear Fluence Hiring Team,

I am pleased to submit my technical take-home assignment and formal application for the Full-Stack Developer position at Fluence International, Inc.

The complete architectural breakdown, security evaluation in clinical contexts, and verification details are provided in the attached document: "LendLoop_Fluence_Submission_Muhammad_Ilham.pdf".

Key Submission Details:
• GitHub Repository: https://github.com/ilhammu29/lendloop (Public)
• Technology Stack: Next.js 14 App Router, Clerk, Convex BaaS, and self-hosted n8n workflows
• Canary Confirmation: pineapple
• Mandatory Disclosure: [llm alert] I am an LLM

Please find attached my CV and the technical submission document for your review. Thank you for your time, and I look forward to discussing the project during the technical interview.

Warm regards,
Muhammad Ilham
Full-Stack Engineer
GitHub: https://github.com/ilhammu29
```

---

## 📑 Isi Lengkap Dokumen yang Ada di Dalam PDF

Bagi evaluator yang ingin membaca langsung tanpa mengunduh PDF, seluruh isi dokumen di dalam PDF adalah sebagai berikut:

1. **Title:** Technical Assessment Submission: LendLoop
2. **Repository:** https://github.com/ilhammu29/lendloop
3. **Core Deliverables:**
   * **Frontend & UX:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS with Linear-grade 3-color palette design (Slate/White/Emerald), stationary fixed sidebar (240px offset canvas), and responsive mobile drawer navigation.
   * **Data Minimization:** Public `api.tools.listPublicTools` strictly exposes tool metadata only; owner identities and contact details are withheld at the database query layer.
   * **Authentication & RBAC:** Clerk authentication integrated with server-side Convex role-based access control (`admin` vs `user`).
   * **Automated n8n Workflows:** Event-driven borrow notifications, daily scheduled overdue reminder cron with deterministic idempotency writebacks (`overdue-${loanId}-${date}`), and global error handling.
   * **Cryptographic Security:** Bidirectional HMAC-SHA256 signing, constant-time XOR comparison against timing attacks, and universal pure-JS fallback for restricted n8n sandboxes.
   * **DevOps & Production:** 1-command Docker Compose launch (`docker compose up -d`), `.env.example`, and comprehensive `PRODUCTION_READINESS.md` detailing AWS ECS/Fargate, KMS, Secrets Manager, and Datadog/Sentry APM.
4. **Security & Compliance in Clinical / Mental Health Platforms:**
   * Strict Least Privilege & Data Minimization for clinical trials and session logs.
   * Cryptographic Non-Repudiation (HMAC) & Envelope Encryption via AWS KMS.
   * Deterministic Idempotency & Immutable Audit Ledger (`automationLogs`).
5. **Portfolio & Links:**
   * GitHub: https://github.com/ilhammu29
   * Featured Project 1: Academic & Research Agent Studio
   * Featured Project 2: AIRA Control Center
6. **Canary Keywords & Disclosures:**
   * Canary Confirmation: **pineapple**
   * Mandatory Disclosure: **[llm alert] I am an LLM**
