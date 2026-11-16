#!/usr/bin/env python3
import os
import weasyprint

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Technical Assessment Submission - Muhammad Ilham</title>
<style>
  @page {
    size: A4;
    margin: 20mm 18mm 20mm 18mm;
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font-size: 8pt;
      color: #64748b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    @bottom-left {
      content: "Fluence International, Inc. • Full-Stack Developer Take-Home";
      font-size: 8pt;
      color: #64748b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    font-size: 9.5pt;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }

  .header {
    border-bottom: 2px solid #0f172a;
    padding-bottom: 12px;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .header h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
  }

  .header .subtitle {
    font-size: 10pt;
    color: #059669;
    font-weight: 700;
    margin: 0;
  }

  .meta-box {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 8.5pt;
  }

  .meta-grid {
    display: table;
    width: 100%;
  }

  .meta-row {
    display: table-row;
  }

  .meta-label {
    display: table-cell;
    width: 18%;
    font-weight: 700;
    color: #475569;
    padding: 2px 0;
  }

  .meta-val {
    display: table-cell;
    width: 82%;
    color: #0f172a;
    padding: 2px 0;
  }

  h2 {
    font-size: 11.5pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 14px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    margin: 0 0 8px 0;
  }

  ul {
    margin: 0 0 10px 0;
    padding-left: 18px;
  }

  li {
    margin-bottom: 4px;
  }

  .callout {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 4px solid #059669;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 12px 0;
    font-size: 9pt;
  }

  .callout-title {
    font-weight: 800;
    color: #065f46;
    margin-bottom: 4px;
  }

  .canary-box {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #0f172a;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 14px 0;
    font-size: 9pt;
  }

  .canary-token {
    display: inline-block;
    background-color: #0f172a;
    color: #ffffff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8.5pt;
  }

  .canary-token-alert {
    display: inline-block;
    background-color: #059669;
    color: #ffffff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8.5pt;
  }

  .tech-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 12px 0;
    font-size: 8.5pt;
  }

  .tech-table th {
    background-color: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 6px 10px;
    font-weight: 700;
  }

  .tech-table td {
    border-bottom: 1px solid #e2e8f0;
    padding: 6px 10px;
    vertical-align: top;
  }

  .tech-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  .link {
    color: #059669;
    text-decoration: none;
    font-weight: 600;
  }

  .signature-block {
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>TECHNICAL ASSESSMENT SUBMISSION</h1>
    <div class="subtitle">LendLoop: Neighborhood Tool-Lending Board with Automated Workflows</div>
  </div>
</div>

<div class="meta-box">
  <div class="meta-grid">
    <div class="meta-row">
      <div class="meta-label">Position:</div>
      <div class="meta-val">Full-Stack Developer</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Recipient:</div>
      <div class="meta-val">Fluence International, Inc. (techjobs@fluencetraining.com)</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Candidate:</div>
      <div class="meta-val"><strong>Muhammad Ilham</strong> &bull; <a href="https://github.com/ilhammu29" class="link">github.com/ilhammu29</a></div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Repository:</div>
      <div class="meta-val"><a href="https://github.com/ilhammu29/lendloop" class="link">https://github.com/ilhammu29/lendloop</a> (Public, MIT Licensed)</div>
    </div>
  </div>
</div>

<p>Dear Fluence Hiring Team,</p>
<p>
I am pleased to submit my technical take-home assignment and formal application for the Full-Stack Developer position at Fluence International, Inc. Below is a structured architectural walkthrough of <strong>LendLoop</strong>, an in-depth security and compliance evaluation tailored to clinical healthcare contexts, my engineering portfolio, and the mandatory verification tokens.
</p>

<h2>1. Core Deliverables & Architectural Highlights</h2>

<table class="tech-table">
  <thead>
    <tr>
      <th style="width: 25%;">Layer</th>
      <th style="width: 35%;">Technologies</th>
      <th style="width: 40%;">Architectural Highlights</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend & UX</strong></td>
      <td>Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS</td>
      <td>Linear-grade 3-color palette design (Slate/White/Emerald). Fixed stationary sidebar (240px offset canvas). Mobile-responsive drawer navigation. 100% English interface.</td>
    </tr>
    <tr>
      <td><strong>Data Minimization</strong></td>
      <td>Convex BaaS (Serverless Database & Realtime Sync)</td>
      <td>Public <code>api.tools.listPublicTools</code> query strictly isolates equipment metadata; owner names, addresses, and contacts are withheld at the database query layer.</td>
    </tr>
    <tr>
      <td><strong>Authentication & RBAC</strong></td>
      <td>Clerk (Core 3 / v7 SDK) + Convex RBAC</td>
      <td>Server-side validation for <code>admin</code> vs <code>user</code> enforced within Convex mutations. Evaluator 1-click test switcher locked in production.</td>
    </tr>
    <tr>
      <td><strong>Asynchronous Automations</strong></td>
      <td>n8n Workflow Engine (Self-hosted Docker)</td>
      <td>Event-driven borrow notifications, daily scheduled overdue reminder cron with deterministic idempotency writebacks (<code>overdue-${loanId}-${date}</code>), and global error interception.</td>
    </tr>
    <tr>
      <td><strong>Cryptographic Security</strong></td>
      <td>HMAC-SHA256 & Timing-Safe Equality</td>
      <td>Two-way HMAC signing. Constant-time comparison (<code>crypto.timingSafeEqual</code> and in-runtime XOR) to eliminate timing side-channels. Universal pure-JS fallback for restricted n8n sandboxes.</td>
    </tr>
    <tr>
      <td><strong>DevOps & Production</strong></td>
      <td>Docker Compose, AWS ECS/Fargate Blueprint</td>
      <td>One-command Docker launch (<code>docker compose up -d</code>). Comprehensive <code>PRODUCTION_READINESS.md</code> detailing AWS KMS, Secrets Manager, Datadog APM, and Sentry.</td>
    </tr>
  </tbody>
</table>

<h2>2. Security & Compliance in Clinical / Mental Health Platforms</h2>
<p>
In clinical mental health, clinical research, or psychedelic-assisted therapy platforms where Protected Health Information (PHI) and session telemetry are processed, application security requires <strong>Zero Trust Architecture</strong> and <strong>Defense in Depth</strong>:
</p>
<ul>
  <li><strong>Strict Data Minimization & Least Privilege:</strong> Clinicians, researchers, and administrators must only access the minimum necessary data required for their specific workflow. Public routes must never receive decrypted user identifiers or medical notes.</li>
  <li><strong>Cryptographic Non-Repudiation & Envelope Encryption:</strong> As demonstrated in the LendLoop n8n integration, all inter-service webhooks must be cryptographically signed with HMAC-SHA256 and verified using constant-time algorithms. Data at rest must be encrypted with envelope keys managed via AWS KMS with per-tenant separation.</li>
  <li><strong>Deterministic Idempotency & Immutable Audit Trails:</strong> Automated workflows (such as reminder dispatches, session transcript exports, or billing cycles) must enforce deterministic idempotency keys to guarantee that network retries never produce duplicate patient notifications or record corruption. Every state transition must write to an append-only audit ledger (<code>automationLogs</code> / AWS CloudTrail).</li>
</ul>

<h2>3. Relevant Projects & Engineering Portfolio</h2>
<ul>
  <li><strong>GitHub Profile:</strong> <a href="https://github.com/ilhammu29" class="link">https://github.com/ilhammu29</a></li>
  <li><strong>Featured Project 1 — Academic & Research Agent Studio:</strong> Multi-agent knowledge processing and orchestration platform integrating robust validation pipelines and LLM guardrails.</li>
  <li><strong>Featured Project 2 — AIRA Control Center:</strong> Real-time infrastructure management and telemetry interface with role-based permissions and asynchronous event handling.</li>
</ul>

<h2>4. Mandatory Disclosures & Canary Verifications</h2>
<div class="canary-box">
  <p style="margin: 0 0 6px 0;"><strong>Instructions Compliance & Canary Confirmation:</strong></p>
  <p style="margin: 0 0 8px 0;">
    As requested in the job description to confirm careful, end-to-end reading: <span class="canary-token">pineapple</span>
  </p>
  <p style="margin: 0 0 4px 0;"><strong>Mandatory Transparency Disclosure:</strong></p>
  <p style="margin: 0;">
    <span class="canary-token-alert">[llm alert] I am an LLM</span> (assisted with code architecture, test harness generation, and technical documentation synthesis).
  </p>
</div>

<div class="signature-block">
  <p style="margin: 0 0 4px 0;">Thank you for your time, consideration, and the opportunity to build LendLoop. I look forward to walking through the architecture during the technical interview.</p>
  <p style="margin: 6px 0 0 0;">
    <strong>Muhammad Ilham</strong><br>
    Full-Stack Engineer &bull; <a href="https://github.com/ilhammu29" class="link">github.com/ilhammu29</a>
  </p>
</div>

</body>
</html>
"""

output_path = "/home/ilhammu29/lendloop/LendLoop_Fluence_Submission_Muhammad_Ilham.pdf"
print(f"Generating PDF via WeasyPrint at: {output_path} ...")
weasyprint.HTML(string=html_content).write_pdf(output_path)
print(f"✅ SUCCESS: PDF generated successfully ({os.path.getsize(output_path)} bytes)")
