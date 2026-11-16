"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Wrench,
  ShieldCheck,
  Menu,
  X,
  PlusCircle,
  LayoutGrid,
  Inbox,
  Lock,
  Radio,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const currentUser = useQuery(api.users?.getCurrentUser || ({} as any));
  const incomingRequests = useQuery(
    api.loans?.listIncomingRequests || ({} as any),
    isSignedIn ? {} : "skip"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const isTrustedLender = currentUser?.isTrustedLender;

  const pendingCount = (incomingRequests || []).filter(
    (req: any) => req.status === "pending"
  ).length;

  const navLinks = [
    { href: "/dashboard", label: "Browse Tools", icon: LayoutGrid, authOnly: true },
    { href: "/my-tools", label: "My Listings", icon: PlusCircle, authOnly: true },
    {
      href: "/requests",
      label: "Requests",
      icon: Inbox,
      authOnly: true,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin", icon: Lock, authOnly: true }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href={isSignedIn ? "/dashboard" : "/"}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/10 group-hover:scale-105 transition-all">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  LendLoop
                </span>
                <span className="hidden sm:block text-[11px] font-medium text-slate-500 -mt-1 tracking-tight">
                  Neighborhood Tool Sharing
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {isSignedIn && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-slate-900 text-white font-semibold shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                      {link.badge !== undefined && (
                        <span
                          className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-emerald-400 text-slate-950"
                              : "bg-emerald-600 text-white animate-pulse"
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Header: Badges & Auth */}
          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[11px] font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Convex Realtime</span>
              <span className="text-slate-300">•</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>n8n Webhook</span>
            </div>

            {isSignedIn ? (
              <div className="flex items-center gap-2.5">
                {isTrustedLender && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Trusted Lender
                  </span>
                )}
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    Admin
                  </span>
                )}

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-emerald-500/20",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Public Catalog
                </Link>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow transition-all">
                    Sign in to lend or borrow
                  </button>
                </SignInButton>
              </div>
            )}

            {/* Mobile menu toggle */}
            {isSignedIn && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isSignedIn && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-base font-medium ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {link.label}
                </div>
                {link.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          {/* Mobile badges */}
          <div className="pt-2 flex flex-wrap gap-2">
            {isTrustedLender && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Trusted Lender
              </span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                <Lock className="w-3.5 h-3.5" />
                Admin
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
