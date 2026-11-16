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

  // Compute category count map
  const categoryCounts: Record<string, number> = {};
  (allToolsUnfiltered || []).forEach((t: any) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const filteredTools = (tools || []).filter((tool: ToolItem) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Responsive Collapsible Icon Sidebar */}
      <AppSidebar onOpenCreateTool={() => setCreateModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Community Equipment Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Borrow power tools, garden gear, and household machinery directly from verified neighbors.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            List Equipment
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search equipment, brand, owner... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="newest">Recently Added</option>
                <option value="available">Available First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Chips with Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipment Grid */}
        {tools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse p-5 space-y-3"
              >
                <div className="h-40 bg-slate-100 rounded-lg"></div>
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
        ) : (
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
