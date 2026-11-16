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
  ArrowRight,
  ChevronRight,
  Layers,
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
  const isLandingPage = pathname === "/";

  const pendingCount = (incomingRequests || []).filter(
    (req: any) => req.status === "pending"
  ).length;

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Equipment Catalog";
      case "/my-tools":
        return "My Shared Equipment";
      case "/requests":
        return "Loan Requests";
      case "/admin":
        return "Admin Console";
      default:
        return "Community Shed";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-all h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        {/* ================= LANDING PAGE NAVBAR ================= */}
        {isLandingPage ? (
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-950">
                  LendLoop
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  v2.0
                </span>
              </div>
            </Link>

            {/* Landing Anchor Nav Items */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a
                href="#catalog"
                className="hover:text-slate-950 transition-colors"
              >
                Public Inventory
              </a>
              <a
                href="#security"
                className="hover:text-slate-950 transition-colors"
              >
                Zero-Trust Specs
              </a>
              <a
                href="#comparison"
                className="hover:text-slate-950 transition-colors"
              >
                Why LendLoop
              </a>
            </nav>

            {/* Right Action */}
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-xs"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    href="#catalog"
                    className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950"
                  >
                    Catalog
                  </a>
                  <SignInButton mode="modal">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= DASHBOARD & APP NAVBAR ================= */
          <div className="flex justify-between items-center h-full">
            {/* Left: Breadcrumbs & Active Route Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-900 font-bold text-sm hover:text-emerald-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:inline font-extrabold tracking-tight">
                  LendLoop
                </span>
              </Link>

              <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />

              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {getPageTitle()}
              </span>
            </div>

            {/* Center: Realtime Telemetry Status */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-semibold text-slate-700">Convex Realtime</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>n8n Workflows Active</span>
              </div>
            </div>

            {/* Right: Badges & Profile */}
            <div className="flex items-center gap-3">
              {/* Requests Pending Indicator */}
              {pendingCount > 0 && (
                <Link
                  href="/requests"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <Inbox className="w-3.5 h-3.5 text-amber-600" />
                  <span>{pendingCount} Pending</span>
                </Link>
              )}

              {/* Roles */}
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <Lock className="w-3 h-3" />
                  Admin
                </span>
              )}

              {isTrustedLender && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Trusted
                </span>
              )}

              {/* Clerk User Button */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-lg ring-1 ring-slate-200",
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
