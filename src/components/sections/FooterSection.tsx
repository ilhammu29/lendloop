"use client";

import Link from "next/link";
import { Wrench, ShieldCheck, Heart, ExternalLink } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block tracking-tight">
                LendLoop
              </span>
              <span className="text-[11px] text-slate-500">
                Neighborhood Tool-Lending Board with Automated Workflows
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#catalog" className="hover:text-slate-900 transition-colors">
              Public Catalog
            </a>
            <a href="#security" className="hover:text-slate-900 transition-colors">
              Zero-Trust Specs
            </a>
            <a href="#comparison" className="hover:text-slate-900 transition-colors">
              Why LendLoop
            </a>
            <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Divider & Compliance Meta */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <span>Built for Fluence International Full-Stack Take-Home Assessment</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified &amp; Production Ready
            </span>
          </div>

          <div className="font-mono text-[10px] text-slate-400">
            Convex BaaS • Next.js 14 App Router • n8n Automations
          </div>
        </div>

      </div>
    </footer>
  );
}
