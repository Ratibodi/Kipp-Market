"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Banknote,
  Percent,
  Receipt,
  Download,
  Calendar,
  Store,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useLanguage } from "@/context/LanguageContext";
import { ProfitAnalyticsResponse } from "@/app/api/dashboard/profit/route";

const THAI_MONTH_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];
const ENG_MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function getSampledIndices(total: number, maxSamples = 6): number[] {
  if (total <= 0) return [];
  if (total <= maxSamples) return Array.from({ length: total }, (_, i) => i);
  const result: number[] = [];
  for (let i = 0; i < maxSamples; i++) {
    const idx = Math.round((i / (maxSamples - 1)) * (total - 1));
    if (!result.includes(idx)) {
      result.push(idx);
    }
  }
  return result;
}

export default function ProfitAnalyticsPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "month">("7d");
  const [branches, setBranches] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [data, setData] = useState<ProfitAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((json) => {
        if (json?.branches && Array.isArray(json.branches)) {
          setBranches(json.branches);
        }
      })
      .catch((err) => console.warn("Failed to load branches:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({ period });
    if (selectedBranchId) {
      query.set("branchId", selectedBranchId);
    }

    fetch(`/api/dashboard/profit?${query.toString()}`)
      .then((res) => res.json())
      .then((json: ProfitAnalyticsResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load profit data:", err);
        setLoading(false);
      });
  }, [period, selectedBranchId]);

  const handleExportCsv = () => {
    if (!data) return;

    const headers = isTh
      ? ["วันที่", "วัน", "ยอดขายสุทธิ (บาท)", "ต้นทุนสินค้า COGS (บาท)", "ค่าใช้จ่ายดำเนินงาน (บาท)", "กำไรสุทธิ (บาท)", "อัตรากำไร (%)"]
      : ["Date", "Day", "Net Revenue (THB)", "COGS (THB)", "Expenses (THB)", "Net Profit (THB)", "Margin (%)"];

    const rows = data.dailyTrend.map((d) => [
      `"${d.date}"`,
      `"${d.dayLabel}"`,
      d.netRevenue.toFixed(2),
      d.cogs.toFixed(2),
      d.expenses.toFixed(2),
      d.netProfit.toFixed(2),
      `${d.marginPercent.toFixed(1)}%`,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Thai characters seamlessly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kipp_profit_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = data?.summary;
  const maxDayVal = data
    ? Math.max(...data.dailyTrend.map((d) => Math.max(d.netRevenue, d.cogs, d.netProfit)), 1000) * 1.15
    : 35000;

  return (
    <div className="flex min-h-screen bg-[#f8faf9] text-slate-800 font-sans">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#061a12] text-[#bef264] flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {t("profit.title")}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("profit.subtitle")}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Period Selection */}
            <div className="flex flex-wrap items-center gap-2.5">
              {data?.branchFilter?.isRestrictedToBranch ? (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 shadow-2xs">
                  <Store className="h-3.5 w-3.5 text-blue-600" />
                  <span>🔒 {isTh ? "เฉพาะสาขา:" : "Branch:"} {data.branchFilter.branchName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
                  <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="">{isTh ? "ทุกสาขา (All Branches)" : "All Branches"}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Period Buttons */}
              <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setPeriod("today")}
                  className={`px-3 py-1 rounded-lg transition ${
                    period === "today"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  {t("profit.today")}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("7d")}
                  className={`px-3 py-1 rounded-lg transition ${
                    period === "7d"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  {t("profit.7d")}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("30d")}
                  className={`px-3 py-1 rounded-lg transition ${
                    period === "30d"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  {t("profit.30d")}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("month")}
                  className={`px-3 py-1 rounded-lg transition ${
                    period === "month"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  {t("profit.month")}
                </button>
              </div>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={!data}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#061a12] text-white hover:bg-[#0d2a1d] text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t("profit.exportCsv")}</span>
              </button>
            </div>
          </div>

          {/* Top 4 Financial KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. NET REVENUE (ยอดขายสุทธิ) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("profit.netRevenue")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
                    <Banknote className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-950 font-mono tracking-tight mt-1">
                  {loading || !summary
                    ? "..."
                    : `฿${summary.netRevenue.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-2">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>{isTh ? "ไม่รวม VAT 7%" : "Net of 7% VAT"}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {isTh ? "ยอดขายรวมภาษี: " : "Gross with VAT: "}
                  <span className="font-mono font-medium text-slate-600">
                    ฿{summary?.grossSales.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00"}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500 flex justify-between">
                <span>{t("profit.ordersCount")}</span>
                <span className="font-mono font-bold text-slate-800">{summary?.totalOrders || 0}</span>
              </div>
            </div>

            {/* 2. COST OF GOODS SOLD (COGS) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("profit.cogs")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
                  {loading || !summary
                    ? "..."
                    : `-฿${summary.cogs.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-2">
                  <span>
                    {isTh ? "สัดส่วนต้นทุนสินค้า: " : "Cost Ratio: "}
                    <strong className="text-slate-900 font-mono">
                      {summary && summary.netRevenue > 0
                        ? `${((summary.cogs / summary.netRevenue) * 100).toFixed(1)}%`
                        : "0%"}
                    </strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {isTh ? "คำนวณจากต้นทุนเฉลี่ยเคลื่อนที่ (Moving Avg)" : "Moving average acquisition cost"}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500 flex justify-between">
                <span>{t("profit.grossMargin")}</span>
                <span className="font-mono font-bold text-emerald-700">
                  {summary?.grossMarginPercent.toFixed(1) || 0}%
                </span>
              </div>
            </div>

            {/* 3. GROSS PROFIT (กำไรขั้นต้น) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("profit.grossProfit")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Percent className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                    {loading || !summary
                      ? "..."
                      : `฿${summary.grossProfit.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black font-mono">
                    {summary?.grossMarginPercent.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isTh ? "ก่อนหักค่าใช้จ่ายร้านค้า" : "Before store operating expenses"}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {t("profit.expenses")}:{" "}
                  <span className="font-mono font-medium text-amber-700">
                    -฿{summary?.totalExpenses.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00"}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500 flex justify-between">
                <span>{t("profit.avgBasketProfit")}</span>
                <span className="font-mono font-bold text-slate-800">
                  ฿{summary?.avgBasketProfit.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            {/* 4. NET PROFIT (กำไรสุทธิคงเหลือจริง) */}
            <div className="bg-[#061a12] text-white rounded-2xl p-5 border border-emerald-950 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    {t("profit.netProfit")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#bef264]/20 text-[#bef264] flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-[#bef264] font-mono tracking-tight">
                    {loading || !summary
                      ? "..."
                      : `฿${summary.netProfit.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#bef264] text-[#061a12] text-[11px] font-black font-mono">
                    {summary?.netMarginPercent.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mt-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#bef264]" />
                  <span>{isTh ? "กำไรเข้ากระเป๋าแท้จริง" : "True bottom-line earnings"}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {isTh ? "หักค่าไฟ ค่าเช่า และของใช้แล้ว" : "All operating expenses deducted"}
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-900/60 mt-3 text-[11px] text-slate-300 flex justify-between">
                <span>{t("profit.netMargin")}</span>
                <span className="font-mono font-bold text-[#bef264]">
                  {summary?.netMarginPercent.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: Multi-Bar P&L Trend Chart & Category Profitability */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Multi-Bar Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{t("profit.pnlTrend")}</h3>
                    <p className="text-xs text-slate-500">{t("profit.pnlTrendSub")}</p>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#061a12]"></span>
                      <span>{isTh ? "ยอดขาย" : "Revenue"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                      <span>{isTh ? "ต้นทุน" : "COGS"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#84cc16]"></span>
                      <span>{isTh ? "กำไรสุทธิ" : "Net Profit"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <span className="h-1 w-3 bg-emerald-600 rounded"></span>
                      <span>{isTh ? "Margin %" : "Margin %"}</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Bar & Margin Line Chart */}
                <div className="relative mt-6 h-72 w-full">
                  {loading || !data ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2 text-emerald-600" />
                      <span>{isTh ? "กำลังคำนวณตัวเลขกำไร..." : "Computing profit metrics..."}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between">
                      {/* Interactive Canvas with subtle guide lines */}
                      <div className="relative flex-1 w-full min-w-0 flex items-end justify-between px-1 sm:px-2 pb-2 border-b border-slate-200">
                        {/* Background guide lines */}
                        <div className="absolute inset-x-0 top-0 bottom-2 flex flex-col justify-between pointer-events-none opacity-40">
                          <div className="border-b border-dashed border-slate-200 w-full" />
                          <div className="border-b border-dashed border-slate-200 w-full" />
                          <div className="border-b border-dashed border-slate-200 w-full" />
                        </div>

                        {data.dailyTrend.map((d, idx) => {
                          const isLongPeriod = data.dailyTrend.length > 10;
                          const isSingleDay = data.dailyTrend.length === 1;
                          const revH = Math.min(100, Math.max(0, (d.netRevenue / maxDayVal) * 100));
                          const cogsH = Math.min(100, Math.max(0, (d.cogs / maxDayVal) * 100));
                          const profH = Math.min(100, Math.max(0, (d.netProfit / maxDayVal) * 100));
                          const isHovered = hoveredDayIndex === idx;

                          // Dynamic bar sizing
                          const barWidth = isSingleDay
                            ? "w-8 sm:w-12 max-w-[48px]"
                            : isLongPeriod
                            ? "w-1 sm:w-1.5 md:w-2 max-w-[7px]"
                            : "w-2.5 sm:w-3.5 md:w-4 max-w-[16px]";
                          const barGap = isSingleDay
                            ? "gap-2 sm:gap-3"
                            : isLongPeriod
                            ? "gap-[1px] sm:gap-[1.5px]"
                            : "gap-1 sm:gap-1.5";

                          return (
                            <div
                              key={d.date}
                              onMouseEnter={() => setHoveredDayIndex(idx)}
                              onMouseLeave={() => setHoveredDayIndex(null)}
                              className="relative flex-1 min-w-0 flex flex-col items-center justify-end h-full group cursor-pointer z-10"
                            >
                              {/* Hover Tooltip Popup with edge-safe positioning */}
                              {isHovered && (
                                <div
                                  className={`absolute -top-28 z-50 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-2xl border border-slate-700 pointer-events-none whitespace-nowrap min-w-[155px] ${
                                    idx < 4
                                      ? "left-0"
                                      : idx > data.dailyTrend.length - 5
                                      ? "right-0"
                                      : "left-1/2 -translate-x-1/2"
                                  }`}
                                >
                                  <div className="font-bold text-[#bef264] border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between">
                                    <span>{d.dayLabel}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{d.date}</span>
                                  </div>
                                  <div className="flex justify-between gap-3 text-slate-300 py-0.5">
                                    <span>{isTh ? "ยอดขาย (Net):" : "Revenue:"}</span>
                                    <span className="font-mono text-white font-medium">฿{d.netRevenue.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between gap-3 text-slate-400 py-0.5">
                                    <span>{isTh ? "ต้นทุนสินค้า:" : "COGS:"}</span>
                                    <span className="font-mono text-slate-300">-฿{d.cogs.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between gap-3 text-amber-300/80 py-0.5">
                                    <span>{isTh ? "ค่าใช้จ่ายร้าน:" : "Expenses:"}</span>
                                    <span className="font-mono text-amber-200">-฿{d.expenses.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between gap-3 text-emerald-400 font-bold border-t border-slate-700/80 pt-1.5 mt-1">
                                    <span>{isTh ? "กำไรสุทธิ:" : "Net Profit:"}</span>
                                    <span className="font-mono text-[#bef264]">
                                      ฿{d.netProfit.toLocaleString()} ({d.marginPercent}%)
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* 3 Side-by-Side Bars */}
                              <div className={`w-full flex items-end justify-center ${barGap} h-full`}>
                                {/* Bar 1: Net Revenue */}
                                <div
                                  style={{ height: `${revH}%` }}
                                  className={`${barWidth} rounded-t-[2px] bg-[#061a12] transition-all duration-200 origin-bottom ${
                                    isHovered ? "opacity-100 scale-y-105 bg-emerald-950" : "opacity-90"
                                  }`}
                                />
                                {/* Bar 2: COGS */}
                                <div
                                  style={{ height: `${cogsH}%` }}
                                  className={`${barWidth} rounded-t-[2px] bg-slate-300 transition-all duration-200 origin-bottom ${
                                    isHovered ? "opacity-100 scale-y-105 bg-slate-400" : "opacity-80"
                                  }`}
                                />
                                {/* Bar 3: Net Profit */}
                                <div
                                  style={{ height: `${profH}%` }}
                                  className={`${barWidth} rounded-t-[2px] bg-[#84cc16] transition-all duration-200 origin-bottom ${
                                    isHovered ? "opacity-100 scale-y-105 bg-lime-400" : "opacity-90"
                                  }`}
                                />
                              </div>

                              {/* Margin % Badge above bar on hover */}
                              <div
                                className={`text-[9px] font-mono font-bold transition-opacity absolute -top-4 pointer-events-none ${
                                  isHovered ? "text-emerald-800 opacity-100" : "text-transparent opacity-0"
                                }`}
                              >
                                {d.marginPercent}%
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* X-axis date labels */}
                      {data.dailyTrend.length > 10 ? (
                        <div className="relative w-full h-6 mt-2 px-1 sm:px-2">
                          {getSampledIndices(data.dailyTrend.length, 6).map((idx, sampleIdx, arr) => {
                            const d = data.dailyTrend[idx];
                            const isFirst = sampleIdx === 0;
                            const isLast = sampleIdx === arr.length - 1;
                            const pct = (idx / (data.dailyTrend.length - 1)) * 100;
                            const dateObj = new Date(d.date);
                            const dayNum = dateObj.getDate();
                            const monthName = isTh
                              ? THAI_MONTH_SHORT[dateObj.getMonth()]
                              : ENG_MONTH_SHORT[dateObj.getMonth()];
                            const labelText = `${dayNum} ${monthName}`;

                            return (
                              <span
                                key={d.date}
                                style={{
                                  left: `${pct}%`,
                                  transform: isFirst
                                    ? "translateX(0%)"
                                    : isLast
                                    ? "translateX(-100%)"
                                    : "translateX(-50%)",
                                }}
                                className="absolute top-1 whitespace-nowrap text-[11px] font-mono font-medium text-slate-500 hover:text-slate-800 transition-colors"
                              >
                                {labelText}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs font-mono text-slate-500 px-1 sm:px-2 pt-2">
                          {data.dailyTrend.map((d) => (
                            <span key={d.date} className="text-center flex-1 font-medium">
                              {d.dayLabel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Summary Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs mt-4">
                <div>
                  <div className="text-[11px] text-slate-500">{isTh ? "อัตรากำไรเฉลี่ย" : "Avg Net Margin"}</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5 text-sm">
                    {summary?.netMarginPercent.toFixed(1) || 0}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">{isTh ? "วันทำกำไรสูงสุด" : "Peak Profit Day"}</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5 text-sm">
                    {data?.dailyTrend.reduce((max, d) => (d.netProfit > max.netProfit ? d : max), data.dailyTrend[0])
                      ?.dayLabel || "-"}{" "}
                    <span className="text-[11px] text-emerald-700">
                      (฿
                      {data?.dailyTrend
                        .reduce((max, d) => (d.netProfit > max.netProfit ? d : max), data.dailyTrend[0])
                        ?.netProfit.toLocaleString() || "0"}
                      )
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">{isTh ? "จุดคุ้มทุนดำเนินงาน" : "Operating Cost Ratio"}</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5 text-sm">
                    {summary && summary.netRevenue > 0
                      ? `${((summary.totalExpenses / summary.netRevenue) * 100).toFixed(1)}%`
                      : "0%"}{" "}
                    <span className="text-[11px] text-slate-500">{isTh ? "ของยอดขาย" : "of Rev"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Category Profitability & Margin Ranking (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{t("profit.categoryYield")}</h3>
                      <p className="text-[11px] text-slate-500">{t("profit.categoryYieldSub")}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      {isTh ? "จัดอันดับตาม Margin" : "Ranked by Margin"}
                    </span>
                  </div>

                  {/* Horizontal Ranking Bars */}
                  <div className="mt-4 space-y-4">
                    {loading || !data ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        {isTh ? "กำลังโหลดข้อมูลหมวดหมู่..." : "Loading categories..."}
                      </div>
                    ) : (
                      data.categoryBreakdown
                        .sort((a, b) => b.marginPercent - a.marginPercent)
                        .map((cat, idx) => {
                          const isHigh = cat.marginPercent >= 40;
                          const isMid = cat.marginPercent >= 25 && cat.marginPercent < 40;

                          return (
                            <div key={cat.category} className="text-xs">
                              <div className="flex items-center justify-between mb-1.5 font-semibold">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-4 text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                                  <span className="text-slate-900">{isTh ? cat.categoryTh : cat.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-mono text-[11px]">
                                    ฿{cat.grossProfit.toLocaleString()}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded font-mono font-bold text-[11px] ${
                                      isHigh
                                        ? "bg-emerald-100 text-emerald-900"
                                        : isMid
                                        ? "bg-lime-100 text-lime-900"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {cat.marginPercent.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    isHigh ? "bg-[#061a12]" : isMid ? "bg-[#84cc16]" : "bg-slate-400"
                                  }`}
                                  style={{ width: `${Math.min(100, (cat.marginPercent / 60) * 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4 text-xs text-slate-500 flex items-center justify-between">
                  <span>{isTh ? "กลยุทธ์แนะนำ:" : "Recommended strategy:"}</span>
                  <span className="font-semibold text-emerald-800">
                    {isTh ? "ดันยอดขายหมวด Margin > 40% เพิ่มกำไรสูงสุด" : "Promote margin > 40% categories"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Top 10 Profit Drivers Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{t("profit.topDrivers")}</h3>
                  <p className="text-xs text-slate-500">{t("profit.topDriversSub")}</p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                {isTh ? "เรียงตามยอดกำไรรวม (บาท)" : "Sorted by Total Absolute Profit (THB)"}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-2.5 pl-2">{isTh ? "# ลำดับ" : "# RANK"}</th>
                    <th className="pb-2.5">{isTh ? "สินค้า / บาร์โค้ด" : "ITEM / BARCODE"}</th>
                    <th className="pb-2.5">{isTh ? "หมวดหมู่" : "CATEGORY"}</th>
                    <th className="pb-2.5 text-center">{isTh ? "จำนวนที่ขายได้" : "UNITS SOLD"}</th>
                    <th className="pb-2.5 text-right">{isTh ? "ราคาขายเฉลี่ย" : "SELLING PRICE"}</th>
                    <th className="pb-2.5 text-right">{isTh ? "ราคาทุนเฉลี่ย" : "UNIT COST"}</th>
                    <th className="pb-2.5 text-right">{isTh ? "กำไรรวม (บาท)" : "TOTAL PROFIT"}</th>
                    <th className="pb-2.5 text-center">{isTh ? "MARGIN %" : "MARGIN %"}</th>
                    <th className="pb-2.5 text-center pr-2">{isTh ? "ประเภทกำไร" : "CLASSIFICATION"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {loading || !data ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        {isTh ? "กำลังโหลดข้อมูลสินค้า..." : "Loading products..."}
                      </td>
                    </tr>
                  ) : (
                    data.topProfitDrivers.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 pl-2 font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.barcode}</div>
                        </td>
                        <td className="py-3 text-slate-600">{item.category}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-800">
                          {item.qtySold}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-700">
                          ฿{item.avgSellingPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-400">
                          ฿{item.avgUnitCost.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-black font-mono text-emerald-800 text-sm">
                          +฿{item.totalProfit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-slate-900">
                          {item.marginPercent.toFixed(1)}%
                        </td>
                        <td className="py-3 text-center pr-2">
                          {item.badge === "HIGH_MARGIN" && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
                              {t("profit.highMargin")}
                            </span>
                          )}
                          {item.badge === "VOLUME_DRIVER" && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-300">
                              {t("profit.volumeDriver")}
                            </span>
                          )}
                          {item.badge === "CORE_STAPLE" && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-300">
                              {t("profit.coreStaple")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                {isTh
                  ? "แสดง 10 อันดับแรกที่สร้างกำไรสูงสุดประจำงวด"
                  : "Showing top 10 profit contributing products"}
              </span>
              <Link
                href="/dashboard/products"
                className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
              >
                <span>{isTh ? "จัดการราคาทุนและแคตตาล็อกสินค้า" : "Manage product catalog & costs"}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
