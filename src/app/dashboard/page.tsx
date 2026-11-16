"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import ToolCard from "../../components/ToolCard";
import BorrowModal from "../../components/BorrowModal";
import CreateToolModal from "../../components/CreateToolModal";
import ToolDetailModal from "../../components/ToolDetailModal";
import AppSidebar from "../../components/AppSidebar";
import CategoryIcon from "../../components/CategoryIcon";
import { useToast } from "../../components/Toast";
import { ToolItem } from "../../types";
import {
  Plus,
  Search,
  Filter,
  Wrench,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

const CATEGORIES = [
  { label: "All Equipment", value: "all" },
  { label: "Power Tools", value: "power tools" },
  { label: "Garden", value: "garden" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Camping", value: "camping" },
  { label: "Woodworking", value: "woodworking" },
  { label: "Automotive", value: "automotive" },
  { label: "Other", value: "other" },
];

export default function DashboardPage() {
  const { isSignedIn, user: clerkUser } = useUser();
  const toast = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "available">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [borrowModalTool, setBorrowModalTool] = useState<ToolItem | null>(null);
  const [detailModalTool, setDetailModalTool] = useState<ToolItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Queries & Mutations
  const currentUser = useQuery(api.users?.getCurrentUser || ({} as any));
  const syncUser = useMutation(api.users?.syncUser || ({} as any));
  const deleteTool = useMutation(api.tools?.deleteTool || ({} as any));

  const allToolsUnfiltered = useQuery(
    api.tools?.listAllTools || ({} as any),
    isSignedIn ? {} : "skip"
  );

  const tools = useQuery(
    api.tools?.listAllTools || ({} as any),
    isSignedIn
      ? {
          category: selectedCategory === "all" ? undefined : selectedCategory,
          sortBy,
        }
      : "skip"
  );

  // Sync user with Clerk when signed in
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      syncUser({
        name: clerkUser.fullName || clerkUser.username || "Community Member",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
      }).catch(console.error);
    }
  }, [isSignedIn, clerkUser, syncUser]);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg">
        <Wrench className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to Access Equipment
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          You must be a signed-in member to view full tool details, borrow gear, or list items.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm">
            Sign In with Clerk
          </button>
        </SignInButton>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";

  const handleDeleteTool = async (toolId: string) => {
    if (confirm("Are you sure you want to remove this tool listing?")) {
      try {
        await deleteTool({ toolId: toolId as any });
        toast.success("Tool listing removed from the platform.", "Listing Deleted");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete tool.", "Error");
      }
    }
  };

  // Compute category count map and platform metrics
  const categoryCounts: Record<string, number> = {};
  let availableCount = 0;
  const uniqueLenders = new Set<string>();

  (allToolsUnfiltered || []).forEach((t: any) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    if (t.status === "available") availableCount++;
    if (t.ownerId) uniqueLenders.add(t.ownerId);
  });

  const filteredTools = (tools || []).filter((tool: ToolItem) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 md:pl-60">
      {/* Fixed Stationary Sidebar */}
      <AppSidebar onOpenCreateTool={() => setCreateModalOpen(true)} />

      {/* Main Content Area (Safely positioned to the right of fixed sidebar) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Top Header & Metrics Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Community Tool Shed
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Browse Equipment Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Borrow well-maintained power tools, lawn mowers, and camping gear directly from verified neighborhood owners.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Gear</span>
              <span className="text-base font-extrabold text-slate-900">{allToolsUnfiltered?.length ?? 0}</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Available</span>
              <span className="text-base font-extrabold text-emerald-800">{availableCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Lenders</span>
              <span className="text-base font-extrabold text-slate-900">{uniqueLenders.size}</span>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              List Equipment
            </button>
          </div>
        </div>

        {/* Search, Filter & Layout Controls */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search equipment, brand, owner... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* View Mode & Sorting */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Grid / List Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="newest">Recently Added</option>
                  <option value="available">Available First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips with Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
            {CATEGORIES.map((cat) => {
              const count =
                cat.value === "all"
                  ? allToolsUnfiltered?.length ?? 0
                  : categoryCounts[cat.value] || 0;
              const isSelected = selectedCategory === cat.value;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipment Results Display */}
        {tools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-white border border-slate-200 rounded-2xl animate-pulse p-5 space-y-3"
              >
                <div className="h-40 bg-slate-100 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8 space-y-3">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No equipment found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No tools match "${searchQuery}". Try different search terms or clear filters.`
                : "No tools listed in this category yet. Be the first neighbor to list one!"}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool: ToolItem) => (
              <ToolCard
                key={tool._id}
                tool={tool}
                currentUserId={currentUser?.clerkId}
                isAdmin={isAdmin}
                onBorrow={(t) => setBorrowModalTool(t)}
                onDelete={handleDeleteTool}
                onViewDetails={(t) => setDetailModalTool(t)}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredTools.map((tool: ToolItem) => (
                <div
                  key={tool._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <CategoryIcon category={tool.category} size="md" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          onClick={() => setDetailModalTool(tool)}
                          className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                        >
                          {tool.name}
                        </h4>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {tool.category}
                        </span>
                        <span className="text-[10px] capitalize font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {tool.condition}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xl">
                        {tool.description}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Lender: {tool.ownerName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
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
                      onClick={() => setDetailModalTool(tool)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Details
                    </button>

                    {tool.status === "available" && tool.ownerId !== currentUser?.clerkId && (
                      <button
                        onClick={() => setBorrowModalTool(tool)}
                        className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-xs font-bold text-white transition-colors"
                      >
                        Borrow
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <BorrowModal
          tool={borrowModalTool}
          isOpen={!!borrowModalTool}
          onClose={() => setBorrowModalTool(null)}
          onSuccess={() => setBorrowModalTool(null)}
        />

        <ToolDetailModal
          tool={detailModalTool}
          isOpen={!!detailModalTool}
          onClose={() => setDetailModalTool(null)}
          onRequestBorrow={(t) => setBorrowModalTool(t)}
          isOwner={detailModalTool?.ownerId === currentUser?.clerkId}
        />

        <CreateToolModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      </main>
    </div>
  );
}
