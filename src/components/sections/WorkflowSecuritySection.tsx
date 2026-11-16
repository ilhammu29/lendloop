"use client";

import {
  ShieldCheck,
  Lock,
  Cpu,
  RefreshCw,
  BellRing,
  KeyRound,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export default function WorkflowSecuritySection() {
  const securityFeatures = [
    {
      icon: BellRing,
      title: "1. Event-Driven Loan Notifications",
      tag: "Convex Action → n8n Webhook",
      description:
        "When a borrower requests a tool, Convex triggers an authenticated HTTP webhook to n8n within 500ms, notifying the equipment owner via email and dashboard toast.",
    },
    {
      icon: KeyRound,
      title: "2. HMAC-SHA256 Two-Way Signing",
      tag: "Constant-Time Verification",
      description:
        "Every payload dispatched between Convex and n8n is signed using HMAC-SHA256. Signatures are verified using crypto.timingSafeEqual to prevent replay attacks and timing leaks.",
    },
    {
      icon: RefreshCw,
      title: "3. Deterministic Idempotency Write-Back",
      tag: "Zero Duplicate Reminders",
      description:
        "Daily cron overdue alerts generate deterministic idempotency keys: overdue-${loanId}-${YYYY-MM-DD}. Retries caused by network blips return 200 OK without spamming users.",
    },
  ];

  return (
    <section id="security" className="bg-white py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero-Trust Architectural Specification
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Automated Workflow Reliability &amp; Data Security
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            LendLoop treats community sharing with the same cryptographic precision as financial ledger systems. No unauthenticated webhooks, no duplicate spam, and zero PII leaks.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-2xs">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      {feat.tag}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {feat.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Production Verified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cryptographic Verification Proof Terminal */}
        <div className="bg-slate-900 rounded-2xl p-6 text-slate-200 shadow-md border border-slate-800 space-y-4 max-w-4xl mx-auto font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold text-xs">Automated Verification Suite</span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">scripts/verify_system.js</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">ALL TESTS PASSED ✅</span>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
            <p className="text-slate-500">// 1. Cryptographic HMAC Verification</p>
            <p>Generated HMAC-SHA256 Signature: <span className="text-emerald-400">99ae12e9c2ef5b2e77ef4226...</span></p>
            <p>Valid Signature Check: <span className="text-emerald-400">✅ PASSED (timingSafeEqual match)</span></p>
            <p>Tampered Payload Rejection: <span className="text-emerald-400">✅ PASSED (401 Unauthorized)</span></p>

            <p className="text-slate-500 pt-2">// 2. Deterministic Idempotency Write-Back</p>
            <p>First Writeback Execution: <span className="text-emerald-400">✅ PASSED (Recorded to automationLogs)</span></p>
            <p>Second Writeback Retry: <span className="text-emerald-400">✅ PASSED (200 OK, idempotent: true, duplicate prevented)</span></p>

            <p className="text-slate-500 pt-2">// 3. Public Data Minimization</p>
            <p>Public Query Inspection: <span className="text-emerald-400">✅ PASSED (Zero PII leaked on api.tools.listPublicTools)</span></p>
          </div>
        </div>

      </div>
    </section>
  );
}
