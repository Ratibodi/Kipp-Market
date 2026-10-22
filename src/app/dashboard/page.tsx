"use client";

import Link from "next/link";
import {
  Banknote,
  TrendingUp,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Download,
  Calendar,
  Store,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { STOCK_REORDER_WARNINGS } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function ManagerDashboardPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  return (
    <div className="flex min-h-screen bg-[#f8faf9] text-slate-800 font-sans">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
          {/* Header Title & Date Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("dash.title")}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  {t("dash.executiveOverview")}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {t("dash.shiftActive")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t("dash.subtitle")}
              </p>
            </div>

            {/* Filter and Export Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
              >
                <Store className="h-3.5 w-3.5 text-slate-500" />
                <span>{isTh ? "สาขา #01 - สุขุมวิท ซอย 24" : "Store #01 - Sukhumvit Soi 24"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>{t("dash.todayVsYesterday")}</span>
                <span className="text-[10px] text-slate-400 font-mono">14 Jun 2024</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#061a12] text-white hover:bg-[#0d2a1d] text-xs font-bold shadow-sm transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t("dash.exportReport")}</span>
                <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-mono">E</span>
              </button>
            </div>
          </div>

          {/* 4 Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. GROSS SALES */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("dash.grossSales")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
                    <Banknote className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-950 font-mono tracking-tight mt-1">
                  ฿24,850.00
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-2">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>+14.2%</span>
                  <span className="text-slate-500 font-normal">{t("dash.vsYesterday")} (฿21,750.00)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t("dash.netSales")}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <Link
                  href="/dashboard/transactions"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
                >
                  <span>{t("dash.salesBreakdown")}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* 2. GROSS PROFIT */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("dash.grossProfit")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                    ฿6,420.00
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#bef264] text-[#061a12] text-[11px] font-black">
                    {t("dash.margin")} 27.8%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t("dash.targetExceeded")}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t("dash.cogs")}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <Link
                  href="/dashboard/profit"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
                >
                  <span>{t("dash.marginAnalysis")}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* 3. TOTAL TRANSACTIONS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("dash.totalTransactions")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Receipt className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                    186
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t("dash.salesLogged")}</span>
                </div>
                <div className="text-xs text-slate-600 mt-2 flex items-center gap-2">
                  <span>{t("dash.avgBasket")} <strong className="font-mono text-slate-900">฿133.60</strong></span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t("dash.peakHour")}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <Link
                  href="/dashboard/transactions"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
                >
                  <span>{t("dash.viewAllTransactions")}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* 4. INVENTORY ATTENTION */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("dash.inventoryAttention")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-red-600 font-mono tracking-tight">
                    8 SKUs
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                    {t("dash.needsReorder")}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-semibold mt-2">
                  <span className="text-red-600">{t("dash.criticalOutOfStock")}</span> • {t("dash.lowStock")}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {isTh ? "ตัดรอบใบสั่งซื้อ PO อัตโนมัติ: 18:00 น." : "Automated PO cutoff: 18:00"}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <button
                  type="button"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
                >
                  <span>{t("dash.reviewStock")}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Middle Row: Hourly Sales Trend & Payment Breakdown + Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Hourly Sales Trend Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{t("dash.hourlyTrend")}</h3>
                    <p className="text-xs text-slate-500">
                      {t("dash.hourlySubtitle")}
                    </p>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#061a12]"></span>
                      <span>{t("dash.todayLegend")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <span className="h-2 w-3 rounded-full border border-dashed border-emerald-500 bg-emerald-100"></span>
                      <span>{t("dash.projectedLegend")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                      <span>{t("dash.yesterdayLegend")}</span>
                    </div>
                  </div>
                </div>

                {/* SVG Line / Area Graph */}
                <div className="relative mt-6 h-64 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                    {/* Horizontal Grid lines */}
                    <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="180" x2="580" y2="180" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Y-axis labels */}
                    <text x="15" y="34" fill="#94a3b8" fontSize="10" fontFamily="monospace">8k</text>
                    <text x="15" y="84" fill="#94a3b8" fontSize="10" fontFamily="monospace">6k</text>
                    <text x="15" y="134" fill="#94a3b8" fontSize="10" fontFamily="monospace">4k</text>
                    <text x="15" y="184" fill="#94a3b8" fontSize="10" fontFamily="monospace">2k</text>

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#84cc16" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Area fills (Rendered first as background) */}
                    {/* Today Actual Area gradient fill (06:00 to NOW 14:38) */}
                    <path
                      d="M 50 170 C 90 165, 130 140, 180 120 C 215 105, 238 45, 265 45 C 290 45, 312 115, 330 130 L 330 190 L 50 190 Z"
                      fill="url(#todayGrad)"
                    />

                    {/* Today Projected Area gradient fill (NOW 14:38 to 22:00) */}
                    <path
                      d="M 330 130 C 348 145, 380 138, 410 100 C 435 70, 445 48, 455 48 C 475 48, 495 85, 520 125 C 540 150, 555 160, 570 165 L 570 190 L 330 190 Z"
                      fill="url(#projectedGrad)"
                    />

                    {/* Yesterday line (dashed slate #94a3b8 for clear visibility) */}
                    <path
                      d="M 50 175 C 90 170, 130 150, 180 135 C 215 125, 240 75, 265 75 C 295 75, 315 145, 345 145 C 385 145, 420 60, 455 60 C 490 60, 520 135, 545 160 C 555 170, 562 175, 570 175"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.2"
                      strokeDasharray="4 4"
                    />

                    {/* Vertical dashed guide for Lunch Peak 12:30 */}
                    <line x1="265" y1="30" x2="265" y2="190" stroke="#84cc16" strokeDasharray="3 3" strokeWidth="1.2" />

                    {/* Vertical dashed guide for Current Time NOW */}
                    <line x1="330" y1="30" x2="330" y2="190" stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1.2" />

                    {/* Today Actual line (bold dark green #061a12 up to NOW) */}
                    <path
                      d="M 50 170 C 90 165, 130 140, 180 120 C 215 105, 238 45, 265 45 C 290 45, 312 115, 330 130"
                      fill="none"
                      stroke="#061a12"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Today Projected Evening curve (dashed emerald from NOW to 22:00) */}
                    <path
                      d="M 330 130 C 348 145, 380 138, 410 100 C 435 70, 445 48, 455 48 C 475 48, 495 85, 520 125 C 540 150, 555 160, 570 165"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                    />

                    {/* Lunch Peak Marker */}
                    <circle cx="265" cy="45" r="4.5" fill="#84cc16" stroke="#061a12" strokeWidth="2" />
                    <rect x="225" y="16" width="80" height="18" rx="4" fill="#061a12" stroke="#84cc16" strokeWidth="0.8" />
                    <text x="265" y="28" textAnchor="middle" fill="#bef264" fontSize="8" fontWeight="bold">
                      LUNCH PEAK 12:30
                    </text>

                    {/* Dinner Peak Marker (Target / Projected) */}
                    <circle cx="455" cy="48" r="4" fill="#10b981" stroke="#061a12" strokeWidth="2" />
                    <rect x="405" y="18" width="100" height="18" rx="4" fill="#061a12" stroke="#10b981" strokeWidth="0.8" />
                    <text x="455" y="30" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="bold">
                      DINNER 18:30 (EST)
                    </text>

                    {/* Current Time NOW marker */}
                    <circle cx="330" cy="130" r="7" fill="#ef4444" opacity="0.3" className="animate-ping" />
                    <circle cx="330" cy="130" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="318" y="142" width="24" height="15" rx="3" fill="#ef4444" />
                    <text x="330" y="153" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      NOW
                    </text>
                  </svg>

                  {/* X-axis time labels */}
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 px-6 pt-1">
                    <span>06:00</span>
                    <span>08:00</span>
                    <span>10:00</span>
                    <span className="font-bold text-slate-800">12:00</span>
                    <span className="font-bold text-slate-800">14:00</span>
                    <span>16:00</span>
                    <span>18:00</span>
                    <span>20:00</span>
                    <span>22:00</span>
                  </div>
                </div>
              </div>

              {/* Bottom Velocity Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs mt-4">
                <div>
                  <div className="text-[11px] text-slate-500">{t("dash.peakVelocity")}</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    ฿3,840.00 <span className="text-[11px] text-emerald-700">@ 12:45</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">{t("dash.transPerHour")}</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    32 avg <span className="text-[11px] text-slate-500">{t("dash.lunch")}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">{t("dash.basketVelocity")}</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    2.8 {isTh ? "ชิ้น / นาที" : "items / min"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Breakdown & Top Categories (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Payment Breakdown Donut Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{t("dash.paymentBreakdown")}</h3>
                    <p className="text-[11px] text-slate-500">{t("dash.tenderMethodDist")}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    {t("dash.reconciled")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-3">
                  {/* Donut representation */}
                  <div className="sm:col-span-5 relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      {/* PromptPay 48% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#061a12"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray="114 238"
                        strokeDashoffset="0"
                      />
                      {/* Cash 34% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#84cc16"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray="81 238"
                        strokeDashoffset="-114"
                      />
                      {/* Credit 14% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#0284c7"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray="33 238"
                        strokeDashoffset="-195"
                      />
                      {/* TrueMoney 4% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#ea580c"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray="10 238"
                        strokeDashoffset="-228"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">PROMPTPAY</span>
                      <span className="text-sm font-black text-slate-900">48%</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="sm:col-span-7 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#061a12]"></span>
                        <span className="font-semibold text-slate-800">{t("pos.promptpayQrBtn")}</span>
                      </div>
                      <span className="font-mono text-slate-600">฿11,928.00 (48%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#84cc16]"></span>
                        <span className="font-semibold text-slate-800">{isTh ? "เงินสดในเก๊ะ" : "Cash Register"}</span>
                      </div>
                      <span className="font-mono text-slate-600">฿8,449.00 (34%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]"></span>
                        <span className="font-semibold text-slate-800">{t("pos.creditCardBtn")}</span>
                      </div>
                      <span className="font-mono text-slate-600">฿3,479.00 (14%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ea580c]"></span>
                        <span className="font-semibold text-slate-800">{t("pos.trueMoneyBtn")}</span>
                      </div>
                      <span className="font-mono text-slate-600">฿994.00 (4%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Categories Progress Bars */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm">{t("dash.topCategories")}</h3>
                  <span className="text-[11px] text-slate-400">{t("dash.byGrossRev")}</span>
                </div>

                <div className="mt-3 space-y-3 text-xs">
                  {/* Ready-to-eat Meals */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">{isTh ? "อาหารพร้อมทาน" : "Ready-to-eat Meals"}</span>
                      <span className="font-mono text-slate-900">฿8,120.00</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#061a12] h-2 rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>

                  {/* Beverages */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">{t("quickpick.beverages")}</span>
                      <span className="font-mono text-slate-900">฿6,450.00</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-700 h-2 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>

                  {/* Snacks & Confectionery */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">{t("pos.snacks")}</span>
                      <span className="font-mono text-slate-900">฿4,210.00</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "42%" }} />
                    </div>
                  </div>

                  {/* Bakery */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">{t("quickpick.bakery")}</span>
                      <span className="font-mono text-slate-900">฿3,180.00</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: "32%" }} />
                    </div>
                  </div>

                  {/* Tobacco & Misc */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">{isTh ? "สินค้าทั่วไป & อื่นๆ" : "Tobacco & Misc"}</span>
                      <span className="font-mono text-slate-900">฿2,890.00</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-slate-400 h-2 rounded-full" style={{ width: "29%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Stock Reorder Warnings & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Stock Reorder Warnings (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-red-100 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{t("dash.stockWarnings")}</h3>
                      <p className="text-[11px] text-slate-500">{t("dash.autoPoAlerts")}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1 rounded-xl bg-[#061a12] hover:bg-[#0d2a1d] text-white text-xs font-bold transition shadow-2xs"
                  >
                    {t("dash.reorderAll")}
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-2">{isTh ? "สินค้า / บาร์โค้ด" : "ITEM / BARCODE"}</th>
                        <th className="pb-2 text-center">{isTh ? "คงเหลือ" : "STOCK"}</th>
                        <th className="pb-2 text-center">{isTh ? "จุดสั่งซื้อ" : "REORDER PT"}</th>
                        <th className="pb-2">{isTh ? "ผู้จัดจำหน่าย" : "SUPPLIER"}</th>
                        <th className="pb-2 text-right">{isTh ? "จัดการ" : "ACTION"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {STOCK_REORDER_WARNINGS.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 pr-2">
                            <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.barcode}</div>
                          </td>
                          <td className="py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                idx === 3
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.stock} {item.unit}
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-mono font-medium text-slate-700">
                            {item.reorderPt}
                          </td>
                          <td className="py-2.5 text-slate-600 text-[11px]">{item.supplier}</td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 transition"
                            >
                              {isTh ? "สั่งซื้อ" : "Reorder"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table Footer */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{isTh ? "ระยะเวลาส่งมอบ SLA: " : "Supplier delivery SLA: "}<strong className="text-slate-700">{isTh ? "ส่งรอบเย็นวันนี้ (ตัดรอบ 18:00 น.)" : "Same Day Evening (18:00 cutoff)"}</strong></span>
                <button
                  type="button"
                  className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
                >
                  <span>{isTh ? "ดูทั้ง 8 รายการ" : "View All 8 SKUs"}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Recent Transactions Live Feed (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-emerald-50 text-emerald-800">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{t("dash.recentTransactions")}</h3>
                      <p className="text-[11px] text-slate-500">{t("dash.liveFromLanes")}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t("dash.liveFeed")}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-2">{isTh ? "รหัสบิล / เวลา" : "TRX / TIME"}</th>
                        <th className="pb-2">{isTh ? "แคชเชียร์ / เลน" : "CASHIER / LANE"}</th>
                        <th className="pb-2 text-center">{isTh ? "จำนวน" : "ITEMS"}</th>
                        <th className="pb-2 text-right">{isTh ? "ยอดรวม" : "TOTAL"}</th>
                        <th className="pb-2">{isTh ? "ช่องทางจ่าย" : "PAYMENT"}</th>
                        <th className="pb-2 text-center">{isTh ? "สถานะ" : "STATUS"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      <tr className="hover:bg-slate-50 transition">
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900 font-mono text-xs">TRX-9481</div>
                          <div className="text-[10px] text-slate-400 font-mono">14:28:12</div>
                        </td>
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-800">{isTh ? "สมชาย พ." : "Somchai P."}</div>
                          <div className="text-[10px] text-slate-400">{isTh ? "เครื่อง 01" : "Reg 01"}</div>
                        </td>
                        <td className="py-2.5 text-center font-mono">4</td>
                        <td className="py-2.5 text-right font-black font-mono text-slate-900">
                          ฿196.00
                        </td>
                        <td className="py-2.5 text-slate-600 font-medium">{t("footer.cashKey")}</td>
                        <td className="py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {isTh ? "ชำระแล้ว" : "Paid"}
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900 font-mono text-xs">TRX-9480</div>
                          <div className="text-[10px] text-slate-400 font-mono">14:24:45</div>
                        </td>
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-800">{isTh ? "สมชาย พ." : "Somchai P."}</div>
                          <div className="text-[10px] text-slate-400">{isTh ? "เครื่อง 01" : "Reg 01"}</div>
                        </td>
                        <td className="py-2.5 text-center font-mono">2</td>
                        <td className="py-2.5 text-right font-black font-mono text-slate-900">
                          ฿68.00
                        </td>
                        <td className="py-2.5 text-slate-600 font-medium">{t("pos.promptpayQrBtn")}</td>
                        <td className="py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {isTh ? "ชำระแล้ว" : "Paid"}
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900 font-mono text-xs">TRX-9479</div>
                          <div className="text-[10px] text-slate-400 font-mono">14:19:02</div>
                        </td>
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-800">{isTh ? "นุ่น ร." : "Noon R."}</div>
                          <div className="text-[10px] text-slate-400">{isTh ? "เครื่อง 02" : "Reg 02"}</div>
                        </td>
                        <td className="py-2.5 text-center font-mono">7</td>
                        <td className="py-2.5 text-right font-black font-mono text-slate-900">
                          ฿342.50
                        </td>
                        <td className="py-2.5 text-slate-600 font-medium">{t("pos.promptpayQrBtn")}</td>
                        <td className="py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {isTh ? "ชำระแล้ว" : "Paid"}
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900 font-mono text-xs">TRX-9478</div>
                          <div className="text-[10px] text-slate-400 font-mono">14:12:30</div>
                        </td>
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-800">{isTh ? "สมชาย พ." : "Somchai P."}</div>
                          <div className="text-[10px] text-slate-400">{isTh ? "เครื่อง 01" : "Reg 01"}</div>
                        </td>
                        <td className="py-2.5 text-center font-mono">1</td>
                        <td className="py-2.5 text-right font-black font-mono text-slate-900">
                          ฿45.00
                        </td>
                        <td className="py-2.5 text-slate-600 font-medium">{t("pos.trueMoneyBtn")}</td>
                        <td className="py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {isTh ? "ชำระแล้ว" : "Paid"}
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="py-2.5">
                          <div className="font-bold text-red-700 font-mono text-xs">TRX-9477</div>
                          <div className="text-[10px] text-slate-400 font-mono">14:05:18</div>
                        </td>
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-800">{isTh ? "นุ่น ร." : "Noon R."}</div>
                          <div className="text-[10px] text-slate-400">{isTh ? "เครื่อง 02" : "Reg 02"}</div>
                        </td>
                        <td className="py-2.5 text-center font-mono">3</td>
                        <td className="py-2.5 text-right font-black font-mono text-slate-400 line-through">
                          ฿115.00
                        </td>
                        <td className="py-2.5 text-slate-500 font-medium">{isTh ? "ยกเลิก / คืนเงิน" : "Voided / Refund"}</td>
                        <td className="py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                            {isTh ? "ยกเลิก" : "Voided"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{isTh ? "แสดง 5 รายการล่าสุดจาก 186 บิลการขาย" : "Showing last 5 of 186 store transactions"}</span>
                <Link
                  href="/dashboard/transactions"
                  className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
                >
                  <span>{t("dash.auditingJournal")}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
