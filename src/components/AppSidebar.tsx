"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  LayoutGrid,
  PlusCircle,
  Inbox,
  ShieldCheck,
  Lock,
  Wrench,
  Menu,
  X,
  Plus,
} from "lucide-react";

interface AppSidebarProps {
  onOpenCreateTool?: () => void;
}

export default function AppSidebar({ onOpenCreateTool }: AppSidebarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const currentUser = useQuery(api.users?.getCurrentUser || ({} as any));
  const incomingRequests = useQuery(
    api.loans?.listIncomingRequests || ({} as any),
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";
  const isTrustedLender = currentUser?.isTrustedLender;

  const pendingCount = (incomingRequests || []).filter(
    (req: any) => req.status === "pending"
  ).length;

  const navItems = [
    {
      href: "/dashboard",
      label: "Browse Equipment",
      icon: LayoutGrid,
      description: "Community catalog",
    },
    {
      href: "/my-tools",
      label: "My Listings",
      icon: PlusCircle,
      description: "Manage your gear",
    },
    {
      href: "/requests",
      label: "Loan Requests",
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
      description: "Active loans & stepper",
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin Console",
            icon: Lock,
            description: "System & moderation",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Floating Menu Button (Visible on screens < 768px) */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>
          <div className="relative w-72 bg-white border-r border-slate-200 h-full p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-900 text-base">
                    LendLoop
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {onOpenCreateTool && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenCreateTool();
                  }}
                  className="w-full mb-4 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  List Equipment
                </button>
              )}

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserButton />
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">
                  {currentUser?.name || "Member"}
                </span>
              </div>
              {isTrustedLender && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                  Trusted
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Dedicated Stationary Fixed Sidebar (w-60, fixed top-16 left-0, completely stationary on scroll) */}
      <aside className="hidden md:flex flex-col justify-between w-60 bg-white border-r border-slate-200 fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 py-5 px-3">
        <div className="space-y-4">
          {/* Quick Add Equipment CTA */}
          {onOpenCreateTool && (
            <button
              onClick={onOpenCreateTool}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>List Equipment</span>
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
            <UserButton />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 block truncate">
                {currentUser?.name || "Community Member"}
              </span>
              <span className="text-[10px] text-slate-500 capitalize block truncate">
                {currentUser?.role || "Member"}
                {isTrustedLender && " • Trusted"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
