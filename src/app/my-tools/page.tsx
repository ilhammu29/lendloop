"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import CreateToolModal from "../../components/CreateToolModal";
import ToolDetailModal from "../../components/ToolDetailModal";
import CategoryIcon from "../../components/CategoryIcon";
import AppSidebar from "../../components/AppSidebar";
import { useToast } from "../../components/Toast";
import { ToolItem } from "../../types";
import { formatDate } from "../../lib/utils";
import {
  Plus,
  Wrench,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function MyToolsPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalTool, setDetailModalTool] = useState<ToolItem | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const myTools = useQuery(api.tools?.listMyTools || ({} as any));
  const deleteTool = useMutation(api.tools?.deleteTool || ({} as any));

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg">
        <Wrench className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to Access Listings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Sign in to manage the equipment you are sharing with neighbors.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm">
            Sign In with Clerk
          </button>
        </SignInButton>
      </div>
    );
  }

  const handleDelete = async (toolId: string) => {
    if (confirm("Are you sure you want to delete this equipment listing?")) {
      try {
        await deleteTool({ toolId: toolId as any });
        toast.success("Equipment listing deleted successfully.", "Removed");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete equipment.", "Error");
      }
    }
  };

  // Metrics
  const totalItems = myTools?.length ?? 0;
  const availableItems = (myTools || []).filter((t: any) => t.status === "available").length;
  const onLoanItems = totalItems - availableItems;

  const filteredMyTools = (myTools || []).filter((t: ToolItem) => {
    if (!searchFilter.trim()) return true;
    return (
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.category.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Fixed Stationary Sidebar */}
      <AppSidebar onOpenCreateTool={() => setCreateModalOpen(true)} />

      {/* Main Content Area (Offset for desktop fixed sidebar) */}
      <main className="md:pl-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Header & Owner Inventory Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Owner Inventory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Equipment Listings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Manage your listed tools, track borrowing status, or add new hardware to the neighborhood shed.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">My Gear</span>
              <span className="text-base font-extrabold text-slate-900">{totalItems}</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Available</span>
              <span className="text-base font-extrabold text-emerald-800">{availableItems}</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center min-w-[90px]">
              <span className="text-[10px] text-amber-700 font-semibold uppercase block">On Loan</span>
              <span className="text-base font-extrabold text-amber-800">{onLoanItems}</span>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="relative flex-grow max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search my equipment..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredMyTools.length} of {totalItems} items
            </span>
          </div>
        )}

        {/* Tools Table / Cards */}
        {myTools === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse p-5"
              ></div>
            ))}
          </div>
        ) : myTools.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              You haven't listed any equipment yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Got a lawn mower, power drill, ladder, or tent? Share it with neighbors to earn reputation and reduce consumption!
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              List Your First Equipment
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredMyTools.map((tool: ToolItem) => (
                <div
                  key={tool._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <CategoryIcon category={tool.category} size="md" />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          onClick={() => setDetailModalTool(tool)}
                          className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                        >
                          {tool.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {tool.category}
                        </span>
                        <span className="text-[10px] font-medium capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {tool.condition}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                        {tool.description || "No specific instructions provided."}
                      </p>

                      <div className="text-[11px] text-slate-400">
                        Listed on {formatDate(tool.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => setDetailModalTool(tool)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>

                    {tool.status === "available" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        On Loan
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(tool._id)}
                      disabled={tool.status === "borrowed"}
                      title={
                        tool.status === "borrowed"
                          ? "Cannot delete while on loan"
                          : "Delete listing"
                      }
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <CreateToolModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />

        <ToolDetailModal
          tool={detailModalTool}
          isOpen={!!detailModalTool}
          onClose={() => setDetailModalTool(null)}
          isOwner={true}
        />
      </main>
    </div>
  );
}
