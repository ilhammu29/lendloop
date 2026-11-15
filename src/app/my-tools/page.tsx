"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import CreateToolModal from "../../components/CreateToolModal";
import { ToolItem } from "../../types";
import { formatDate } from "../../lib/utils";
import {
  Plus,
  Wrench,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
} from "lucide-react";

export default function MyToolsPage() {
  const { isSignedIn } = useUser();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const myTools = useQuery(api.tools?.listMyTools || ({} as any));
  const deleteTool = useMutation(api.tools?.deleteTool || ({} as any));

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <Wrench className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Sign in to Access</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Sign in to manage the tools you are lending to neighbors.
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">
            Sign In with Clerk
          </button>
        </SignInButton>
      </div>
    );
  }

  const handleDelete = async (toolId: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteTool({ toolId: toolId as any });
      } catch (err: any) {
        alert(err.message || "Failed to delete tool.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Tool Listings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your inventory of shared neighborhood tools.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Tool
        </button>
      </div>

      {/* Tools Table / Cards */}
      {myTools === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse p-4"
            ></div>
          ))}
        </div>
      ) : myTools.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            You haven't listed any tools yet
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
            Got a drill, ladder, pressure washer, or camping stove sitting idle? Share it with neighbors!
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            List Your First Tool
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {myTools.map((tool: ToolItem) => (
              <div
                key={tool._id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {tool.name}
                    </h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {tool.category}
                    </span>
                    <span className="text-[11px] font-medium capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {tool.condition}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 max-w-2xl">
                    {tool.description || "No description provided."}
                  </p>
                  <div className="text-xs text-slate-400">
                    Listed on {formatDate(tool.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
                  {tool.status === "available" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      On Loan
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(tool._id)}
                    disabled={tool.status === "borrowed"}
                    title={
                      tool.status === "borrowed"
                        ? "Cannot delete a tool while on loan"
                        : "Delete listing"
                    }
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
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
    </div>
  );
}
