"use client";

import Link from "next/link";
import {
  Store,
  Clock,
  Bell,
  Monitor,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardHeader() {
  const { t } = useLanguage();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none font-sans">
      {/* Left: Store Selector, Time, Sync Status */}
      <div className="flex items-center gap-5 text-xs text-slate-600">
        {/* Store Dropdown */}
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold transition shadow-2xs"
        >
          <Store className="h-4 w-4 text-emerald-700" />
          <span>Kipp Market - Sukhumvit Soi 24</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
        </button>

        {/* Date and Time */}
        <div className="hidden sm:flex items-center gap-1.5 font-medium text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Wed 14 Jun • 14:38:02</span>
        </div>

        {/* Sync Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Synced 2s ago</span>
        </div>
      </div>

      {/* Right: Language Switcher, Notifications, POS Button, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Language Switcher Button (TH / EN) */}
        <LanguageToggle variant="light" />

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* POS Terminal Button */}
        <Link
          href="/pos"
          className="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>{t("nav.posTerminal")}</span>
        </Link>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
            alt="Somchai P."
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300"
          />
          <div className="hidden md:block text-left text-xs leading-tight">
            <div className="font-bold text-slate-900">Somchai P.</div>
            <div className="text-[10px] text-slate-500 font-mono">ID #8841</div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } finally {
                window.location.href = "/login";
              }
            }}
            title="ออกจากระบบ (Logout)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
