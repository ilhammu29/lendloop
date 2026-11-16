"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import { ToolItem, LoanItem } from "../../types";
import { formatDate } from "../../lib/utils";
import AdminSimulator from "../../components/AdminSimulator";
import AppSidebar from "../../components/AppSidebar";
import { useToast } from "../../components/Toast";
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Users,
  Wrench,
  Inbox,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export default function AdminPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();
  const currentUser = useQuery(api.users?.getCurrentUser || ({} as any));

  const allTools = useQuery(api.tools?.listAllTools || ({} as any), { category: "all" });
  const allUsers = useQuery(api.users?.listAllUsersAdmin || ({} as any));
  const allLoans = useQuery(api.loans?.listAllLoansAdmin || ({} as any));

  const toggleTrusted = useMutation(api.users?.toggleTrustedLender || ({} as any));
  const setRole = useMutation(api.users?.setUserRole || ({} as any));
  const deleteTool = useMutation(api.tools?.deleteTool || ({} as any));

  const [activeTab, setActiveTab] = useState<"simulator" | "users" | "tools" | "loans">("simulator");

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg">
        <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Admin Sign In Required
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Access to this management console requires an authenticated administrative session.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm">
            Sign In with Clerk
          </button>
        </SignInButton>
      </div>
    );
  }

  // Server-side RBAC validation check displayed in UI
  const isAdmin = currentUser?.role === "admin";

  const handleToggleTrusted = async (clerkId: string, currentStatus: boolean) => {
    try {
      await toggleTrusted({ clerkId, isTrusted: !currentStatus });
      toast.success("Trusted Lender status updated.", "Permissions Updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update trusted status.", "Permission Error");
    }
  };

  const handleSetRole = async (clerkId: string, newRole: "admin" | "user") => {
    try {
      await setRole({ clerkId, role: newRole });
      toast.success(`User role updated to ${newRole}.`, "Role Assigned");
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.", "Permission Error");
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (confirm("Are you sure you want to administratively remove this listing?")) {
      try {
        await deleteTool({ toolId: toolId as any });
        toast.success("Listing removed administratively.", "Removed");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete tool.", "Error");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Responsive Collapsible Icon Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Administrative Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Role-based access control, content moderation, and n8n webhook simulators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: {currentUser?.role?.toUpperCase() || "USER"}
            </span>
          </div>
        </div>

        {/* Access Warning if not admin */}
        {!isAdmin && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Read-Only Evaluator Mode</strong>
              <span>
                Your current account is assigned the "user" role. You can inspect platform metrics and run the interactive n8n simulator below, but administrative mutation privileges require the "admin" role.
              </span>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "simulator"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Webhook & Idempotency Simulator
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "users"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Users & Roles ({allUsers?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab("tools")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "tools"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4" />
            All Equipment ({allTools?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab("loans")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "loans"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Inbox className="w-4 h-4" />
            All Loan Records ({allLoans?.length ?? 0})
          </button>
        </div>

        {/* Tab 1: Simulator */}
        {activeTab === "simulator" && (
          <div className="space-y-4">
            <AdminSimulator />
          </div>
        )}

        {/* Tab 2: Users */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Name / Email</th>
                    <th className="px-5 py-3.5">System Role</th>
                    <th className="px-5 py-3.5">Trusted Lender</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(allUsers || []).map((u: any) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.isTrustedLender ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Trusted
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleToggleTrusted(u.clerkId, u.isTrustedLender)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                            >
                              Toggle Trusted
                            </button>
                            <button
                              onClick={() =>
                                handleSetRole(u.clerkId, u.role === "admin" ? "user" : "admin")
                              }
                              className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                            >
                              Make {u.role === "admin" ? "User" : "Admin"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tools */}
        {activeTab === "tools" && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Equipment</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Owner</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(allTools || []).map((t: ToolItem) => (
                    <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{t.name}</div>
                        <div className="text-slate-400 text-[11px] line-clamp-1">
                          {t.description}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 capitalize font-medium text-slate-700">
                        {t.category}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {t.ownerName}
                      </td>
                      <td className="px-5 py-3.5">
                        {t.status === "available" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            On Loan
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteTool(t._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Remove listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Loans */}
        {activeTab === "loans" && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Equipment</th>
                    <th className="px-5 py-3.5">Borrower</th>
                    <th className="px-5 py-3.5">Owner</th>
                    <th className="px-5 py-3.5">Period</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Automations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(allLoans || []).map((l: any) => (
                    <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {l.toolName}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {l.borrowerName}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {l.ownerName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        {formatDate(l.startDate)} - {formatDate(l.endDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {l.reminderCount || 0} reminders dispatched
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
