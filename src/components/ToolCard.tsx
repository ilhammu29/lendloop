"use client";

import { ToolItem } from "../types";
import CategoryIcon from "./CategoryIcon";
import {
  ShieldCheck,
  Calendar,
  Trash2,
  Clock,
  Eye,
} from "lucide-react";

interface ToolCardProps {
  tool: ToolItem;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onBorrow?: (tool: ToolItem) => void;
  onDelete?: (toolId: string) => void;
  onViewDetails?: (tool: ToolItem) => void;
}

export default function ToolCard({
  tool,
  currentUserId,
  isAdmin,
  onBorrow,
  onDelete,
  onViewDetails,
}: ToolCardProps) {
  const isOwner = currentUserId === tool.ownerId;
  const isAvailable = tool.status === "available";

  const conditionBadges: Record<string, { label: string; style: string }> = {
    new: { label: "Brand New", style: "bg-blue-50 text-blue-700 border-blue-200" },
    "like-new": { label: "Like New", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    good: { label: "Good", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    fair: { label: "Fair", style: "bg-amber-50 text-amber-700 border-amber-200" },
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md">
      {/* Top Media Area */}
      <div
        onClick={() => onViewDetails && onViewDetails(tool)}
        className="relative h-44 w-full bg-slate-100 overflow-hidden flex items-center justify-center cursor-pointer"
      >
        {tool.imageUrl ? (
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <CategoryIcon category={tool.category} size="lg" className="mb-2 text-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              {tool.category}
            </span>
          </div>
        )}

        {/* Status Badge Over Image */}
        <div className="absolute top-3 left-3 z-10">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-950 bg-emerald-400/95 backdrop-blur-xs shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-800"></span>
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-white bg-slate-900/90 backdrop-blur-xs shadow-xs">
              <Clock className="w-3 h-3 text-amber-400" />
              On Loan
            </span>
          )}
        </div>

        {/* Condition pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/95 text-slate-800 backdrop-blur-xs shadow-xs border border-slate-200">
            {conditionBadges[tool.condition]?.label || tool.condition}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-3.5">
        <div>
          {/* Title & Click for Details */}
          <div
            onClick={() => onViewDetails && onViewDetails(tool)}
            className="cursor-pointer group/title"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {tool.category}
            </span>
            <h3 className="text-base font-bold text-slate-900 group-hover/title:text-emerald-700 transition-colors line-clamp-1">
              {tool.name}
            </h3>
          </div>

          {/* Owner info */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <span className="text-slate-600 truncate">Lender: {tool.ownerName}</span>
            {tool.isTrustedLender && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Trusted
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {tool.description || "Community equipment available for neighborhood sharing."}
          </p>
        </div>

        {/* Actions & Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(tool)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="View Equipment Details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {isOwner ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Your Listing
                </span>
                {onDelete && (
                  <button
                    onClick={() => onDelete(tool._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : isAvailable ? (
              <button
                onClick={() => onBorrow && onBorrow(tool)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Borrow</span>
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-slate-100 cursor-not-allowed"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Reserved</span>
              </button>
            )}

            {/* Admin Delete */}
            {isAdmin && !isOwner && onDelete && (
              <button
                onClick={() => onDelete(tool._id)}
                title="Admin Delete"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
