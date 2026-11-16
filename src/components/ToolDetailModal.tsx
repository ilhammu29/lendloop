"use client";

import { ToolItem } from "../types";
import CategoryIcon from "./CategoryIcon";
import {
  X,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Layers,
  Wrench,
} from "lucide-react";
import { useToast } from "./Toast";

interface ToolDetailModalProps {
  tool: ToolItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestBorrow?: (tool: ToolItem) => void;
  isOwner?: boolean;
}

export default function ToolDetailModal({
  tool,
  isOpen,
  onClose,
  onRequestBorrow,
  isOwner = false,
}: ToolDetailModalProps) {
  const toast = useToast();

  if (!isOpen || !tool) return null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard!", "Share Tool");
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "brand new":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "excellent":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "good":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "fair":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Visual Area */}
        <div className="relative h-56 sm:h-64 bg-slate-100 border-b border-slate-200 overflow-hidden flex items-center justify-center">
          {tool.imageUrl ? (
            <img
              src={tool.imageUrl}
              alt={tool.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
              <CategoryIcon category={tool.category} size="lg" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {tool.category} Equipment
              </span>
            </div>
          )}

          {/* Availability Floating Badge */}
          <div className="absolute bottom-3 left-4">
            {tool.status === "available" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-md">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                Available for Borrowing
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white shadow-md">
                <Clock className="w-3.5 h-3.5" />
                Currently On Loan
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Title & Category Info */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <CategoryIcon category={tool.category} size="sm" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {tool.category}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${getConditionColor(
                  tool.condition
                )}`}
              >
                Condition: {tool.condition || "Good"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {tool.name}
            </h2>
          </div>

          {/* Description Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description & Usage Guidelines
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {tool.description ||
                "No specific borrower instructions provided by the lender. Please handle with care and return cleaned."}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">
                Equipment Category
              </span>
              <span className="text-xs font-semibold text-slate-800 capitalize mt-0.5 block">
                {tool.category}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">
                Community Lender
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                {tool.ownerName || "Masked for Privacy"}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                Verification Protocol
              </span>
              <span className="text-xs font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                HMAC Signed
              </span>
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-emerald-950">
                Zero-Trust Neighborhood Sharing
              </strong>
              <span>
                Lender address and contact details remain strictly private until
                your borrow request is reviewed and approved by the owner.
              </span>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleShare}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Tool
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>

              {onRequestBorrow && !isOwner && tool.status === "available" && (
                <button
                  onClick={() => {
                    onClose();
                    onRequestBorrow(tool);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Request to Borrow
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
