"use client";

import { LoanStatus } from "../types";
import { formatDate } from "../lib/utils";
import {
  Send,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface LoanTimelineProps {
  status: LoanStatus;
  startDate: string;
  endDate: string;
  createdAt: number;
  lastReminderSentAt?: number;
  reminderCount?: number;
}

export default function LoanTimeline({
  status,
  startDate,
  endDate,
  createdAt,
  lastReminderSentAt,
  reminderCount,
}: LoanTimelineProps) {
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = status === "approved" && endDate < today;

  const steps = [
    {
      id: "requested",
      title: "Requested",
      subtitle: formatDate(createdAt),
      done: true,
      icon: Send,
      color: "emerald",
    },
    {
      id: "review",
      title: status === "declined" ? "Declined" : "Lender Approval",
      subtitle:
        status === "pending"
          ? "Awaiting owner"
          : status === "declined"
          ? "Declined"
          : "Approved",
      done: status !== "pending",
      failed: status === "declined",
      active: status === "pending",
      icon: status === "declined" ? XCircle : CheckCircle2,
      color: status === "declined" ? "rose" : "emerald",
    },
    {
      id: "active",
      title: isOverdue ? "Overdue" : "In Use",
      subtitle: `${formatDate(startDate)} → ${formatDate(endDate)}`,
      done: status === "returned",
      active: status === "approved" && !isOverdue,
      warning: isOverdue,
      icon: isOverdue ? AlertTriangle : Clock,
      color: isOverdue ? "amber" : "emerald",
    },
    {
      id: "returned",
      title: "Returned",
      subtitle: status === "returned" ? "Completed" : "Pending return",
      done: status === "returned",
      active: false,
      icon: RotateCcw,
      color: "emerald",
    },
  ];

  return (
    <div className="w-full py-3 px-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 mt-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
        <span>Loan Lifecycle</span>
        {isOverdue && (
          <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
            Action: Return Overdue Tool
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-start gap-2.5 relative">
              {/* Connector line for desktop */}
              {idx < steps.length - 1 && (
                <div
                  className={`hidden md:block absolute top-3.5 left-7 w-[calc(100%-1.75rem)] h-[2px] z-0 ${
                    step.done
                      ? "bg-emerald-400"
                      : step.failed
                      ? "bg-rose-300"
                      : "bg-slate-200"
                  }`}
                />
              )}

              {/* Step Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border transition-colors ${
                  step.done
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : step.failed
                    ? "bg-rose-600 text-white border-rose-600"
                    : step.warning
                    ? "bg-amber-500 text-white border-amber-500 animate-pulse"
                    : step.active
                    ? "bg-white text-emerald-600 border-emerald-500 ring-4 ring-emerald-100"
                    : "bg-white text-slate-400 border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Step Text */}
              <div className="min-w-0">
                <div
                  className={`text-xs font-bold leading-tight ${
                    step.warning
                      ? "text-amber-700"
                      : step.failed
                      ? "text-rose-700"
                      : step.done || step.active
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {step.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
