"use client";

import { useState } from "react";
import {
  Plus,
  Receipt,
  CreditCard,
  Banknote,
  X,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Building2,
  Filter,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  MOCK_FINANCIAL_MOVEMENTS,
  FinancialMovementRecord,
  calculateFinancialSummary,
  InflowCategory,
} from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function ExpensesPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [records, setRecords] = useState<FinancialMovementRecord[]>(MOCK_FINANCIAL_MOVEMENTS);
  const [filterTab, setFilterTab] = useState<"all" | "inflow" | "expense">("all");

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isInflowModalOpen, setIsInflowModalOpen] = useState<boolean>(false);

  // Expense Form State
  const [expenseCategory, setExpenseCategory] = useState<string>("Store Supplies");
  const [expenseCategoryTh, setExpenseCategoryTh] = useState<string>("ถุงหูหิ้วและกระดาษพิมพ์สลิป");
  const [expenseAmount, setExpenseAmount] = useState<string>("350.00");
  const [expensePaidFromDrawer, setExpensePaidFromDrawer] = useState<boolean>(true);
  const [expenseNote, setExpenseNote] = useState<string>("");

  // Inflow Form State
  const [inflowCategory, setInflowCategory] = useState<InflowCategory>("Side Business");
  const [inflowCategoryTh, setInflowCategoryTh] = useState<string>("เงินทุนจากธุรกิจเสริม");
  const [inflowAmount, setInflowAmount] = useState<string>("5000.00");
  const [inflowDestination, setInflowDestination] = useState<"DRAWER" | "BANK">("DRAWER");
  const [inflowNote, setInflowNote] = useState<string>("");

  // Base metrics
  const grossSales = 24850.0;
  const cogs = 17941.7;

  // Real-time calculations
  const summary = calculateFinancialSummary(grossSales, cogs, records);

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (filterTab === "inflow") return r.type === "INFLOW";
    if (filterTab === "expense") return r.type === "EXPENSE";
    return true;
  });

  const inflowCount = records.filter((r) => r.type === "INFLOW").length;
  const expenseCount = records.filter((r) => r.type === "EXPENSE").length;

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount) || 0;
    const newRecord: FinancialMovementRecord = {
      id: `exp-${Date.now()}`,
      docNo: `EXP-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`,
      type: "EXPENSE",
      category: expenseCategory,
      categoryTh: expenseCategoryTh || expenseCategory,
      amount,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      destinationOrSource: expensePaidFromDrawer ? "DRAWER" : "BANK",
      shiftId: expensePaidFromDrawer ? "SHIFT-01-AFTERNOON" : undefined,
      recordedBy: isTh ? "สมชาย พ." : "Somchai P.",
      note: expenseNote || (isTh ? "บันทึกค่าใช้จ่ายร้านค้า" : "Store expense"),
    };
    setRecords([newRecord, ...records]);
    setExpenseAmount("350.00");
    setExpenseNote("");
    setIsExpenseModalOpen(false);
  };

  const handleAddInflow = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(inflowAmount) || 0;
    const newRecord: FinancialMovementRecord = {
      id: `inf-${Date.now()}`,
      docNo: `INF-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`,
      type: "INFLOW",
      category: inflowCategory,
      categoryTh: inflowCategoryTh || inflowCategory,
      amount,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      destinationOrSource: inflowDestination,
      shiftId: inflowDestination === "DRAWER" ? "SHIFT-01-AFTERNOON" : undefined,
      recordedBy: isTh ? "สมชาย พ." : "Somchai P.",
      note: inflowNote || (isTh ? "รับเงินนอกเข้าเติมทุนร้านค้า" : "External capital injection"),
    };
    setRecords([newRecord, ...records]);
    setInflowAmount("5000.00");
    setInflowNote("");
    setIsInflowModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header with Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Receipt className="h-6 w-6 text-emerald-600" />
                <span>{t("financial.title")}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t("financial.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Record Expense Button */}
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <ArrowDownRight className="h-4 w-4 text-amber-400" />
                <span>{t("financial.recordExpense")}</span>
              </button>

              {/* Receive Inflow Button (Highlighted Emerald/Lime) */}
              <button
                type="button"
                onClick={() => setIsInflowModalOpen(true)}
                className="px-4.5 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <ArrowUpRight className="h-4 w-4 text-[#061a12]" />
                <span>{t("financial.receiveInflow")}</span>
              </button>
            </div>
          </div>

          {/* 5-Card Net Operating Surplus Waterfall Strip */}
          <div className="p-5 rounded-2xl bg-[#061911] border border-[#103a27] text-white shadow-sm">
            <div className="text-xs font-bold text-emerald-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>{t("financial.equationTitle")}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">STORE #01 • JUNE 2026</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-mono">
              {/* 1. Revenue */}
              <div className="p-3 rounded-xl bg-[#0a271c] border border-emerald-800/40">
                <div className="text-slate-400 text-[11px]">{t("financial.totalRevenue")}</div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">฿{summary.grossSales.toFixed(2)}</div>
              </div>

              {/* 2. COGS */}
              <div className="p-3 rounded-xl bg-[#0a271c] border border-emerald-800/40">
                <div className="text-slate-400 text-[11px]">{t("financial.cogs")}</div>
                <div className="text-base sm:text-lg font-bold text-slate-300 mt-1">-฿{summary.cogs.toFixed(2)}</div>
              </div>

              {/* 3. Expenses */}
              <div className="p-3 rounded-xl bg-[#0a271c] border border-emerald-800/40">
                <div className="text-slate-400 text-[11px]">{t("financial.totalExpenses")}</div>
                <div className="text-base sm:text-lg font-bold text-amber-400 mt-1">-฿{summary.totalExpenses.toFixed(2)}</div>
              </div>

              {/* 4. External Inflows (Highlighted) */}
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 relative overflow-hidden">
                <div className="text-emerald-300 font-bold text-[11px] flex items-center justify-between">
                  <span>{t("financial.externalInflows")}</span>
                  <Sparkles className="h-3.5 w-3.5 text-[#bef264]" />
                </div>
                <div className="text-base sm:text-lg font-black text-[#bef264] mt-1">+฿{summary.totalInflows.toFixed(2)}</div>
              </div>

              {/* 5. Net Surplus */}
              <div className="p-3 rounded-xl bg-[#0d3525] border border-emerald-400/80 col-span-2 md:col-span-1 shadow-sm">
                <div className="text-emerald-300 font-black text-[11px]">{t("financial.netSurplus")}</div>
                <div className="text-lg sm:text-xl font-black text-[#bef264] mt-1">฿{summary.netSurplus.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Movements List with Filter Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    filterTab === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t("financial.tabAll")} ({records.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("inflow")}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    filterTab === "inflow" ? "bg-white text-emerald-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>{t("financial.tabInflows")} ({inflowCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("expense")}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    filterTab === "expense" ? "bg-white text-amber-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>{t("financial.tabExpenses")} ({expenseCount})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {filteredRecords.length} {t("financial.recordsCount")}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{t("financial.colDocNo")}</th>
                    <th className="py-3 px-3">{t("financial.colTypeCategory")}</th>
                    <th className="py-3 px-3">{t("financial.colDate")}</th>
                    <th className="py-3 px-3">{t("financial.colChannel")}</th>
                    <th className="py-3 px-3">{t("financial.colMemo")}</th>
                    <th className="py-3 px-4 text-right">{t("financial.colAmount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {isTh ? "ไม่พบรายการในหมวดที่เลือก" : "No records found in this category"}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => {
                      const isInflow = item.type === "INFLOW";
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {item.docNo}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              {isInflow ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  {isTh ? "🟢 เงินนอกเข้า" : "🟢 INFLOW"}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
                                  {isTh ? "🔻 ค่าใช้จ่าย" : "🔻 EXPENSE"}
                                </span>
                              )}
                              <span className="text-slate-800 font-semibold text-[11px]">
                                {isTh ? item.categoryTh : item.category}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {item.date}
                          </td>
                          <td className="py-3 px-3">
                            {item.destinationOrSource === "DRAWER" ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                                <Banknote className="h-3.5 w-3.5" />
                                {isTh ? "เงินสดในลิ้นชัก (กะ)" : "Cash Drawer"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-[11px]">
                                <CreditCard className="h-3.5 w-3.5" />
                                {isTh ? "โอนเข้า/ผ่านบัญชีร้าน" : "Bank Transfer"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600 truncate max-w-xs">
                            {item.note}
                          </td>
                          <td className={`py-3 px-4 text-right font-black font-mono text-sm ${
                            isInflow ? "text-emerald-700" : "text-slate-900"
                          }`}>
                            {isInflow ? `+฿${item.amount.toFixed(2)}` : `-฿${item.amount.toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: RECEIVE EXTERNAL INFLOW (รับเงินนอกเข้า) */}
      {isInflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                <span>{t("financial.modalInflowTitle")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInflowModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddInflow} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.inflowCategory")}
                </label>
                <select
                  value={inflowCategory}
                  onChange={(e) => {
                    const cat = e.target.value as InflowCategory;
                    setInflowCategory(cat);
                    setInflowCategoryTh(
                      cat === "Side Business"
                        ? "เงินทุนจากธุรกิจเสริม"
                        : cat === "Owner Working Capital"
                        ? "เงินเติมทุนหมุนเวียนเจ้าของ"
                        : cat === "Storefront Rental"
                        ? "รายได้ค่าเช่าพื้นที่หน้าร้าน / ค่าป้าย"
                        : cat === "Vending Commission"
                        ? "ค่าคอมมิชชันตู้เติมเงิน / บริการ"
                        : cat === "Rebate & Scrap Sales"
                        ? "ขายเศษกล่อง ลัง และขวดเปล่า"
                        : cat === "Shift Cash Float"
                        ? "เงินทอนสำรองเข้าลิ้นชัก"
                        : "เงินนอกเข้าอื่นๆ"
                    );
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Side Business">{isTh ? "💼 เงินทุนจากธุรกิจเสริม (ต่อยอดร้าน)" : "Side Business Capital"}</option>
                  <option value="Owner Working Capital">{isTh ? "🏦 เงินเติมทุนหมุนเวียนจากเจ้าของ" : "Owner Working Capital"}</option>
                  <option value="Storefront Rental">{isTh ? "🏪 รายได้ค่าเช่าพื้นที่หน้าร้าน / ค่าป้าย" : "Storefront Rental Income"}</option>
                  <option value="Vending Commission">{isTh ? "📱 ค่าคอมมิชชันตู้เติมเงิน / ตู้บริการ" : "Vending Machine Commission"}</option>
                  <option value="Rebate & Scrap Sales">{isTh ? "📦 ขายเศษกล่อง ลัง และของเหลือใช้" : "Scrap / Carton Sales"}</option>
                  <option value="Shift Cash Float">{isTh ? "🪙 เงินทอนสำรองเติมเข้าลิ้นชัก" : "Shift Cash Float"}</option>
                  <option value="Miscellaneous Inflow">{isTh ? "🌟 เงินนอกเข้าอื่นๆ" : "Miscellaneous Inflow"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.amountThb")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={inflowAmount}
                  onChange={(e) => setInflowAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-emerald-700 focus:outline-none focus:border-emerald-600"
                />

                {/* Quick-fill chips */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[500, 1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInflowAmount(amt.toFixed(2))}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-mono font-bold border border-emerald-200 transition cursor-pointer"
                    >
                      +฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.destination")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInflowDestination("DRAWER")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      inflowDestination === "DRAWER"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px]">{t("financial.destinationDrawer")}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{t("financial.destinationDrawerSub")}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInflowDestination("BANK")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      inflowDestination === "BANK"
                        ? "bg-blue-50 border-blue-500 text-blue-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px]">{t("financial.destinationBank")}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{t("financial.destinationBankSub")}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.memo")}
                </label>
                <input
                  type="text"
                  value={inflowNote}
                  onChange={(e) => setInflowNote(e.target.value)}
                  placeholder={isTh ? "ระบุที่มาของเงิน (เช่น นำกำไรจากร้านกาแฟมาซื้อของ)..." : "Describe inflow origin..."}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInflowModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t("financial.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black cursor-pointer shadow-sm"
                >
                  {t("financial.saveInflow")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD EXPENSE (บันทึกค่าใช้จ่าย) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-amber-600" />
                <span>{t("financial.modalExpenseTitle")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.expenseCategory")}
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setExpenseCategory(cat);
                    setExpenseCategoryTh(
                      cat === "Utilities"
                        ? "ค่าไฟ / ค่าน้ำ / ค่าเน็ต"
                        : cat === "Store Supplies"
                        ? "ถุงหูหิ้วและกระดาษพิมพ์สลิป"
                        : cat === "Ice & Cold Store"
                        ? "ค่าน้ำแข็งตู้เย็น"
                        : cat === "Salary"
                        ? "เงินเดือนพนักงาน"
                        : cat === "Maintenance"
                        ? "ค่าซ่อมบำรุงอุปกรณ์"
                        : "ค่าใช้จ่ายจิปาถะ"
                    );
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Store Supplies">{isTh ? "วัสดุสิ้นเปลือง / ถุงหูหิ้ว / ม้วนสลิป" : "Store Supplies"}</option>
                  <option value="Ice & Cold Store">{isTh ? "ค่าน้ำแข็งหลอดตู้เครื่องดื่ม" : "Ice & Cold Store"}</option>
                  <option value="Utilities">{isTh ? "สาธารณูปโภค (ค่าไฟ / ค่าน้ำ / ค่าเน็ต)" : "Utilities"}</option>
                  <option value="Salary">{isTh ? "เงินเดือน / ค่าจ้างพนักงานพาร์ทไทม์" : "Payroll / Staff Salary"}</option>
                  <option value="Maintenance">{isTh ? "ค่าซ่อมบำรุงอุปกรณ์" : "Maintenance"}</option>
                  <option value="Miscellaneous">{isTh ? "อื่นๆ (จิปาถะ)" : "Miscellaneous"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.amountThb")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />

                {/* Quick chips for expense */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[100, 200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setExpenseAmount(amt.toFixed(2))}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-mono font-bold border border-slate-200 transition cursor-pointer"
                    >
                      ฿{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.destination")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpensePaidFromDrawer(true)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      expensePaidFromDrawer
                        ? "bg-amber-50 border-amber-500 text-amber-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px]">{t("financial.sourceDrawer")}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{t("financial.sourceDrawerSub")}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpensePaidFromDrawer(false)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      !expensePaidFromDrawer
                        ? "bg-blue-50 border-blue-500 text-blue-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px]">{t("financial.sourceBank")}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{t("financial.sourceBankSub")}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("financial.memo")}
                </label>
                <input
                  type="text"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  placeholder={isTh ? "ระบุเหตุผลในการใช้จ่าย..." : "Enter expense description..."}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t("financial.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer shadow-sm"
                >
                  {t("financial.saveExpense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
