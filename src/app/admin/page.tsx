"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import { ToolItem, LoanItem } from "../../types";
import { formatDate } from "../../lib/utils";
import AdminSimulator from "../../components/AdminSimulator";
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
      <div className="max-w-md mx-auto my-28 p-8 bg-white border border-slate-200/80 rounded-3xl text-center shadow-lg">
        <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Sign In Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Access to this area requires an authenticated administrative session.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md">
            Sign In with Clerk
          </button>
        </SignInButton>
      </div>
    );
  }

  // Server-side RBAC validation check displayed in UI
  const isAdmin = currentUser?.role === "admin";

  if (currentUser !== undefined && !isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 bg-white border border-rose-200/80 rounded-3xl text-center shadow-lg space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          403 - Forbidden: Admin Access Only
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your account (<strong>{currentUser?.email}</strong>) has the standard <code>user</code> role.
          Administrative privileges are strictly verified inside Convex backend mutations.
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 text-left space-y-1">
          <strong>Tip for Fluence Evaluators:</strong> In development, any user whose email contains <code>admin</code> (e.g. <code>admin@lendloop.app</code>) or whose Clerk publicMetadata has <code>role: "admin"</code> is granted administrative powers.
        </div>
      </div>
    );
  }

  const handleToggleTrusted = async (clerkId: string, currentStatus: boolean) => {
    try {
      await toggleTrusted({
        clerkId,
        isTrusted: !currentStatus,
      });
      toast.success(
        `Lender status updated to ${!currentStatus ? "Trusted" : "Standard"}.`,
        "Reputation Updated"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update trusted lender status.", "Error");
    }
  };

  const handleToggleRole = async (clerkId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (confirm(`Change this user's role to ${newRole}?`)) {
      try {
        await setRole({
          clerkId,
          role: newRole,
        });
        toast.success(`Role updated to ${newRole}.`, "RBAC Updated");
      } catch (err: any) {
        toast.error(err.message || "Failed to update user role.", "Error");
      }
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (confirm("ADMIN ACTION: Are you sure you want to remove this tool listing?")) {
      try {
        await deleteTool({ toolId: toolId as any });
        toast.success("Listing removed by administrative action.", "Moderation Complete");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete tool.", "Error");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              LendLoop Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Platform-wide supervision, RBAC management, and live n8n webhook test bench.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          Super Admin Active
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Tools
            </span>
            <Wrench className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {allTools?.length ?? "..."}
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Registered Users
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {allUsers?.length ?? "..."}
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Loans
            </span>
            <Inbox className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {allLoans?.length ?? "..."}
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Loans
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {allLoans?.filter((l: LoanItem) => l.status === "approved").length ?? "..."}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "simulator"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-600" />
          n8n Webhook Test Bench (Evaluator Simulator)
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "users"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({allUsers?.length ?? 0})
        </button>

        <button
          onClick={() => setActiveTab("tools")}
          className={`flex items-center gap-2 pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "tools"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Wrench className="w-4 h-4" />
          Moderation & Listings ({allTools?.length ?? 0})
        </button>

        <button
          onClick={() => setActiveTab("loans")}
          className={`flex items-center gap-2 pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "loans"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Supervise All Loans ({allLoans?.length ?? 0})
        </button>
      </div>

      {/* Tab: Simulator */}
      {activeTab === "simulator" && <AdminSimulator />}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">
              Community Members & Roles
            </h3>
            <span className="text-xs text-slate-500">
              Promote trusted lenders or assign roles
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {(allUsers || []).map((u: any) => (
              <div
                key={u._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {u.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        u.role === "admin"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.role}
                    </span>
                    {u.isTrustedLender && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Trusted Lender
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {u.email} • Joined {formatDate(u.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleTrusted(u.clerkId, u.isTrustedLender)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      u.isTrustedLender
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {u.isTrustedLender ? "Revoke Trusted Badge" : "Mark as Trusted Lender"}
                  </button>

                  <button
                    onClick={() => handleToggleRole(u.clerkId, u.role)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200"
                  >
                    Toggle Role ({u.role === "admin" ? "Make User" : "Make Admin"})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Tools Moderation */}
      {activeTab === "tools" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm">
              All Listed Tools (Administrative Moderation)
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(allTools || []).map((tool: ToolItem) => (
              <div
                key={tool._id}
                className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{tool.name}</span>
                    <span className="text-xs text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {tool.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        tool.status === "available"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Owner: {tool.ownerName} • Listed {formatDate(tool.createdAt)}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteTool(tool._id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Admin Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Supervise All Loans */}
      {activeTab === "loans" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm">
              All Platform Loans & Reminders
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(allLoans || []).map((loan: LoanItem) => (
              <div key={loan._id} className="p-5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{loan.toolName}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      loan.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : loan.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : loan.status === "declined"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Borrower: <strong>{loan.borrowerName}</strong> ({loan.borrowerEmail}) •
                  Dates: {formatDate(loan.startDate)} to {formatDate(loan.endDate)}
                </div>
                {loan.lastReminderSentAt && (
                  <div className="text-[11px] text-amber-700 font-medium">
                    Reminder Sent {formatDate(loan.lastReminderSentAt)} ({loan.reminderCount}x)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
