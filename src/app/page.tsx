"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import CategoryIcon from "../components/CategoryIcon";
import {
  Wrench,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Clock,
  CheckCircle2,
  Zap,
  Repeat,
  HeartHandshake,
} from "lucide-react";

export default function PublicLandingPage() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools?.listPublicTools || ({} as any));

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 lg:py-28">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Automated Neighborhood Circular Economy
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none max-w-4xl mx-auto">
            Borrow what you need. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Lend what you don’t.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A high-trust platform where neighbors share power tools, gardening gear, camping equipment, and lawnmowers with cryptographic HMAC verification and zero silent reminders.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-400/20 transition-all hover:scale-[1.02]"
              >
                Enter Community Shed
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-400/20 transition-all hover:scale-[1.02]">
                  Sign in to Lend or Borrow
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            )}

            <a
              href="#catalog"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
            >
              Explore Public Catalog
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-900">
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Automated Workflows</div>
            </div>
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-emerald-400">Zero PII</div>
              <div className="text-xs text-slate-400 mt-0.5">Public Minimization</div>
            </div>
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-teal-300">HMAC-SHA256</div>
              <div className="text-xs text-slate-400 mt-0.5">Signed Inter-service</div>
            </div>
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-cyan-400">Idempotent</div>
              <div className="text-xs text-slate-400 mt-0.5">Zero Reminder Spam</div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Catalog Section */}
      <section id="catalog" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Public Inventory
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Tools Available in Your Neighborhood
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read-only view protected by database data minimization. Sign in to view full specs, lender reputation, and reserve dates.
            </p>
          </div>

          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="text-sm font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-4">
                Sign in to borrow tools &rarr;
              </button>
            </SignInButton>
          )}
        </div>

        {/* Catalog List */}
        {publicTools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-60 bg-white border border-slate-200 rounded-3xl animate-pulse p-6 space-y-4"
              >
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-7 bg-slate-200 rounded w-3/4"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : publicTools.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              No tools listed in your community yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Be the first pioneer in your neighborhood to share an idle tool and kickstart the LendLoop circle!
            </p>
            <div className="pt-2">
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl hover:bg-emerald-600 transition-colors">
                  Sign in to List a Tool
                </button>
              </SignInButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicTools.map((tool: any) => (
              <div
                key={tool._id}
                className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <CategoryIcon category={tool.category} size="md" />
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-900 bg-emerald-100/80 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Available
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {tool.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-0.5">
                    {tool.name}
                  </h3>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Owner masked for privacy
                  </span>
                  <SignInButton mode="modal">
                    <button className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      Request <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </SignInButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Value Comparison Section */}
      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Engineered for Compliance, Privacy, & Reliability
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Why structured automation outperforms WhatsApp / Facebook neighborhood groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Zero Trust Data Privacy</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public visitors cannot scrape homeowner identities, personal phone numbers, or addresses. Strict data minimization enforced on Convex backend queries.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">n8n Overdue Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated daily cron jobs check overdue loans and dispatch polite return reminders with deterministic idempotency keys so no neighbor is ever spammed.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">HMAC-SHA256 Non-Repudiation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All inter-service webhooks are cryptographically signed and checked using constant-time algorithms (`timingSafeEqual`) to eliminate timing side-channel attacks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
