"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  FileSpreadsheet,
  Receipt,
  Package,
  Layers,
  Boxes,
  Truck,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Store,
  LogOut,
  Users,
  Lock,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CurrentUser {
  id: string;
  displayName: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  tenantId: string;
  branchId?: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const isDashboard = pathname === "/dashboard";
  const isTransactions = pathname.startsWith("/dashboard/transactions") || pathname === "/transactions";

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

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
        console.warn("Failed to fetch current user session:", err);
      }
    }
    fetchMe();
  }, []);

  return (
    <aside className="w-64 bg-[#071912] text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-[#0d2a1d] min-h-screen font-sans">
      <div className="p-4 flex flex-col gap-4">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black shadow-inner">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-white">KIPP MARKET</div>
            <div className="text-[10px] text-emerald-400/80 font-semibold tracking-wider uppercase">
              {t("nav.storeManagement")}
            </div>
          </div>
        </Link>

        {/* Current Branch Pill */}
        <div className="mx-1 px-3 py-1.5 rounded-xl bg-[#0b241a] border border-emerald-800/40 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-[11px] text-slate-200">
              {isTh ? "สาขาสุขุมวิท ซอย 24" : "Sukhumvit Soi 24"}
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 font-bold">#024</span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex flex-col gap-4 text-xs mt-2">
          {/* OPERATIONS */}
          <div className="flex flex-col gap-1">
            <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              {t("nav.operations")}
            </div>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                isDashboard
                  ? "bg-[#bef264] text-[#061a12] shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t("nav.dashboard")}</span>
            </Link>

            <Link
              href="/pos"
              className="flex items-center justify-between px-3 py-2 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-[#0c2e20] transition"
            >
              <div className="flex items-center gap-2.5">
                <Monitor className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.launchPos")}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80 font-bold px-1.5 py-0.5 rounded bg-[#092218]">
                F1
              </span>
            </Link>
          </div>

          {/* TRANSACTIONS & SALES */}
          <div className="flex flex-col gap-1">
            <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              {t("nav.transactionsSales")}
            </div>
            <Link
              href="/dashboard/transactions"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                isTransactions
                  ? "bg-[#bef264] text-[#061a12] shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{t("nav.transactions")}</span>
            </Link>

            <button
              type="button"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0c2e20] transition text-left"
            >
              <Receipt className="h-4 w-4 text-slate-500" />
              <span>{t("nav.receiptsInvoices")}</span>
            </button>
          </div>

          {/* INVENTORY & PRODUCTS */}
          <div className="flex flex-col gap-1">
            <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              {t("nav.inventoryProducts")}
            </div>
            <Link
              href="/dashboard/products"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                pathname.startsWith("/dashboard/products")
                  ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>{t("nav.productCatalog")}</span>
            </Link>
            <Link
              href="/dashboard/inventory/receipt"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                pathname.startsWith("/dashboard/inventory/receipt")
                  ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>{isTh ? "รับสินค้าเข้าสต็อก (GR)" : "Goods Receipt"}</span>
            </Link>
            <Link
              href="/dashboard/inventory/stock-take"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                pathname.startsWith("/dashboard/inventory/stock-take")
                  ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>{t("nav.stockTaking")}</span>
            </Link>
          </div>

          {/* FINANCE & EXPENSES */}
          <div className="flex flex-col gap-1">
            <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              {isTh ? "การเงิน & ค่าใช้จ่าย" : "Finance & Expenses"}
            </div>
            <Link
              href="/dashboard/profit"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                pathname.startsWith("/dashboard/profit")
                  ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{t("nav.profit")}</span>
            </Link>
            <Link
              href="/dashboard/expenses"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                pathname.startsWith("/dashboard/expenses")
                  ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>{isTh ? "ค่าใช้จ่าย & เงินรับเข้า" : "Expenses & Inflows"}</span>
            </Link>
          </div>

          {/* STORE SETTINGS & PLATFORM - Visible only to OWNER, or locked for MANAGER */}
          {(!currentUser || currentUser.role === "OWNER") && (
            <div className="flex flex-col gap-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                {isTh ? "การตั้งค่า & เจ้าของร้าน" : "Settings & Store Owner"}
              </div>
              <Link
                href="/dashboard/staff"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                  pathname.startsWith("/dashboard/staff")
                    ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{isTh ? "จัดการพนักงาน & แคชเชียร์" : "Staff & Cashiers"}</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                  pathname.startsWith("/dashboard/settings")
                    ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
                }`}
              >
                <Store className="h-4 w-4" />
                <span>{isTh ? "ตั้งค่า PromptPay & ร้าน" : "Store & Payment Settings"}</span>
              </Link>
              <Link
                href="/admin"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                  pathname.startsWith("/admin")
                    ? "bg-purple-400 text-slate-950 font-bold shadow-sm"
                    : "text-purple-300/80 hover:text-purple-200 hover:bg-[#0c2e20]"
                }`}
              >
                <Crown className="h-4 w-4 text-purple-400" />
                <span>{isTh ? "Super Admin (แพลตฟอร์ม)" : "Platform Super Admin"}</span>
              </Link>
            </div>
          )}

          {currentUser?.role === "MANAGER" && (
            <div className="mx-1 p-2.5 rounded-2xl bg-[#051710] border border-blue-900/50 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isTh ? "บัญชีผู้จัดการสาขา" : "Store Manager Mode"}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {isTh
                  ? "เมนูจัดการทีมงานและตั้งค่าบัญชีรับเงิน สงวนสิทธิ์ให้เจ้าของร้านเท่านั้น"
                  : "Staff PIN management & payment settings are restricted to Store Owner."}
              </p>
            </div>
          )}
        </nav>
      </div>

      {/* Dynamic User Profile at Bottom */}
      <div className="p-3.5 border-t border-[#0e2f20] bg-[#05140e] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentUser?.role === "OWNER"
                ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50"
                : currentUser?.role === "MANAGER"
                ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/50"
                : "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50"
            }`}
          >
            {currentUser?.displayName ? currentUser.displayName.slice(0, 2) : "KM"}
          </div>
          <div className="text-xs leading-tight min-w-0">
            <div className="font-bold text-white truncate">
              {currentUser?.displayName || (isTh ? "กำลังโหลดโปรไฟล์..." : "Loading...")}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono uppercase ${
                  currentUser?.role === "OWNER"
                    ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                    : currentUser?.role === "MANAGER"
                    ? "bg-blue-950/80 text-blue-300 border border-blue-800/60"
                    : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                }`}
              >
                {currentUser?.role === "OWNER"
                  ? isTh ? "👑 เจ้าของร้าน" : "Owner"
                  : currentUser?.role === "MANAGER"
                  ? isTh ? "🛡️ ผู้จัดการ" : "Manager"
                  : isTh ? "🏷️ แคชเชียร์" : "Cashier"}
              </span>
            </div>
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
          title={isTh ? "ออกจากระบบ (Logout)" : "Log Out"}
          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/40 transition cursor-pointer shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
