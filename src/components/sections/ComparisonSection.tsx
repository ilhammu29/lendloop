"use client";

import { Check, X, ShieldAlert, Sparkles } from "lucide-react";

export default function ComparisonSection() {
  const comparisons = [
    {
      feature: "Data Privacy & Data Minimization",
      lendloop: "Zero PII leaked; public catalog exposes only tool name & category. Addresses visible only on approved loan.",
      informal: "Full home addresses, phone numbers, and chat history exposed publicly in message threads.",
      commercial: "Mandatory corporate credit check, driver's license scans, and marketing spam.",
    },
    {
      feature: "Real-Time Availability Tracking",
      lendloop: "Instant Convex reactive sync; date-range conflict blocking prevents double-bookings.",
      informal: "Chaotic scrollback search; no way to know if a tool was returned or still in someone's garage.",
      commercial: "Store inventory often out of sync with actual shelf stock upon arrival.",
    },
    {
      feature: "Automated Overdue Lifecycle",
      lendloop: "n8n scheduled cron reminders with deterministic HMAC idempotency write-backs.",
      informal: "Awkward personal reminder messages or tools forgotten for 6+ months.",
      commercial: "Aggressive late fee penalties charged automatically to borrower's credit card.",
    },
    {
      feature: "Community Trust & Accountability",
      lendloop: "Trusted Community Lender verification, admin audit logs, and complete loan steppers.",
      informal: "No formal accountability or records if equipment is damaged or unreturned.",
      commercial: "Impersonal corporate transaction with heavy deposit holds ($200-$500).",
    },
    {
      feature: "Cost to Community Members",
      lendloop: "100% Free mutual community aid among verified neighborhood residents.",
      informal: "Free, but high risk of lost or neglected hardware.",
      commercial: "$75 - $150 per day plus mandatory damage waivers.",
    },
  ];

  return (
    <section id="comparison" className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Architectural Value Proposition
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why LendLoop Outperforms Informal Chats &amp; Big Box Rentals
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eliminate chaotic chat thread tracking and expensive corporate rental fees. LendLoop gives neighborhood equipment sharing the structure and reliability of an enterprise platform.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4 w-1/4">Key Capability</th>
                  <th className="px-6 py-4 w-1/3 bg-emerald-900/60 border-x border-emerald-800/60 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      LendLoop Platform
                    </span>
                  </th>
                  <th className="px-6 py-4 w-1/5 text-slate-300">Informal Chat Groups</th>
                  <th className="px-6 py-4 w-1/5 text-slate-300">Commercial Rental</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    {/* Capability Name */}
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      {row.feature}
                    </td>

                    {/* LendLoop (Highlight Column) */}
                    <td className="px-6 py-4 bg-emerald-50/40 border-x border-emerald-100 text-slate-900 font-semibold leading-relaxed">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.lendloop}</span>
                      </div>
                    </td>

                    {/* Informal Chat */}
                    <td className="px-6 py-4 text-slate-500 leading-relaxed">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{row.informal}</span>
                      </div>
                    </td>

                    {/* Commercial Rental */}
                    <td className="px-6 py-4 text-slate-500 leading-relaxed">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{row.commercial}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
