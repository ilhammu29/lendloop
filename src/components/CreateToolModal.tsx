"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolCategory, ToolCondition } from "../types";
import { useToast } from "./Toast";
import CategoryIcon from "./CategoryIcon";
import { X, Plus, AlertCircle, Image as ImageIcon, Sparkles } from "lucide-react";

interface CreateToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: ToolCategory[] = [
  "power tools",
  "garden",
  "kitchen",
  "camping",
  "woodworking",
  "automotive",
  "other",
];

const CONDITIONS: ToolCondition[] = ["new", "like-new", "good", "fair"];

const IMAGE_PRESETS = [
  {
    name: "Cordless Drill",
    url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Lawn Mower",
    url: "https://images.unsplash.com/photo-1592417817098-8f3d6ef2311f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Camping Tent",
    url: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Angle Grinder",
    url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80",
  },
];

export default function CreateToolModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateToolModalProps) {
  const createTool = useMutation(api.tools?.createTool || ({} as any));
  const toast = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ToolCategory>("power tools");
  const [condition, setCondition] = useState<ToolCondition>("good");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Tool name is required.");
      return;
    }

    setLoading(true);
    try {
      await createTool({
        name: name.trim(),
        category,
        condition,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      toast.success(`"${name.trim()}" has been added to your community shed!`, "Listing Published");

      setName("");
      setDescription("");
      setImageUrl("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.message || "Failed to create listing.";
      setError(msg);
      toast.error(msg, "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              List a Tool for Lending
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Share your idle equipment with verified community neighbors.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tool Name *
            </label>
            <input
              type="text"
              placeholder="e.g. DeWalt 20V Cordless Hammer Drill, Pressure Washer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ToolCategory)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm capitalize focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ToolCondition)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm capitalize focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Photo URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
              />
            </div>

            {/* Quick Demo Presets */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
              {IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description & Usage Guidelines
            </label>
            <textarea
              rows={3}
              placeholder="Include battery status, safety tips, or required accessories..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Tool Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
