"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import CategoryIcon from "../components/CategoryIcon";
import ToolDetailModal from "../components/ToolDetailModal";
import { ToolItem } from "../types";
import {
  Wrench,
  ShieldCheck,
  Clock,
  Lock,
  Search,
  Check,
  X,
  Eye,
  Sparkles,
  ArrowRight,
  Layers,
  Calendar,
  Share2,
} from "lucide-react";

export default function PublicLandingPage() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools?.listPublicTools || ({} as any));
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailModalTool, setDetailModalTool] = useState<ToolItem | null>(null);

  // Parallax subtle mouse tracking state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 15;
      const y = (e.clientY / innerHeight - 0.5) * 15;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Modern Parallax Hero Section */}
      <section className="relative border-b border-slate-200/80 bg-white py-16 sm:py-24 lg:py-28 overflow-hidden">
        {/* Subtle geometric background accents */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-50/50 pointer-events-none transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`,
          }}
        ></div>
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-slate-100/60 pointer-events-none transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px, 0)`,
          }}
        ></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Neighborhood Tool-Lending Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.12]">
                Borrow tools from neighbors.
                <span className="block text-slate-500 font-normal mt-1.5 text-3xl sm:text-4xl lg:text-5xl">
                  Lend what sits in your garage.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                LendLoop coordinates neighborhood equipment sharing with zero
                privacy leaks. Community members share power tools, lawn mowers,
                and camping gear safely, backed by automated n8n return workflows.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Enter Community Shed
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs">
                      Sign In & Borrow Tools
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </SignInButton>
                )}

                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
                >
                  Explore Public Inventory
                </a>
              </div>
            </div>

            {/* Right Column: Layered Parallax Equipment Visual */}
            <div className="lg:col-span-5 relative perspective-1000">
              {/* Primary Surface Card */}
              <div
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl relative transition-transform duration-500 ease-out transform-style-3d hover:shadow-2xl"
                style={{
                  transform: `rotateY(${mousePos.x * 0.4}deg) rotateX(${-mousePos.y * 0.4}deg)`,
                }}
              >
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live Equipment Showcase
                    </h3>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      DeWalt 20V Cordless Hammer Drill
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Available
                  </span>
                </div>

                {/* Simulated Equipment Image Card */}
                <div className="h-44 rounded-xl bg-slate-900 overflow-hidden relative flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
                    alt="Cordless Drill Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3.5">
                    <span className="text-xs text-white font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Lender: Verified Community Member
                    </span>
                  </div>
                </div>

                {/* Specifications List */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-medium">Condition</span>
                    <span className="font-semibold text-slate-800">Like New (100% Battery)</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-medium">Privacy Status</span>
                    <span className="font-semibold text-emerald-700">Zero PII Leaked</span>
                  </div>
                </div>
              </div>

              {/* Floating Parallax Badge 1 (Top Left) */}
              <div
                className="absolute -top-5 -left-6 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-lg hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-800 animate-float-slow"
                style={{
                  transform: `translate3d(${mousePos.x * -1}px, ${mousePos.y * -1}px, 20px)`,
                }}
              >
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span>Automated Reminders</span>
              </div>

              {/* Floating Parallax Badge 2 (Bottom Right) */}
              <div
                className="absolute -bottom-5 -right-6 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 shadow-xl hidden sm:flex items-center gap-2 text-xs font-semibold text-white animate-float-medium"
                style={{
                  transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 30px)`,
                }}
              >
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>HMAC-SHA256 Signed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Catalog Section */}
      <section id="catalog" className="py-14 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
              Community Equipment Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Public read-only directory with database-level privacy protection. Sign in to your account to view detailed photos, verify lender reputations, and request loan dates.
            </p>
          </div>

          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="self-start md:self-auto text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                Sign in to borrow equipment &rarr;
              </button>
            </SignInButton>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Catalog Grid */}
        {publicTools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-40 bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-5 bg-slate-100 rounded w-2/3"></div>
                <div className="h-8 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-xl border border-dashed border-slate-300 p-8 space-y-3">
            <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              {publicTools.length === 0
                ? "No equipment listed yet"
                : "No equipment matching filter"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {publicTools.length === 0
                ? "List your first equipment to kick off tool circulation in your neighborhood."
                : "Try modifying your search keywords or switching categories."}
            </p>
            {publicTools.length === 0 && (
              <div className="pt-1">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors">
                    List Equipment Now
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool: any) => (
              <div
                key={tool._id}
                className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <CategoryIcon category={tool.category} size="md" />
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Available
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    {tool.category}
                  </span>
                  <h3
                    onClick={() => setDetailModalTool(tool)}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors mt-0.5"
                  >
                    {tool.name}
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setDetailModalTool(tool)}
                    className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>

                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      Request to Borrow
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                        Request to Borrow
                      </button>
                    </SignInButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Structured Comparison Section */}
      <section className="border-t border-slate-200/80 bg-white py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
              Why Structured Equipment Sharing Outperforms Informal Chat Groups
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Comparing ad-hoc neighborhood messaging with LendLoop's zero-trust automated platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Chat Group Frustrations */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider">
                <X className="w-4 h-4" />
                Informal WhatsApp / Facebook Groups
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-800">Privacy Leaks:</strong> Personal phone numbers and home addresses are exposed openly to entire group directories.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-800">Lost Track of Loans:</strong> Borrow requests drown in hundreds of daily chat messages, leading to forgotten equipment.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-800">Awkward Chasing:</strong> Owners feel uncomfortable personally pestering neighbors for overdue equipment returns.
                  </span>
                </li>
              </ul>
            </div>

            {/* Right: LendLoop Approach */}
            <div className="bg-emerald-50/40 border border-emerald-200/90 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <Check className="w-4 h-4" />
                The LendLoop Architecture
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900">Zero-Trust RBAC:</strong> Lender contact and address remain strictly private until an explicit borrow request is approved.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900">Real-Time 4-Stage Stepper:</strong> Transparent lifecycle tracking (Requested, Approved, In Use, Returned).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900">Automated n8n Engine:</strong> Polite, scheduled daily cron reminders with deterministic idempotency to eliminate spam.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Detail Modal */}
      <ToolDetailModal
        tool={detailModalTool}
        isOpen={!!detailModalTool}
        onClose={() => setDetailModalTool(null)}
      />
    </div>
  );
}
