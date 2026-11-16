"use client";

import { ToolCategory } from "../types";
import {
  Wrench,
  Sprout,
  UtensilsCrossed,
  Tent,
  Hammer,
  Car,
  Package,
} from "lucide-react";

interface CategoryIconProps {
  category: ToolCategory | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function CategoryIcon({
  category,
  className = "",
  size = "md",
}: CategoryIconProps) {
  const sizeMap = {
    sm: "w-7 h-7 p-1.5",
    md: "w-10 h-10 p-2.5",
    lg: "w-14 h-14 p-3.5",
  };

  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  switch (category.toLowerCase()) {
    case "power tools":
      return (
        <div
          className={`${sizeMap[size]} rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0 ${className}`}
        >
          <Wrench className={iconSizeMap[size]} />
        </div>
      );
    case "garden":
      return (
        <div
          className={`${sizeMap[size]} rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 ${className}`}
        >
          <Sprout className={iconSizeMap[size]} />
        </div>
      );
    case "kitchen":
      return (
        <div
          className={`${sizeMap[size]} rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 ${className}`}
        >
          <UtensilsCrossed className={iconSizeMap[size]} />
        </div>
      );
    case "camping":
      return (
        <div
          className={`${sizeMap[size]} rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 ${className}`}
        >
          <Tent className={iconSizeMap[size]} />
        </div>
      );
    case "woodworking":
      return (
        <div
          className={`${sizeMap[size]} rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0 ${className}`}
        >
          <Hammer className={iconSizeMap[size]} />
        </div>
      );
    case "automotive":
      return (
        <div
          className={`${sizeMap[size]} rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0 ${className}`}
        >
          <Car className={iconSizeMap[size]} />
        </div>
      );
    default:
      return (
        <div
          className={`${sizeMap[size]} rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 ${className}`}
        >
          <Package className={iconSizeMap[size]} />
        </div>
      );
  }
}
