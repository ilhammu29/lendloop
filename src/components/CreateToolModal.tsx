"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolCategory, ToolCondition } from "../types";
import { useToast } from "./Toast";
import CategoryIcon from "./CategoryIcon";
import {
  X,
  Plus,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  Trash2,
} from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ToolCategory>("power tools");
  const [condition, setCondition] = useState<ToolCondition>("good");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadSource, setUploadSource] = useState<"file" | "url">("file");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image file is too large (maximum size is 2MB).");
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.onerror = () => {
      setError("Failed to read image file from disk. Please choose another image.");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageUrl("");
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Equipment name is required.");
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

      toast.success(
        `"${name.trim()}" has been listed in your community shed!`,
        "Listing Published"
      );

      setName("");
      setDescription("");
      setImageUrl("");
      setFileName(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.message || "Failed to publish listing.";
      setError(msg);
      toast.error(msg, "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              List Equipment for Lending
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Share your idle gear with verified neighbors in your community.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              placeholder="e.g. DeWalt 20V Cordless Hammer Drill, Pressure Washer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ToolCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs capitalize focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ToolCondition)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs capitalize focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Equipment Image
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[10px]">
                <button
                  type="button"
                  onClick={() => setUploadSource("file")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    uploadSource === "file"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Local File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSource("url")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    uploadSource === "url"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  URL / Preset
                </button>
              </div>
            </div>

            {uploadSource === "file" ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center gap-3">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-800 block truncate">
                        {fileName || "Uploaded Local Image"}
                      </span>
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" /> Ready to publish
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/20"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-700 block">
                      Click to choose local image file
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      PNG, JPG, or WEBP up to 2MB
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Quick Presets */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Borrower Guidelines
            </label>
            <textarea
              rows={3}
              placeholder="Include battery status, safety tips, accessory notes, or care guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Tool Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
