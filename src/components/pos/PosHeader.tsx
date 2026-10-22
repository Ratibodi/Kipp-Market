"use client";

import Link from "next/link";
import { Store, LogOut } from "lucide-react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

interface PosHeaderProps {
  onCloseShift?: () => void;
  onLockScreen?: () => void;
  activeStaffName?: string;
  activeStaffRole?: string;
  heldCartsCount?: number;
  onOpenHeldCarts?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function PosHeader({
  onCloseShift,
  onLockScreen,
  activeStaffName = "Somchai P.",
  activeStaffRole = "ID #8841",
  heldCartsCount = 0,
  onOpenHeldCarts,
  isMuted = false,
  onToggleMute,
}: PosHeaderProps) {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  return (
    <header className="bg-[#061a12] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#0f3424] shadow-md select-none shrink-0">
      {/* Left: Brand & Register Badge */}
      <div className="flex items-center gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-sm shadow-inner group-hover:bg-emerald-500/30 transition">
            <Store className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-base tracking-wider text-white flex items-center gap-1">
            KIPP <span className="text-emerald-400 font-black">POS</span>
          </span>
        </Link>

        {/* Register & Shift Status Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#0b291d] border border-emerald-600/30 text-xs text-emerald-200">
          <span className="font-semibold text-white">
            {t("nav.register")} 01 • Main Checkout
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300/90 text-[11px]">
            {t("nav.shift")} A • {t("nav.onlineConnected")}
          </span>
        </div>

        {/* Held Carts Badge Button (Design Doc 7.15 [F6]) */}
        {heldCartsCount > 0 && (
          <button
            type="button"
            onClick={onOpenHeldCarts}
            title={isTh ? "บิลที่พักไว้ [F6]" : "Held Carts [F6]"}
            className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 animate-pulse shadow-sm cursor-pointer transition"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>{isTh ? `พักบิล ${heldCartsCount} ใบ` : `Held (${heldCartsCount})`}</span>
            <span className="font-mono text-[10px] bg-amber-400/20 px-1 rounded text-amber-200">F6</span>
          </button>
        )}
      </div>

      {/* Right: Language Switcher, Sound Toggle, Cashier Info & Navigation */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle (Design Doc 7.16) */}
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? (isTh ? "เปิดเสียง (Unmute)" : "Unmute Audio") : (isTh ? "ปิดเสียง (Mute)" : "Mute Audio")}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1 shadow-sm cursor-pointer ${
            isMuted
              ? "bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/60"
              : "bg-[#0e3324] border-emerald-700/40 text-emerald-200 hover:text-white hover:bg-[#144733]"
          }`}
        >
          <span>{isMuted ? "🔇" : "🔊"}</span>
          <span className="hidden lg:inline text-[11px]">
            {isMuted ? (isTh ? "ปิดเสียง" : "Muted") : (isTh ? "เสียงเปิด" : "Sound")}
          </span>
        </button>

        {/* Language Switcher Button (TH / EN) */}
        <LanguageToggle variant="dark" />

        {/* Lock Screen Button */}
        <button
          type="button"
          onClick={onLockScreen}
          title={isTh ? "ล็อคหน้าจอ [F12]" : "Lock POS Screen [F12]"}
          className="px-2.5 py-1.5 rounded-lg bg-[#0e3324] hover:bg-[#144733] border border-emerald-700/40 text-emerald-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span>🔒</span>
          <span className="hidden md:inline">{isTh ? "ล็อคหน้าจอ" : "Lock"}</span>
        </button>

        {/* Shift / Cash Drawer Button */}
        <button
          type="button"
          onClick={onCloseShift}
          title={isTh ? "กะ & ลิ้นชักเงิน [F8]" : "Shift & Cash Drawer"}
          className="px-2.5 py-1.5 rounded-lg bg-[#0e3324] hover:bg-[#144733] border border-emerald-700/40 text-emerald-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span>💼</span>
          <span className="hidden md:inline">{isTh ? "กะ & ลิ้นชัก" : "Shift"}</span>
        </button>

        {/* Active Staff Profile Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0b291d]/80 border border-emerald-700/30">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
              activeStaffRole === "OWNER"
                ? "bg-amber-600 ring-1 ring-amber-400"
                : activeStaffRole === "MANAGER"
                ? "bg-blue-600 ring-1 ring-blue-400"
                : "bg-emerald-600 ring-1 ring-emerald-400"
            }`}
          >
            {activeStaffName ? activeStaffName.slice(0, 2) : "KM"}
          </div>
          <div className="text-left text-xs leading-tight">
            <div className="font-semibold text-white truncate max-w-[120px]">{activeStaffName}</div>
            <div
              className={`text-[9px] font-mono font-bold ${
                activeStaffRole === "OWNER"
                  ? "text-amber-300"
                  : activeStaffRole === "MANAGER"
                  ? "text-blue-300"
                  : "text-emerald-300"
              }`}
            >
              {activeStaffRole === "OWNER"
                ? isTh ? "👑 เจ้าของร้าน" : "Owner"
                : activeStaffRole === "MANAGER"
                ? isTh ? "🛡️ ผู้จัดการ" : "Manager"
                : isTh ? "🏷️ แคชเชียร์" : "Cashier"}
            </div>
          </div>
        </div>

        {/* Store Management Link - Strictly hidden for CASHIER */}
        {activeStaffRole !== "CASHIER" && (
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-[#0e3324] hover:bg-[#144733] border border-emerald-700/40 text-emerald-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <span>{t("nav.storeManagement")}</span>
          </Link>
        )}

        {/* Exit / Logout Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } finally {
              window.location.href = "/login?switch=true";
            }
          }}
          title={isTh ? "ออกจากระบบร้านค้า (Logout)" : "Exit Store / Logout"}
          className="p-1.5 rounded-lg bg-[#0e3324] hover:bg-rose-950/60 border border-emerald-700/40 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
