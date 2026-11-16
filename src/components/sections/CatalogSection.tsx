"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import CategoryIcon from "../CategoryIcon";
import {
  Search,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Check,
  Lock,
} from "lucide-react";

export default function CatalogSection() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools?.listPublicTools || ({} as any));
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Power Tools",
    "Gardening",
    "Lawn Care",
    "Hand Tools",
    "Cleaning",
    "Automotive",
    "Other",
  ];

  const filteredTools = (publicTools || []).filter((tool: any) => {
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalog" className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Community Gear Directory
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Public Equipment Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Real-time tool availability adhering to strict data minimization. Authenticate to request borrows and view lender coordinates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Showing <strong>{filteredTools.length}</strong> items
            </span>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                <span>Full Member View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                  <span>Sign In to Borrow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search equipment by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* Tool Grid (Real Data, Zero Dummy) */}
        {publicTools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse"
              >
                <div className="w-full h-36 bg-slate-100 rounded-xl"></div>
                <div className="w-2/3 h-4 bg-slate-100 rounded"></div>
                <div className="w-1/2 h-3 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No equipment found matching criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your category filter or search terms to browse the neighborhood hardware directory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool: any) => (
              <div
                key={tool._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs group"
              >
                <div className="space-y-3">
                  {/* Category Header & Status Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={tool.category} className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {tool.category}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tool.status === "available"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tool.status === "available" ? "bg-emerald-600" : "bg-slate-400"
                        }`}
                      ></span>
                      {tool.status === "available" ? "Available" : "On Loan"}
                    </span>
                  </div>

                  {/* Tool Title */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {tool.name}
                  </h3>

                  {/* Public Data Minimization Notice */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    Verified neighborhood hardware listing. Full specs, manual attachments, and direct borrow scheduling available to authenticated community members.
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Lender Protected
                  </span>

                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                    >
                      <span>Request Borrow</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                        <span>Sign In to Borrow</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </SignInButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
