"use client";

import { ToolItem } from "../types";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

interface ToolCardProps {
  tool: ToolItem;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onBorrow?: (tool: ToolItem) => void;
  onDelete?: (toolId: string) => void;
}

export default function ToolCard({
  tool,
  currentUserId,
  isAdmin,
  onBorrow,
  onDelete,
}: ToolCardProps) {
  const isOwner = currentUserId === tool.ownerId;
  const isAvailable = tool.status === "available";

  const conditionColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    "like-new": "bg-indigo-50 text-indigo-700 border-indigo-200",
    good: "bg-emerald-50 text-emerald-700 border-emerald-200",
    fair: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Top Banner / Category */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {tool.category}
          </span>
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              On Loan
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {tool.name}
        </h3>

        {/* Owner Info & Trusted Lender */}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
          <span>By {tool.ownerName}</span>
          {tool.isTrustedLender && (
            <span className="inline-flex items-center gap-0.5 font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-full text-[10px]">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Trusted Lender
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-2 flex-grow">
        <p className="text-sm text-slate-600 line-clamp-3">
          {tool.description || "No specific instructions provided. Ready for neighborhood use."}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${
              conditionColors[tool.condition] || "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Condition: {tool.condition}
          </span>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        {isOwner ? (
          <span className="text-xs font-medium text-slate-500 italic">
            Your listing
          </span>
        ) : isAvailable ? (
          <button
            onClick={() => onBorrow && onBorrow(tool)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4" />
            Borrow Tool
          </button>
        ) : (
          <button
            disabled
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-slate-400 bg-slate-100 cursor-not-allowed"
          >
            Currently Borrowed
          </button>
        )}

        {/* Admin or Owner Delete Option */}
        {(isAdmin || isOwner) && onDelete && (
          <button
            onClick={() => onDelete(tool._id)}
            title={isAdmin ? "Admin Delete Listing" : "Delete My Listing"}
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
