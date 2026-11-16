"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolItem } from "../types";
import { useToast } from "./Toast";
import CategoryIcon from "./CategoryIcon";
import { X, Calendar, AlertCircle, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

interface BorrowModalProps {
  tool: ToolItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BorrowModal({
  tool,
  isOpen,
  onClose,
  onSuccess,
}: BorrowModalProps) {
  const requestBorrow = useMutation(api.loans?.requestBorrow || ({} as any));
  const toast = useToast();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !tool) return null;

  // Calculate day difference
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const dayCount =
    !isNaN(startMs) && !isNaN(endMs) && endMs >= startMs
      ? Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(startDate) > new Date(endDate)) {
      setError("Return date must be on or after borrow date.");
      return;
    }

    setLoading(true);
    try {
      await requestBorrow({
        toolId: tool._id as any,
        startDate,
        endDate,
      });

      toast.success(
        `Borrow request for "${tool.name}" submitted! The owner has been notified via n8n.`,
        "Request Dispatched"
      );

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.message || "Failed to submit borrow request.";
      setError(msg);
      toast.error(msg, "Request Conflict");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tool Header Summary */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
          <CategoryIcon category={tool.category} size="lg" />
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {tool.category}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {tool.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Lender: <strong>{tool.ownerName}</strong></span>
              {tool.isTrustedLender && (
                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                  • <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Trusted
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pick-up Date
              </label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Return Date
              </label>
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Duration Pill */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-emerald-600" />
              Calculated Borrow Window:
            </span>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
              {dayCount} Day{dayCount > 1 ? "s" : ""}
            </span>
          </div>

          {/* Privacy & Notification Disclaimer */}
          <div className="text-[11px] text-slate-500 leading-relaxed bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
            💡 <strong>Privacy Protection:</strong> When you submit, Convex signs a minimal payload via HMAC-SHA256 and alerts the lender via an automated n8n webhook.
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || dayCount === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Dispatching..." : "Submit Borrow Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
