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
  ChevronRight,
  ChevronLeft,
  Wrench,
  Menu,
  X,
  ExternalLink,
  Plus,
} from "lucide-react";

interface AppSidebarProps {
  onOpenCreateTool?: () => void;
}

export default function AppSidebar({ onOpenCreateTool }: AppSidebarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
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
      description: "Community catalog & filters",
    },
    {
      href: "/my-tools",
      label: "My Listings",
      icon: PlusCircle,
      description: "Manage tools you own",
    },
    {
      href: "/requests",
      label: "Loan Requests",
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
      description: "Active loans & return stepper",
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin Console",
            icon: Lock,
            description: "Role audit & simulator",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Hamburger Floating Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
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
                  className="w-full mb-4 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  List New Equipment
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
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
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

      {/* Desktop Responsive Icon Sidebar (Compact by default w-16, Expands to w-64) */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`hidden md:flex flex-col justify-between bg-white border-r border-slate-200/90 py-5 transition-all duration-200 ease-in-out shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30 ${
          isExpanded ? "w-60 shadow-xl" : "w-16 shadow-xs"
        }`}
      >
        <div className="space-y-4 px-2.5">
          {/* Quick Add Equipment Button */}
          {onOpenCreateTool && (
            <button
              onClick={onOpenCreateTool}
              title="List New Equipment"
              className={`w-full inline-flex items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs ${
                isExpanded
                  ? "px-3.5 py-2.5 gap-2.5 justify-start text-xs"
                  : "w-11 h-11 justify-center mx-auto"
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {isExpanded && <span className="truncate">List Equipment</span>}
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`relative flex items-center rounded-xl transition-all ${
                    isExpanded
                      ? "px-3 py-2.5 gap-3 justify-start text-xs font-semibold"
                      : "w-11 h-11 justify-center mx-auto text-xs"
                  } ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  {isExpanded && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {!isExpanded && item.badge !== undefined && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="px-2.5 pt-4 border-t border-slate-100 space-y-2">
          {/* Toggle Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full flex items-center rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
              isExpanded ? "justify-between text-xs" : "justify-center"
            }`}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? (
              <>
                <span className="text-[11px] font-medium text-slate-500">
                  Collapse Sidebar
                </span>
                <ChevronLeft className="w-4 h-4" />
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* User Mini Profile */}
          {isExpanded && (
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
              <UserButton />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  {currentUser?.name || "Community Member"}
                </span>
                <span className="text-[10px] text-slate-500 capitalize block truncate">
                  {currentUser?.role || "Member"}
                  {isTrustedLender && " • Trusted"}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
