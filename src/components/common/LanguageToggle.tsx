"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  variant?: "dark" | "light";
  className?: string;
}

export function LanguageToggle({ variant = "dark", className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center rounded-xl p-1 text-xs font-semibold select-none transition shadow-2xs ${
        isDark
          ? "bg-[#082218] border border-emerald-700/40 text-slate-300"
          : "bg-slate-100 border border-slate-300 text-slate-600"
      } ${className}`}
    >
      {/* Thai Option (Primary default) */}
      <button
        type="button"
        onClick={() => setLanguage("th")}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
          language === "th"
            ? isDark
              ? "bg-[#84cc16] text-[#061a12] font-black shadow-sm"
              : "bg-white text-slate-900 font-bold shadow-xs"
            : isDark
            ? "text-slate-400 hover:text-white"
            : "text-slate-500 hover:text-slate-900"
        }`}
        title="ภาษาไทย (หลัก)"
      >
        <span className="text-xs">🇹🇭</span>
        <span>ไทย</span>
      </button>

      {/* English Option */}
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
          language === "en"
            ? isDark
              ? "bg-[#84cc16] text-[#061a12] font-black shadow-sm"
              : "bg-white text-slate-900 font-bold shadow-xs"
            : isDark
            ? "text-slate-400 hover:text-white"
            : "text-slate-500 hover:text-slate-900"
        }`}
        title="English"
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
