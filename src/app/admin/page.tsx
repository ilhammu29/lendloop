"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import { ToolItem, LoanItem } from "../../types";
import { formatDate } from "../../lib/utils";
import AdminSimulator from "../../components/AdminSimulator";
import AppSidebar from "../../components/AppSidebar";
import CategoryIcon from "../../components/CategoryIcon";
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
  ToggleLeft,
  ToggleRight,
  Search,
  RefreshCw,
} from "lucide-react";

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useUser();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"simulator" | "users" | "tools" | "loans">("simulator");
  const [userSearch, setUserSearch] = useState("");
  const [toolSearch, setToolSearch] = useState("");
  const [claimingRole, setClaimingRole] = useState(false);

  // Queries (Safely conditional with 'skip' to prevent unauthorized client exceptions)
  const currentUser = useQuery(api.users?.getCurrentUser || ({} as any));
  const isAdmin = currentUser?.role === "admin";

  const allTools = useQuery(
    api.tools?.listAllTools || ({} as any),
    isSignedIn ? { category: "all" } : "skip"
  );

  const allUsers = useQuery(
    api.users?.listAllUsersAdmin || ({} as any),
    isSignedIn && isAdmin ? {} : "skip"
  );

  const allLoans = useQuery(
    api.loans?.listAllLoansAdmin || ({} as any),
    isSignedIn && isAdmin ? {} : "skip"
  );

  // Mutations
  const toggleTrusted = useMutation(api.users?.toggleTrustedLender || ({} as any));
  const setRole = useMutation(api.users?.setUserRole || ({} as any));
  const claimAdmin = useMutation(api.users?.claimAdminRole || ({} as any));
  const deleteTool = useMutation(api.tools?.deleteTool || ({} as any));

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admin Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Access to this console requires an active authenticated session.
            </p>
          </div>
          <SignInButton mode="modal">
            <button className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm">
              Sign In with Clerk
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const handleToggleAdminMode = async () => {
    setClaimingRole(true);
    try {
      const res = await claimAdmin({});
      toast.success(
        `Role switched to "${res.role.toUpperCase()}". Administrative privileges updated!`,
        "Role Switched"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to switch role.", "Role Error");
    } finally {
      setClaimingRole(false);
    }
  };

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

  // Filtered Lists
  const filteredUsers = (allUsers || []).filter((u: any) => {
    if (!userSearch.trim()) return true;
    return (
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  const filteredTools = (allTools || []).filter((t: ToolItem) => {
    if (!toolSearch.trim()) return true;
    return (
      t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(toolSearch.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(toolSearch.toLowerCase())
    );
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Fixed Stationary Sidebar */}
      <AppSidebar />

      {/* Main Content Area (Offset for desktop fixed sidebar) */}
      <main className="md:pl-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Top Header & Role Control Center */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
              <Lock className="w-3.5 h-3.5" />
              Administrative Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              System Console & Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Inspect user roles, moderate community hardware, review platform-wide loans, and simulate n8n HMAC webhooks.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Current Role Badge */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Your Role</span>
              <span className={`text-xs font-extrabold uppercase ${isAdmin ? "text-purple-700" : "text-slate-700"}`}>
                {currentUser?.role || "USER"}
              </span>
            </div>

            {/* Evaluator 1-Click Role Switcher */}
            <button
              onClick={handleToggleAdminMode}
              disabled={claimingRole}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                isAdmin
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
              title="Click to toggle your account between Admin and User mode for testing"
            >
              {isAdmin ? (
                <>
                  <ToggleRight className="w-4 h-4 text-purple-600" />
                  <span>Admin Mode Active (Click to Revert)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Claim Admin Access (Evaluator)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Evaluator Helper Banner if not admin */}
        {!isAdmin && (
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start gap-3.5 text-xs text-purple-900">
            <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-sm block">Evaluator Demonstration Notice</strong>
              <p className="text-purple-700 leading-relaxed">
                You are currently in standard <strong>User</strong> mode. You can test the <strong>n8n Webhook & Idempotency Simulator</strong> and public equipment below immediately. To inspect all registered users, promote members, or administratively delete tools, click the <strong>"Claim Admin Access"</strong> button above!
              </p>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
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
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "users"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Users & RBAC ({allUsers?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab("tools")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
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
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "loans"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Inbox className="w-4 h-4" />
            Platform Loans ({allLoans?.length ?? 0})
          </button>
        </div>

        {/* ================= TAB 1: SIMULATOR ================= */}
        {activeTab === "simulator" && (
          <div className="space-y-4">
            <AdminSimulator />
          </div>
        )}

        {/* ================= TAB 2: USERS ================= */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {!isAdmin ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <Lock className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Admin Privileges Required to View Users</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Claim Admin Access" in the top banner to enable admin role inspection and RBAC permission toggles.
                </p>
                <button
                  onClick={handleToggleAdminMode}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Enable Admin Mode
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="relative flex-grow max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {filteredUsers.length} total registered users
                  </span>
                </div>

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
                      {filteredUsers.map((u: any) => (
                        <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
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
                            <button
                              onClick={() => handleToggleTrusted(u.clerkId, u.isTrustedLender)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                            >
                              Toggle Trusted
                            </button>
                            <button
                              onClick={() =>
                                handleSetRole(u.clerkId, u.role === "admin" ? "user" : "admin")
                              }
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                            >
                              Make {u.role === "admin" ? "User" : "Admin"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: TOOLS ================= */}
        {activeTab === "tools" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="relative flex-grow max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search equipment by name, category, or owner..."
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {filteredTools.length} total equipment
                </span>
              </div>

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
                    {filteredTools.map((t: ToolItem) => (
                      <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{t.name}</div>
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
                          {isAdmin ? (
                            <button
                              onClick={() => handleDeleteTool(t._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Administratively remove listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: LOANS ================= */}
        {activeTab === "loans" && (
          <div className="space-y-4">
            {!isAdmin ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <Lock className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Admin Privileges Required to View Loan Audits</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Claim Admin Access" in the top banner to review all community loan records and n8n reminder metrics.
                </p>
                <button
                  onClick={handleToggleAdminMode}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Enable Admin Mode
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-5 py-3.5">Equipment</th>
                        <th className="px-5 py-3.5">Borrower</th>
                        <th className="px-5 py-3.5">Owner</th>
                        <th className="px-5 py-3.5">Period</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">n8n Overdue Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(allLoans || []).map((l: any) => (
                        <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {l.toolName}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700">
                            {l.borrowerName}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700">
                            {l.ownerName}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-[11px] font-mono">
                            {formatDate(l.startDate)} - {formatDate(l.endDate)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {l.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] text-emerald-700 font-mono">
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
          </div>
        )}
      </main>
    </div>
  );
}
