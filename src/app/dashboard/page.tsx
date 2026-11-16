"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import ToolCard from "../../components/ToolCard";
import BorrowModal from "../../components/BorrowModal";
import CreateToolModal from "../../components/CreateToolModal";
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

  // Sync user profile on mount
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const fullName =
        clerkUser.fullName ||
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "Neighbor";
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || "";

      syncUser({
        name: fullName,
        email: primaryEmail,
      }).catch((err) => {
        console.error("Failed to sync user with Convex:", err);
      });
    }
  }, [isSignedIn, clerkUser, syncUser]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-28 p-8 bg-white border border-slate-200/80 rounded-3xl text-center shadow-lg">
        <Wrench className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to Access</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          You must be signed in to view full tool details, borrow gear, or contribute items.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Active Community Shed
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Browse Neighborhood Equipment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Borrow power tools, garden machinery, and outdoor gear directly from verified neighbors.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-sm hover:shadow-lg transition-all active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          List Your Tool
        </button>
      </div>

      {/* Modern Filter & Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-grow max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tools, model, owner, or keywords... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="newest">Recently Added</option>
              <option value="available">Available First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips with Live Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
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

      {/* Grid of Tools */}
      {tools === undefined ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 bg-white border border-slate-200 rounded-3xl animate-pulse p-6 space-y-4"
            >
              <div className="h-40 bg-slate-100 rounded-2xl"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No matching equipment found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or switching to another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs font-bold text-emerald-600 hover:underline pt-2 block mx-auto"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool: ToolItem) => (
            <ToolCard
              key={tool._id}
              tool={tool}
              currentUserId={currentUser?.clerkId}
              isAdmin={isAdmin}
              onBorrow={(t) => setBorrowModalTool(t)}
              onDelete={handleDeleteTool}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BorrowModal
        tool={borrowModalTool}
        isOpen={!!borrowModalTool}
        onClose={() => setBorrowModalTool(null)}
      />

      <CreateToolModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
