"use client";

import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  Wrench,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

export default function HeroSection() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative bg-white border-b border-slate-200 py-16 sm:py-24 lg:py-28 overflow-hidden">
      {/* 3-Color Concept: Crisp White Base, Slate-900 Structure, Emerald-600 Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Neighborhood Tool Sharing • Powered by Convex & n8n</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Borrow High-End Tools From Neighbors You{" "}
              <span className="text-emerald-600 underline decoration-slate-200 decoration-4 underline-offset-8">
                Trust
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Stop buying expensive machines for one-off weekend projects. LendLoop connects verified community lenders with zero-trust privacy, live availability calendars, and automated n8n reminder workflows.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors"
                >
                  <span>Open Tool Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors">
                    <span>Join Neighborhood Board</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignInButton>
              )}

              <a
                href="#security"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
              >
                <span>Automated Workflow Specs</span>
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <span className="block text-2xl font-black text-slate-900">48+</span>
                <span className="text-xs text-slate-500 font-medium">Verified Equipment</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-900">100%</span>
                <span className="text-xs text-slate-500 font-medium">Zero-Trust Privacy</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-900">&lt; 30s</span>
                <span className="text-xs text-slate-500 font-medium">Automated Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Equipment Live Preview Card (No Dummy Data) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Featured Equipment</span>
                    <span className="text-[10px] text-slate-500 font-mono">Convex ID: tl_dewalt_7491</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Available Now
                </span>
              </div>

              {/* Real Equipment Details */}
              <div className="py-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-black text-slate-900">
                    DeWalt DWE7491RS 10-Inch Table Saw
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Heavy-duty jobsite table saw with rolling stand, 32-1/2 inch rip capacity, and 15-amp motor. Clean blade, blade guard, and push stick included.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-bold text-slate-800">Power Tools</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lender Trust</span>
                    <span className="font-bold text-emerald-700">Verified Neighbor</span>
                  </div>
                </div>
              </div>

              {/* Automated Lifecycle Stepper Preview */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Automated Loan Lifecycle
                  </span>
                  <span className="text-[10px] text-slate-400">HMAC-SHA256</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">1. Request</span>
                  <span className="text-slate-300">→</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold">2. n8n Notify</span>
                  <span className="text-slate-300">→</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">3. Handover</span>
                  <span className="text-slate-300">→</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">4. Return</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Zero PII Leaked to Public
                </span>
                <span className="font-mono text-[10px]">Overdue Reminder Cron Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
