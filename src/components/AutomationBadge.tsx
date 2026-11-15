"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatTimeAgo } from "../lib/utils";
import { Bot, BellRing, Check, Clock } from "lucide-react";
import { useState } from "react";

interface AutomationBadgeProps {
  loanId: string;
  lastReminderSentAt?: number;
  reminderCount?: number;
}

export default function AutomationBadge({
  loanId,
  lastReminderSentAt,
  reminderCount,
}: AutomationBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const logs = useQuery(
    api.loans?.getLoanActivity || ({} as any),
    showDetails ? { loanId: loanId as any } : "skip"
  );

  if (!lastReminderSentAt && (!reminderCount || reminderCount === 0)) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
        <Bot className="w-3 h-3 text-slate-400" />
        n8n Workflow Active
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 transition-colors"
        title="Click to view automated workflow audit logs"
      >
        <BellRing className="w-3 h-3 text-amber-600 animate-pulse" />
        <span>
          Reminder sent {lastReminderSentAt ? formatTimeAgo(lastReminderSentAt) : ""}
          {reminderCount && reminderCount > 1 ? ` (${reminderCount}x)` : ""}
        </span>
      </button>

      {/* Popover Audit Log */}
      {showDetails && (
        <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              n8n Automation Logs
            </span>
            <button
              onClick={() => setShowDetails(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs === undefined ? (
              <p className="text-slate-400">Loading audit log...</p>
            ) : logs.length === 0 ? (
              <p className="text-slate-400">No write-back logs recorded yet.</p>
            ) : (
              logs.map((log: any) => (
                <div
                  key={log._id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 capitalize">
                      {log.workflowType.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatTimeAgo(log.sentAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {log.payloadSummary}
                  </p>
                  <div className="text-[9px] text-slate-400 font-mono truncate">
                    Key: {log.idempotencyKey}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
