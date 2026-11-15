"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Layers,
  Clock,
  HeartHandshake,
} from "lucide-react";

export default function PublicLandingPage() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools?.listPublicTools || ({} as any));

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white py-16 md:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Neighborhood Tool-Lending Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Borrow what you need. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Lend what you don’t.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with your neighbors to share power tools, gardening gear, camping equipment, and more.
            Automated workflows keep every loan coordinated and on time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                Go to Member Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all">
                  Sign in to lend or borrow
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            )}
            <a
              href="#catalog"
              className="px-6 py-3.5 rounded-xl text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Browse Available Tools
            </a>
          </div>

          {/* Privacy Callout Banner (Data Minimization in action) */}
          <div className="mt-10 max-w-xl mx-auto p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong>Privacy Guaranteed:</strong> Tool owner details are protected by strict server-side data minimization until you sign in.
            </span>
          </div>
        </div>
      </section>

      {/* Public Catalog Section */}
      <section id="catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tools Currently Available in Your Community
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Public read-only inventory. Sign in to view full specs, owner badges, and request borrow dates.
            </p>
          </div>

          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4">
                Sign in to borrow &rarr;
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
                className="p-6 bg-white border border-slate-200 rounded-2xl animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : publicTools.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">
              No tools listed yet
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first neighbor to list a tool and start the lending loop!
            </p>
            <div className="mt-5">
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-emerald-600 text-white font-medium text-sm rounded-xl hover:bg-emerald-700">
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
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      {tool.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Available
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {tool.name}
                  </h3>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Sign in to view details
                  </span>
                  <SignInButton mode="modal">
                    <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                      Request Tool &rarr;
                    </button>
                  </SignInButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights Footer */}
      <section className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Trusted Community</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Reputable community members earn verified “Trusted Lender” badges through active participation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Automated Reminders</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Powered by n8n workflows that dispatch scheduled return reminders so no tool is forgotten.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Privacy & Security First</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Cryptographic HMAC signatures and strict RBAC ensure your personal data is protected at every layer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
