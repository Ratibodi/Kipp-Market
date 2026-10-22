"use client";

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
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const isDashboard = pathname === "/dashboard";
  const isTransactions = pathname.startsWith("/dashboard/transactions") || pathname === "/transactions";

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
              <span>{isTh ? "บันทึกค่าใช้จ่ายร้าน" : "Store Expenses"}</span>
            </Link>
          </div>

          {/* STORE SETTINGS & PLATFORM */}
          <div className="flex flex-col gap-1">
            <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              {isTh ? "การตั้งค่า & แพลตฟอร์ม" : "Settings & Platform"}
            </div>
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
              <Users className="h-4 w-4 text-purple-400" />
              <span>{isTh ? "Super Admin (แพลตฟอร์ม)" : "Platform Super Admin"}</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-[#0e2f20] bg-[#05140e] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
            alt="Somchai P."
            className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-400/50"
          />
          <div className="text-xs leading-tight">
            <div className="font-bold text-white">{isTh ? "สมชาย พ." : "Somchai P."}</div>
            <div className="text-[10px] text-slate-400">{t("nav.storeManager")}</div>
          </div>
        </div>

        <Link
          href="/pos"
          title={t("nav.logout")}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#0f3424] transition"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
