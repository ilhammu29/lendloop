"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import ToolCard from "../../components/ToolCard";
import BorrowModal from "../../components/BorrowModal";
import CreateToolModal from "../../components/CreateToolModal";
import { ToolItem, ToolCategory } from "../../types";
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [borrowModalTool, setBorrowModalTool] = useState<ToolItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Queries & Mutations
  const currentUser = useQuery(api.users?.getCurrentUser || ({} as any));
  const syncUser = useMutation(api.users?.syncUser || ({} as any));
  const deleteTool = useMutation(api.tools?.deleteTool || ({} as any));

  const tools = useQuery(
    api.tools?.listAllTools || ({} as any),
    isSignedIn ? { category: selectedCategory === "all" ? undefined : selectedCategory } : "skip"
  );

  // Sync user profile from Clerk to Convex on initial load
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const fullName =
        clerkUser.fullName ||
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "Neighbor";
      const primaryEmail =
        clerkUser.primaryEmailAddress?.emailAddress || "";

      syncUser({
        name: fullName,
        email: primaryEmail,
      }).catch((err) => {
        console.error("Failed to sync user with Convex:", err);
      });
    }
  }, [isSignedIn, clerkUser, syncUser]);

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <Wrench className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Sign in to Access</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          You must be signed in to view full tool details, borrow gear, or list items.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">
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
      } catch (err: any) {
        alert(err.message || "Failed to delete tool.");
      }
    }
  };

  const filteredTools = (tools || []).filter((tool: ToolItem) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Tool Shed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse available equipment, check loan status, or contribute your tools.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          List a Tool
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tool name, description, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Grid */}
      {tools === undefined ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse p-6 space-y-4"
            >
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No tools found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Clear all filters
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
