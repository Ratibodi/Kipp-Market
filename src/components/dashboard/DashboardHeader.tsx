"use client";

import { useState, useEffect } from "react";
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

interface HeaderUser {
  id: string;
  displayName: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
}

export function DashboardHeader() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.warn("Header fetch me failed:", err);
      }
    }
    fetchMe();
  }, []);

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
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
              currentUser?.role === "OWNER"
                ? "bg-amber-600 ring-2 ring-amber-300"
                : currentUser?.role === "MANAGER"
                ? "bg-blue-600 ring-2 ring-blue-300"
                : "bg-emerald-600 ring-2 ring-emerald-300"
            }`}
          >
            {currentUser?.displayName ? currentUser.displayName.slice(0, 2) : "KM"}
          </div>
          <div className="hidden md:block text-left text-xs leading-tight">
            <div className="font-bold text-slate-900 truncate max-w-[130px]">
              {currentUser?.displayName || "กำลังโหลด..."}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {currentUser?.role === "OWNER"
                ? "👑 เจ้าของร้าน"
                : currentUser?.role === "MANAGER"
                ? "🛡️ ผู้จัดการสาขา"
                : "🏷️ แคชเชียร์"}
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } finally {
                window.location.href = "/login?switch=true";
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
