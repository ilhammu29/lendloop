"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import AutomationBadge from "../../components/AutomationBadge";
import LoanTimeline from "../../components/LoanTimeline";
import AppSidebar from "../../components/AppSidebar";
import { useToast } from "../../components/Toast";
import { LoanItem } from "../../types";
import { formatDate } from "../../lib/utils";
import {
  Inbox,
  Send,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Calendar,
  AlertCircle,
  Check,
  Sparkles,
  Wrench,
  ShieldCheck,
  User,
} from "lucide-react";

export default function RequestsPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  const incomingRequests = useQuery(api.loans?.listIncomingRequests || ({} as any));
  const myRequests = useQuery(api.loans?.listMyRequests || ({} as any));

  const respondToLoan = useMutation(api.loans?.respondToLoanRequest || ({} as any));
  const markReturned = useMutation(api.loans?.markLoanReturned || ({} as any));

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg">
        <Inbox className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to Access Requests
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Sign in to review equipment borrow requests from neighbors and manage active loans.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm">
            Sign In with Clerk
          </button>
        </SignInButton>
      </div>
    );
  }

  const handleRespond = async (loanId: string, action: "approve" | "decline") => {
    setActionLoading(loanId);
    try {
      await respondToLoan({
        loanId: loanId as any,
        action,
      });
      if (action === "approve") {
        toast.success("Borrow request approved! The borrower has been notified.", "Approved");
      } else {
        toast.info("Borrow request was declined.", "Declined");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update loan request.", "Action Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      await markReturned({ loanId: loanId as any });
      toast.success("Tool marked as returned! Ready for the next neighbor.", "Returned");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as returned.", "Action Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingIncoming = (incomingRequests || []).filter(
    (l: LoanItem) => l.status === "pending"
  ).length;

  const activeLoansCount = (incomingRequests || []).filter(
    (l: LoanItem) => l.status === "approved"
  ).length;

  const completedReturnsCount = (incomingRequests || []).filter(
    (l: LoanItem) => l.status === "returned"
  ).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Fixed Stationary Sidebar */}
      <AppSidebar />

      {/* Main Content Area (Offset for desktop fixed sidebar) */}
      <main className="md:pl-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Header & Metrics Summary Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Neighborhood Loan Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Borrow Requests & Activity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Track lifecycle steppers, manage equipment returns, and monitor automated n8n overdue reminder dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-center min-w-[95px]">
              <span className="text-[10px] text-amber-700 font-semibold uppercase block">Pending</span>
              <span className="text-base font-extrabold text-amber-900">{pendingIncoming}</span>
            </div>
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center min-w-[95px]">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Active Loans</span>
              <span className="text-base font-extrabold text-emerald-900">{activeLoansCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[95px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Completed</span>
              <span className="text-base font-extrabold text-slate-900">{completedReturnsCount}</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "incoming"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Inbox className="w-4 h-4" />
            Incoming Requests
            {pendingIncoming > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                {pendingIncoming}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "outgoing"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Send className="w-4 h-4" />
            My Borrow Requests ({myRequests?.length ?? 0})
          </button>
        </div>

        {/* Tab Content: Incoming Requests */}
        {activeTab === "incoming" && (
          <div className="space-y-4">
            {incomingRequests === undefined ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse p-6"
                  ></div>
                ))}
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No incoming requests right now
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When neighbors request to borrow your equipment, requests will appear here with scheduled dates and action buttons.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((loan: LoanItem) => (
                  <div
                    key={loan._id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {loan.toolName}
                          </h3>
                          <AutomationBadge
                            loanId={loan._id}
                            lastReminderSentAt={loan.lastReminderSentAt}
                            reminderCount={loan.reminderCount}
                          />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {loan.borrowerName}
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">{loan.borrowerEmail}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">
                            Period: {formatDate(loan.startDate)} to {formatDate(loan.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {loan.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleRespond(loan._id, "approve")}
                              disabled={actionLoading === loan._id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs disabled:opacity-50 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRespond(loan._id, "decline")}
                              disabled={actionLoading === loan._id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Decline
                            </button>
                          </>
                        )}

                        {loan.status === "approved" && (
                          <button
                            onClick={() => handleReturn(loan._id)}
                            disabled={actionLoading === loan._id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs disabled:opacity-50 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Mark Returned
                          </button>
                        )}

                        {loan.status === "returned" && (
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Returned & Inspected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Embedded Visual Stepper */}
                    <LoanTimeline
                      status={loan.status}
                      startDate={loan.startDate}
                      endDate={loan.endDate}
                      createdAt={loan.createdAt}
                      lastReminderSentAt={loan.lastReminderSentAt}
                    />

                    {/* Additional Notes */}
                    {loan.notes && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                        <strong className="text-slate-800">Borrower purpose:</strong> {loan.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Outgoing Requests */}
        {activeTab === "outgoing" && (
          <div className="space-y-4">
            {myRequests === undefined ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse p-6"
                  ></div>
                ))}
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
                <Send className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No active borrow requests
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse the community equipment catalog to borrow power tools, mowers, or camping gear from neighbors.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((loan: LoanItem) => (
                  <div
                    key={loan._id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {loan.toolName}
                          </h3>
                          <AutomationBadge
                            loanId={loan._id}
                            lastReminderSentAt={loan.lastReminderSentAt}
                            reminderCount={loan.reminderCount}
                          />
                        </div>

                        <p className="text-xs text-slate-500">
                          Scheduled Period: <strong className="text-slate-700">{formatDate(loan.startDate)} to {formatDate(loan.endDate)}</strong>
                        </p>
                      </div>

                      <div>
                        {loan.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Awaiting Owner Response
                          </span>
                        )}
                        {loan.status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Approved & Active
                          </span>
                        )}
                        {loan.status === "declined" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Declined by Owner
                          </span>
                        )}
                        {loan.status === "returned" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Successfully Returned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Embedded Stepper */}
                    <LoanTimeline
                      status={loan.status}
                      startDate={loan.startDate}
                      endDate={loan.endDate}
                      createdAt={loan.createdAt}
                      lastReminderSentAt={loan.lastReminderSentAt}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
