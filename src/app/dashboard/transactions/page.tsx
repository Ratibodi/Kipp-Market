"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Search,
  Calendar,
  CreditCard,
  SlidersHorizontal,
  Store,
  X,
  FileCheck2,
  Receipt,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Copy,
  Clock,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_TRANSACTIONS, TransactionRecord } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function TransactionsAuditPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [selectedTrxId, setSelectedTrxId] = useState<string>("#TRX-9481");
  const [searchQuery, setSearchQuery] = useState<string>("#TRX-9481");
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(true);

  const selectedTrx =
    MOCK_TRANSACTIONS.find((t) => t.trxId === selectedTrxId) || MOCK_TRANSACTIONS[0];

  return (
    <div className="flex min-h-screen bg-[#f8faf9] text-slate-800 font-sans">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 flex flex-col gap-5 max-w-[1700px] w-full mx-auto">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. TODAY'S TRANSACTIONS */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("trx.todaysTransactions")}
                </div>
                <div className="text-2xl font-black text-slate-950 font-mono tracking-tight mt-1 flex items-baseline gap-1.5">
                  186
                  <span className="text-xs font-bold text-emerald-700">(+12.4%)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{isTh ? "เวลาเฉลี่ย: 38 วินาที" : "Average cycle: 38s"}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
            </div>

            {/* 2. TOTAL SALES VOLUME */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("trx.totalSalesVolume")}
                </div>
                <div className="text-2xl font-black text-slate-950 font-mono tracking-tight mt-1">
                  ฿48,920.50
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">VAT 7%: ฿3,200.50</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>

            {/* 3. PROMPTPAY QR SHARE */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("trx.promptpayQrShare")}
                </div>
                <div className="text-2xl font-black text-slate-950 font-mono tracking-tight mt-1">
                  68.2%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{isTh ? "127 รายการยืนยันทันที" : "127 instant settlements"}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileCheck2 className="h-5 w-5" />
              </div>
            </div>

            {/* 4. REFUNDS & VOIDS */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("trx.refundsVoids")}
                </div>
                <div className="text-2xl font-black text-red-600 font-mono tracking-tight mt-1">
                  2 <span className="text-sm font-semibold text-slate-600">/ ฿340.00</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{isTh ? "อัตราผิดปกติ 0.69%" : "0.69% anomaly rate"}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <RotateCcw className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Title & Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("trx.title")}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#bef264] text-[#061a12] text-xs font-black tracking-wide">
                  {t("trx.liveAuditFeed")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("trx.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>{t("trx.exportCsv")}</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>{t("trx.printSummary")}</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#061a12] hover:bg-[#0d2a1d] text-white text-xs font-bold shadow-sm transition"
              >
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t("trx.refreshFeed")}</span>
                <span className="text-[10px] text-emerald-300 font-mono font-normal">10s ago</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("trx.searchPlaceholder")}
                  className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-600 transition"
                />
                <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[9px] font-bold">
                  F2
                </span>
              </div>

              {/* Date */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium transition"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>{isTh ? "วันนี้ (14 มิ.ย.)" : "Today (14 Jun)"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Payments */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium transition"
              >
                <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                <span>{isTh ? "ทุกช่องทางจ่าย" : "All Payments"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Statuses */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium transition"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                <span>{isTh ? "ทุกสถานะ" : "All Statuses"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Registers */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium transition"
              >
                <Store className="h-3.5 w-3.5 text-slate-500" />
                <span>{isTh ? "เครื่อง 01 & 02" : "Reg 01 & 02"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>

            {/* Active Criteria Tags */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isTh ? "เงื่อนไขที่เลือก:" : "ACTIVE CRITERIA:"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1">
                  {isTh ? "วันที่: วันนี้" : "Date: Today"} <X className="h-3 w-3 text-slate-400 cursor-pointer" />
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1">
                  {isTh ? "สาขา: ซอย 24" : "Branch: Soi 24"} <X className="h-3 w-3 text-slate-400 cursor-pointer" />
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                  {isTh ? `กำลังแสดงรายละเอียด ${selectedTrxId}` : `Showing ${selectedTrxId} Details`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-500 hover:text-slate-800 font-medium text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{t("trx.clearFilters")}</span>
              </button>
            </div>
          </div>

          {/* Main Split View: Left Table + Right Detail Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Table (~58% width / 7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">{t("trx.colTrxId")}</th>
                        <th className="py-3 px-3">{t("trx.colTime")}</th>
                        <th className="py-3 px-3">{t("trx.colLaneCashier")}</th>
                        <th className="py-3 px-3">{t("trx.colItems")}</th>
                        <th className="py-3 px-3 text-right">{isTh ? "ภาษี 7%" : "VAT 7%"}</th>
                        <th className="py-3 px-3 text-right">{t("trx.colTotalThb")}</th>
                        <th className="py-3 px-3">{t("trx.colPaymentMethod")}</th>
                        <th className="py-3 px-4 text-center">{t("trx.colStatus")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {MOCK_TRANSACTIONS.map((trx) => {
                        const isSelected = trx.trxId === selectedTrxId;
                        return (
                          <tr
                            key={trx.id}
                            onClick={() => {
                              setSelectedTrxId(trx.trxId);
                              setIsDetailOpen(true);
                            }}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? "bg-emerald-50/70 border-l-4 border-l-emerald-600 font-semibold"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              {trx.trxId}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                              {trx.time}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800">{isTh && trx.cashier === "Somchai P." ? "สมชาย พ." : isTh && trx.cashier === "Noon R." ? "นุ่น ร." : trx.cashier}</div>
                              <div className="text-[10px] text-slate-400">{isTh ? trx.lane.replace("Lane", "เลน") : trx.lane}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-600">{trx.itemsSummary}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">
                              ฿{trx.vat7.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-black font-mono text-slate-950">
                              <span className={trx.status === "Voided" ? "line-through text-slate-400" : ""}>
                                ฿{trx.total.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                                {isTh && trx.payment === "PromptPay" ? "พร้อมเพย์ QR" : isTh && trx.payment === "Cash" ? "เงินสด" : isTh && trx.payment === "Credit" ? "บัตรเครดิต" : trx.payment}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  trx.status === "Settled"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : trx.status === "Partially Refunded"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isTh && trx.status === "Settled" ? "ชำระแล้ว" : isTh && trx.status === "Voided" ? "ยกเลิก" : isTh && trx.status === "Partially Refunded" ? "คืนเงินบางส่วน" : trx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                  <div>{isTh ? "แสดง 1-10 จากทั้งหมด 186 รายการ" : "Showing 1-10 of 186 transactions"}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span>{isTh ? "แถว:" : "Rows:"}</span>
                      <select className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs outline-none">
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs">
                      <button type="button" className="p-1 hover:bg-slate-200 rounded">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2 py-0.5 rounded bg-[#061a12] text-white font-bold">1</span>
                      <span className="px-1.5 py-0.5 text-slate-600">2</span>
                      <span className="px-1.5 py-0.5 text-slate-600">3</span>
                      <span className="px-1 py-0.5 text-slate-400">...</span>
                      <span className="px-1.5 py-0.5 text-slate-600">19</span>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Electronic Tax Clearance (RD-Thailand e-Tax Ready) Banner */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-sm flex items-start justify-between gap-3 bg-gradient-to-r from-emerald-50/50 to-white">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {t("trx.eTaxTitle")}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {t("trx.eTaxDesc")}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0 border border-emerald-300">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {t("trx.verified")}
                </span>
              </div>
            </div>

            {/* Right Detail Panel (~42% width / 5 cols) - Inspector Drawer */}
            {isDetailOpen && (
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xl p-5 flex flex-col gap-4 sticky top-6">
                {/* Header */}
                <div className="bg-[#071b12] text-white p-4 rounded-2xl border border-[#143d2c]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-black text-[#bef264] font-mono tracking-tight">
                        {selectedTrxId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        {t("trx.confirmedSettled")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDetailOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300 pt-2 border-t border-[#0e3524]">
                    <div>
                      <div className="text-slate-400 text-[10px]">{isTh ? "วัน-เวลาทำรายการ" : "Timestamp"}</div>
                      <div className="font-mono text-slate-200">14 Jun 2024, 14:28:12 ICT</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">{isTh ? "เครื่อง & เลน" : "Terminal & Lane"}</div>
                      <div className="font-semibold text-slate-200">{isTh ? "เครื่อง 01 (เลน 01)" : "Register 01 (Lane 01)"}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">{t("nav.cashier")}</div>
                      <div className="font-semibold text-slate-200">{isTh ? "สมชาย พ. (รหัส #8841)" : "Somchai P. (ID #8841)"}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">{isTh ? "สาขา" : "Store"}</div>
                      <div className="text-slate-200">{isTh ? "สาขา #01 สุขุมวิท 24" : "Store #01 Sukhumvit 24"}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-600" />
                    <span>{t("trx.printDuplicate")}</span>
                  </button>

                  <button
                    type="button"
                    className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-600" />
                    <span>{t("trx.taxSlipPdf")}</span>
                  </button>

                  <button
                    type="button"
                    className="py-2 px-2 rounded-xl bg-white hover:bg-red-50 text-red-600 text-xs font-semibold border border-red-200 transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{t("trx.voidReturn")}</span>
                  </button>
                </div>

                {/* ITEMIZED LINE LEDGER */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800 tracking-wider text-[11px] uppercase">
                      {t("trx.itemizedLedger")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{isTh ? "4 สินค้า / 6 ชิ้น" : "4 SKUs / 6 units"}</span>
                  </div>

                  <div className="divide-y divide-slate-100 mt-2 space-y-2">
                    <div className="flex justify-between pt-1.5">
                      <div>
                        <div className="font-bold text-slate-900">{isTh ? "นมสดเมจิ 830 มล." : "Meiji Fresh Milk 830ml"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: 8850329144 • 1 × ฿49.00
                        </div>
                      </div>
                      <div className="font-bold font-mono text-slate-900">฿49.00</div>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <div>
                        <div className="font-bold text-slate-900">{isTh ? "ข้าวหน้าไก่เทอริยากิ ซีพี 230 กรัม" : "CP Teriyaki Chicken Rice Bowl 230g"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: 8850123991 • 1 × ฿69.00
                        </div>
                      </div>
                      <div className="font-bold font-mono text-slate-900">฿69.00</div>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <div>
                        <div className="font-bold text-slate-900">{isTh ? "โซดาสิงห์ 325 มล." : "Singha Soda Water 325ml"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: 8850999120 • 3 × ฿10.00
                        </div>
                      </div>
                      <div className="font-bold font-mono text-slate-900">฿30.00</div>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <div>
                        <div className="font-bold text-slate-900">{isTh ? "เลย์ ร็อค มันฝรั่งทอดกรอบ 48 กรัม" : "Lay's Rock Potato Chips 48g"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: 8851442019 • 1 × ฿25.00
                        </div>
                      </div>
                      <div className="font-bold font-mono text-slate-900">฿25.00</div>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>{isTh ? "ยอดรวมก่อนภาษี (Excl. VAT)" : "Gross Subtotal (Excl. VAT)"}</span>
                      <span className="font-mono text-slate-900">฿183.18</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>{isTh ? "ส่วนลดสมาชิก (โปรโมชั่น)" : "Member Discount (Loyalty Promo)"}</span>
                      <span className="font-mono font-bold">-฿0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isTh ? "ภาษีมูลค่าเพิ่ม 7% (รวมในราคา)" : "VAT (7.0% Included in price)"}</span>
                      <span className="font-mono text-slate-900">฿12.82</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isTh ? "ฐานภาษีมูลค่าเพิ่ม" : "Taxable Base Amount"}</span>
                      <span className="font-mono text-slate-900">฿183.18</span>
                    </div>
                    <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-black text-slate-950">
                      <span className="text-xs uppercase">{isTh ? "ยอดรวมสุทธิ (สกุลเงิน: บาท)" : "GRAND TOTAL (Currency: THB)"}</span>
                      <span className="text-xl font-mono">฿196.00</span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT SETTLEMENT */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-slate-800 tracking-wider text-[11px] uppercase">
                      {t("trx.paymentSettlement")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {t("trx.instantClearance")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">{isTh ? "ช่องทางชำระเงิน:" : "Tender Method:"}</span>
                    <span className="font-bold text-slate-800">{isTh ? "ไทย พร้อมเพย์ QR (ไดนามิก EMVCo)" : "Thai PromptPay QR (B2C Dynamic EMVCo)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isTh ? "เกตเวย์เคลียร์ริ่ง:" : "Clearing Gateway:"}</span>
                    <span className="text-slate-700">Kasikorn Bank (K+) / ITMX (Switch Node 04)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isTh ? "รหัสอ้างอิงธุรกรรม / แฮช:" : "Transaction Ref / Hash:"}</span>
                    <span className="font-mono text-slate-900 font-bold">TX-TH-9A4F881C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isTh ? "เลขที่บัญชีลูกค้า:" : "Customer Account Mask:"}</span>
                    <span className="font-mono text-slate-700">XXX-X-X9201-1</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">{isTh ? "การตอบกลับจากระบบ:" : "Host Response:"}</span>
                    <span className="text-emerald-700 font-black font-mono">00 - APPROVED</span>
                  </div>
                </div>

                {/* 80MM THERMAL SLIP PREVIEW (ESC/POS EMULATOR) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                    <span>{t("trx.slipPreview")}</span>
                    <span>{t("trx.escPosEmulator")}</span>
                  </div>

                  {/* Receipt Paper Simulation */}
                  <div className="bg-slate-50/60 p-4 rounded-xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-700 leading-relaxed space-y-1">
                    <div className="text-center">
                      <div className="font-black text-xs text-slate-900">KIPP MARKET</div>
                      <div className="text-[10px]">{isTh ? "สาขา #01 - สุขุมวิท ซอย 24" : "Store #01 - Sukhumvit Soi 24"}</div>
                      <div className="text-[10px]">{isTh ? "เลขประจำตัวผู้เสียภาษี: 0105558194821 (สำนักงานใหญ่)" : "TAX ID: 0105558194821 (Head Office)"}</div>
                      <div className="text-[10px]">TEL: 02-714-8920</div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 my-2 pt-1 text-center font-bold text-[10px]">
                      {isTh ? "ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน" : "TAX INVOICE (ABB) / RECEIPT"}
                    </div>

                    <div className="flex justify-between text-[10px]">
                      <span>TRX: #TRX-9481</span>
                      <span>POS: 01 (REG-01)</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>DATE: 14/06/2024</span>
                      <span>TIME: 14:28:12</span>
                    </div>
                    <div className="text-[10px]">{isTh ? "แคชเชียร์: สมชาย พ. (8841)" : "CASHIER: Somchai P. (8841)"}</div>

                    <div className="border-t border-dashed border-slate-300 my-2 pt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>{isTh ? "นมสดเมจิ 830 มล." : "Meiji Fresh Milk 830ml"}</span>
                        <span>49.00</span>
                      </div>
                      <div className="text-[9px] text-slate-500">1 x 49.00</div>

                      <div className="flex justify-between">
                        <span>{isTh ? "ข้าวหน้าไก่เทอริยากิ ซีพี" : "CP Teriyaki Chicken Bowl"}</span>
                        <span>69.00</span>
                      </div>
                      <div className="text-[9px] text-slate-500">1 x 69.00</div>

                      <div className="flex justify-between">
                        <span>{isTh ? "โซดาสิงห์ 325 มล." : "Singha Soda Water 325ml"}</span>
                        <span>30.00</span>
                      </div>
                      <div className="text-[9px] text-slate-500">3 x 10.00</div>

                      <div className="flex justify-between">
                        <span>{isTh ? "เลย์ ร็อค มันฝรั่งทอดกรอบ" : "Lay's Rock Potato Chips"}</span>
                        <span>25.00</span>
                      </div>
                      <div className="text-[9px] text-slate-500">1 x 25.00</div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 my-2 pt-1">
                      <div className="flex justify-between font-bold">
                        <span>{isTh ? "ยอดรวมสินค้า:" : "ITEMS TOTAL:"}</span>
                        <span>฿196.00</span>
                      </div>
                      <div className="flex justify-between font-black text-xs text-slate-900">
                        <span>{isTh ? "ยอดสุทธิ (บาท):" : "GRAND TOTAL (THB):"}</span>
                        <span>฿196.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PROMPTPAY QR:</span>
                        <span>฿196.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isTh ? "เงินทอน:" : "CHANGE DUE:"}</span>
                        <span>฿0.00</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 my-2 pt-1 text-[10px]">
                      <div className="flex justify-between">
                        <span>{isTh ? "ยอดคิดภาษี (EXCL 7%):" : "TAXABLE (EXCL 7%):"}</span>
                        <span>฿183.18</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isTh ? "ภาษีมูลค่าเพิ่ม 7%:" : "VAT 7%:"}</span>
                        <span>฿12.82</span>
                      </div>
                    </div>

                    <div className="text-center pt-2 text-[10px]">
                      <div className="font-bold">{isTh ? "ขอบคุณที่ใช้บริการ คิปป์ มาร์เก็ต" : "THANK YOU FOR SHOPPING AT KIPP"}</div>
                      <div className="text-[9px] text-slate-500">PromptPay Ref: TX-TH-9A4F881C</div>
                    </div>

                    {/* Barcode representation */}
                    <div className="flex flex-col items-center justify-center pt-2">
                      <svg className="w-48 h-10" viewBox="0 0 200 40">
                        <rect x="0" y="0" width="200" height="40" fill="#ffffff" />
                        <rect x="10" y="5" width="3" height="30" fill="#000" />
                        <rect x="15" y="5" width="2" height="30" fill="#000" />
                        <rect x="20" y="5" width="5" height="30" fill="#000" />
                        <rect x="28" y="5" width="2" height="30" fill="#000" />
                        <rect x="33" y="5" width="4" height="30" fill="#000" />
                        <rect x="40" y="5" width="1" height="30" fill="#000" />
                        <rect x="44" y="5" width="3" height="30" fill="#000" />
                        <rect x="50" y="5" width="6" height="30" fill="#000" />
                        <rect x="60" y="5" width="2" height="30" fill="#000" />
                        <rect x="65" y="5" width="4" height="30" fill="#000" />
                        <rect x="73" y="5" width="2" height="30" fill="#000" />
                        <rect x="78" y="5" width="5" height="30" fill="#000" />
                        <rect x="86" y="5" width="1" height="30" fill="#000" />
                        <rect x="90" y="5" width="4" height="30" fill="#000" />
                        <rect x="97" y="5" width="2" height="30" fill="#000" />
                        <rect x="102" y="5" width="5" height="30" fill="#000" />
                        <rect x="110" y="5" width="3" height="30" fill="#000" />
                        <rect x="116" y="5" width="2" height="30" fill="#000" />
                        <rect x="122" y="5" width="4" height="30" fill="#000" />
                        <rect x="130" y="5" width="2" height="30" fill="#000" />
                        <rect x="135" y="5" width="5" height="30" fill="#000" />
                        <rect x="143" y="5" width="3" height="30" fill="#000" />
                        <rect x="150" y="5" width="1" height="30" fill="#000" />
                        <rect x="154" y="5" width="4" height="30" fill="#000" />
                        <rect x="162" y="5" width="2" height="30" fill="#000" />
                        <rect x="168" y="5" width="5" height="30" fill="#000" />
                        <rect x="176" y="5" width="2" height="30" fill="#000" />
                        <rect x="182" y="5" width="3" height="30" fill="#000" />
                      </svg>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">*9481-20240614*</span>
                    </div>
                  </div>
                </div>

                {/* TRANSACTION AUDIT LOG */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 tracking-wider text-[11px] uppercase pb-2 border-b border-slate-200">
                    {t("trx.auditLog")}
                  </div>
                  <div className="mt-2.5 space-y-2 text-[11px] font-mono text-slate-600">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold shrink-0">14:27:50</span>
                      <span>{isTh ? "เริ่มสแกนบาร์โค้ด • พัก 4 รายการสินค้าในหน่วยความจำเครื่องขาย" : "Barcode scan initiated • 4 items staged in register memory"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold shrink-0">14:28:02</span>
                      <span>{isTh ? "สร้าง QR พร้อมเพย์ยอด ฿196.00 สำเร็จ (หมดอายุใน 120 วิ)" : "PromptPay QR generated for ฿196.00 (TTL 120s)"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold shrink-0">14:28:10</span>
                      <span>{isTh ? "รับ Webhook ยืนยันยอดจาก ITMX โหนด 04 (กสิกรไทย อนุมัติสำเร็จ)" : "Bank webhook received via ITMX node #04 (Kasikorn Approved)"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold shrink-0">14:28:12</span>
                      <span>{isTh ? "ข้ามการดีดลิ้นชักเงินสดอัตโนมัติ, พิมพ์สลิปความร้อน 80 มม. เรียบร้อย" : "Drawer auto-pulse skipped, ESC/POS 80mm slip printed"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
