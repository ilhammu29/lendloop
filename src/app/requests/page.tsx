"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import AutomationBadge from "../../components/AutomationBadge";
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
  ShieldAlert,
} from "lucide-react";

export default function RequestsPage() {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  const incomingRequests = useQuery(api.loans?.listIncomingRequests || ({} as any));
  const myRequests = useQuery(api.loans?.listMyRequests || ({} as any));

  const respondToLoan = useMutation(api.loans?.respondToLoanRequest || ({} as any));
  const markReturned = useMutation(api.loans?.markLoanReturned || ({} as any));

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <Inbox className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Sign in to Access</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Sign in to view borrow requests and manage your active loans.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">
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
    } catch (err: any) {
      alert(err.message || "Failed to respond to request.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (loanId: string) => {
    if (confirm("Confirm that this tool has been returned and inspected?")) {
      setActionLoading(loanId);
      try {
        await markReturned({
          loanId: loanId as any,
        });
      } catch (err: any) {
        alert(err.message || "Failed to mark as returned.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const pendingIncomingCount = (incomingRequests || []).filter(
    (l: LoanItem) => l.status === "pending"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Requests & Loan Activity
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review incoming requests for your gear and track your borrow history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-colors relative ${
            activeTab === "incoming"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Requests
          {pendingIncomingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-600 text-white font-bold animate-pulse">
              {pendingIncomingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("outgoing")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "outgoing"
              ? "border-emerald-600 text-emerald-800"
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
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"
                ></div>
              ))}
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-slate-700">
                No incoming requests yet
              </h3>
              <p className="text-xs text-slate-500">
                When neighbors request to borrow your listed tools, they will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((loan: LoanItem) => (
                <div
                  key={loan._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">
                        {loan.toolName}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                          loan.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : loan.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : loan.status === "declined"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {loan.status}
                      </span>

                      {/* Bonus: Automation activity indicator */}
                      <AutomationBadge
                        loanId={loan._id}
                        lastReminderSentAt={loan.lastReminderSentAt}
                        reminderCount={loan.reminderCount}
                      />
                    </div>

                    <p className="text-sm text-slate-600">
                      Requested by{" "}
                      <strong className="text-slate-900">
                        {loan.borrowerName}
                      </strong>{" "}
                      ({loan.borrowerEmail})
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Loan Dates: {formatDate(loan.startDate)} &rarr;{" "}
                        {formatDate(loan.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {loan.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleRespond(loan._id, "approve")}
                          disabled={actionLoading === loan._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRespond(loan._id, "decline")}
                          disabled={actionLoading === loan._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
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
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Mark as Returned
                      </button>
                    )}

                    {loan.status === "returned" && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Returned & Completed
                      </span>
                    )}
                  </div>
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
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"
                ></div>
              ))}
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-2">
              <Send className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-slate-700">
                You haven't requested any tools yet
              </h3>
              <p className="text-xs text-slate-500">
                Browse the community catalog to borrow tools from your neighbors.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((loan: LoanItem) => (
                <div
                  key={loan._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">
                        {loan.toolName}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                          loan.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : loan.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : loan.status === "declined"
                            ? "bg-red-100 text-red-800"
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

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Requested Duration: {formatDate(loan.startDate)} &rarr;{" "}
                        {formatDate(loan.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {loan.status === "approved" && (
                      <button
                        onClick={() => handleReturn(loan._id)}
                        disabled={actionLoading === loan._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Returned Tool
                      </button>
                    )}

                    {loan.status === "returned" && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Loan Complete
                      </span>
                    )}

                    {loan.status === "pending" && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        Waiting for lender approval
                      </span>
                    )}

                    {loan.status === "declined" && (
                      <span className="text-xs font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                        Declined by lender
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
