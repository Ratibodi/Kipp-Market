"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Store,
  Clock,
  Bell,
  Monitor,
  ChevronDown,
  LogOut,
  Check,
  Building2,
  Lock,
} from "lucide-react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

interface HeaderUser {
  id: string;
  displayName: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  branchId?: string;
  branchName?: string;
  branchCode?: string;
}

interface BranchItem {
  id: string;
  name: string;
  code: string;
  address?: string;
}

export function DashboardHeader() {
  const { t, language } = useLanguage();
  const isTh = language === "th";
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(null);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentBranchId = searchParams.get("branchId") || "";

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

    async function loadBranches() {
      try {
        const res = await fetch("/api/branches");
        if (res.ok) {
          const data = await res.json();
          if (data?.branches) {
            setBranches(data.branches);
          }
        }
      } catch (err) {
        console.warn("Header load branches failed:", err);
      }
    }

    fetchMe();
    loadBranches();
  }, []);

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const timePart = now.toLocaleTimeString("en-GB", { hour12: false });
      setTimeStr(`${datePart} • ${timePart}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    }
    if (isBranchDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBranchDropdownOpen]);

  const handleSelectBranch = (branchId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (branchId) {
      params.set("branchId", branchId);
    } else {
      params.delete("branchId");
    }
    setIsBranchDropdownOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  const isOwner = currentUser?.role === "OWNER";
  const isManager = currentUser?.role === "MANAGER";

  const activeBranch = branches.find((b) => b.id === currentBranchId);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none font-sans z-30">
      {/* Left: Store Selector, Time, Sync Status */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        {/* Branch Indicator / Selector */}
        {isOwner ? (
          /* OWNER: Interactive Dropdown to switch or view all branches */
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsBranchDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold transition shadow-2xs cursor-pointer"
            >
              <Store className="h-4 w-4 text-emerald-700 shrink-0" />
              <span className="truncate max-w-[200px]">
                {currentBranchId && activeBranch
                  ? activeBranch.name
                  : isTh
                  ? "ทุกสาขา (ภาพรวม All Branches)"
                  : "All Branches"}
              </span>
              {activeBranch?.code && (
                <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                  {activeBranch.code}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                  isBranchDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isTh ? "เลือกสาขาที่ต้องการดูข้อมูล" : "Select Branch View"}
                </div>

                {/* Option: All Branches */}
                <button
                  type="button"
                  onClick={() => handleSelectBranch("")}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer ${
                    !currentBranchId ? "bg-emerald-50/70 text-emerald-800 font-bold" : "text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span>{isTh ? "ทุกสาขา (ภาพรวม All Branches)" : "All Branches Overview"}</span>
                  </div>
                  {!currentBranchId && <Check className="h-4 w-4 text-emerald-600" />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Individual Branches List */}
                {branches.map((b) => {
                  const isSelected = currentBranchId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBranch(b.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer ${
                        isSelected ? "bg-emerald-50/70 text-emerald-800 font-bold" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{b.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">({b.code})</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : isManager ? (
          /* MANAGER: Locked to their own designated branch */
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 font-bold shadow-2xs"
            title={
              isTh
                ? "ผู้จัดการสามารถเข้าถึงและดูข้อมูลเฉพาะสาขาที่ตนเองสังกัดเท่านั้น"
                : "Branch Managers can only view their designated branch"
            }
          >
            <Store className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="truncate max-w-[200px]">
              {currentUser?.branchName || "Kipp Market - Sukhumvit Soi 24"}
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">
              {currentUser?.branchCode || "BKK-024"}
            </span>
            <span className="text-[10px] text-blue-600/90 font-medium flex items-center gap-1 bg-white/70 px-1.5 py-0.5 rounded">
              <Lock className="h-3 w-3" />
              <span>{isTh ? "สาขาของคุณ" : "Assigned"}</span>
            </span>
          </div>
        ) : (
          /* Fallback for Cashier or unauthenticated */
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold shadow-2xs">
            <Store className="h-4 w-4 text-emerald-700" />
            <span>Kipp Market - Sukhumvit Soi 24</span>
          </div>
        )}

        {/* Date and Time */}
        <div className="hidden sm:flex items-center gap-1.5 font-medium text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{timeStr || "Wed 14 Jun • 14:38:02"}</span>
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
