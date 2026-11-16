"use client";

import { ToolItem } from "../types";
import CategoryIcon from "./CategoryIcon";
import {
  ShieldCheck,
  Calendar,
  Trash2,
  Clock,
  ExternalLink,
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

  const conditionBadges: Record<string, { label: string; style: string }> = {
    new: { label: "Brand New", style: "bg-blue-50 text-blue-700 border-blue-200/80" },
    "like-new": { label: "Like New", style: "bg-indigo-50 text-indigo-700 border-indigo-200/80" },
    good: { label: "Good Condition", style: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
    fair: { label: "Fair / Used", style: "bg-amber-50 text-amber-700 border-amber-200/80" },
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Media / Preset Preview */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {tool.imageUrl ? (
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            <CategoryIcon category={tool.category} size="lg" className="shadow-lg z-10 mb-2" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 z-10">
              {tool.category}
            </span>
          </div>
        )}

        {/* Status Badge Over Image */}
        <div className="absolute top-3.5 left-3.5 z-20">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-400/95 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
              Available to Borrow
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Currently on Loan
            </span>
          )}
        </div>

        {/* Condition pill over top right */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-slate-800 backdrop-blur-md shadow-sm border border-slate-200">
            {conditionBadges[tool.condition]?.label || tool.condition}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
        <div>
          {/* Header & Title */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {tool.name}
            </h3>
          </div>

          {/* Owner info */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Lender: {tool.ownerName}</span>
            {tool.isTrustedLender && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Trusted
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
            {tool.description || "Well-maintained community equipment, ready for neighborhood use."}
          </p>
        </div>

        {/* Actions & Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {isOwner ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                Your Listing
              </span>
              {onDelete && (
                <button
                  onClick={() => onDelete(tool._id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  title="Delete my listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : isAvailable ? (
            <button
              onClick={() => onBorrow && onBorrow(tool)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <Calendar className="w-4 h-4" />
              Request to Borrow
            </button>
          ) : (
            <button
              disabled
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-slate-400 bg-slate-100 cursor-not-allowed"
            >
              <Clock className="w-4 h-4" />
              Reserved
            </button>
          )}

          {/* Super Admin Delete Option */}
          {isAdmin && !isOwner && onDelete && (
            <button
              onClick={() => onDelete(tool._id)}
              title="Admin Remove Listing"
              className="p-2.5 text-slate-400 hover:text-rose-600 rounded-2xl hover:bg-rose-50 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
