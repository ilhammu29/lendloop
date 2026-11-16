"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import AutomationBadge from "../../components/AutomationBadge";
import LoanTimeline from "../../components/LoanTimeline";
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
      <div className="max-w-md mx-auto my-28 p-8 bg-white border border-slate-200/80 rounded-3xl text-center shadow-lg">
        <Inbox className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to Access</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Sign in to review borrow requests from neighbors and manage your active tool loans.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md">
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
        toast.success(
          "Request approved! Tool status updated to 'borrowed' and n8n notification sent to borrower.",
          "Loan Approved"
        );
      } else {
        toast.info("Request declined. Borrower notified via automated webhook.", "Request Declined");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to respond to request.", "Error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (loanId: string) => {
    if (confirm("Confirm that this tool has been returned in good condition?")) {
      setActionLoading(loanId);
      try {
        await markReturned({
          loanId: loanId as any,
        });
        toast.success(
          "Tool returned to community pool! Status restored to 'available'.",
          "Loan Completed"
        );
      } catch (err: any) {
        toast.error(err.message || "Failed to mark as returned.", "Error");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const pendingIncomingCount = (incomingRequests || []).filter(
    (l: LoanItem) => l.status === "pending"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Community Circulation
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Requests & Active Loans
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review borrow requests for your equipment and track the return timeline of tools you borrowed.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-px">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`flex items-center gap-2 pb-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "incoming"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Requests
          {pendingIncomingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-600 text-white font-extrabold animate-pulse">
              {pendingIncomingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("outgoing")}
          className={`flex items-center gap-2 pb-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "outgoing"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Send className="w-4 h-4" />
          My Borrow Requests
        </button>
      </div>

      {/* Tab 1: Incoming Requests */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingRequests === undefined ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 bg-white rounded-3xl border border-slate-200 animate-pulse"
                ></div>
              ))}
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No incoming requests yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When neighbors request to borrow tools you listed, they will appear here with one-click approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((loan: LoanItem) => (
                <div
                  key={loan._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-lg">
                          {loan.toolName}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
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

                        {/* Automation activity badge */}
                        <AutomationBadge
                          loanId={loan._id}
                          lastReminderSentAt={loan.lastReminderSentAt}
                          reminderCount={loan.reminderCount}
                        />
                      </div>

                      <p className="text-xs text-slate-600">
                        Requested by <strong className="text-slate-900">{loan.borrowerName}</strong> ({loan.borrowerEmail})
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {loan.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleRespond(loan._id, "approve")}
                            disabled={actionLoading === loan._id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            Approve Loan
                          </button>
                          <button
                            onClick={() => handleRespond(loan._id, "decline")}
                            disabled={actionLoading === loan._id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline
                          </button>
                        </>
                      )}

                      {loan.status === "approved" && (
                        <button
                          onClick={() => handleReturn(loan._id)}
                          disabled={actionLoading === loan._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Mark Returned
                        </button>
                      )}

                      {loan.status === "returned" && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
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
                    reminderCount={loan.reminderCount}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Borrow Requests */}
      {activeTab === "outgoing" && (
        <div className="space-y-4">
          {myRequests === undefined ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 bg-white rounded-3xl border border-slate-200 animate-pulse"
                ></div>
              ))}
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-2">
              <Send className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                You haven't requested any tools yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the community shed to borrow equipment from your neighbors.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((loan: LoanItem) => (
                <div
                  key={loan._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-lg">
                          {loan.toolName}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
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

                        <AutomationBadge
                          loanId={loan._id}
                          lastReminderSentAt={loan.lastReminderSentAt}
                          reminderCount={loan.reminderCount}
                        />
                      </div>

                      <div className="text-xs text-slate-500">
                        Duration: {formatDate(loan.startDate)} &rarr; {formatDate(loan.endDate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {loan.status === "approved" && (
                        <button
                          onClick={() => handleReturn(loan._id)}
                          disabled={actionLoading === loan._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Return Tool
                        </button>
                      )}

                      {loan.status === "pending" && (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          Waiting for owner approval
                        </span>
                      )}

                      {loan.status === "returned" && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Loan Complete
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
                    reminderCount={loan.reminderCount}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
