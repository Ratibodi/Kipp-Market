"use client";

import { useState } from "react";
import {
  DollarSign,
  Plus,
  Receipt,
  Building,
  Zap,
  TrendingDown,
  Calendar,
  CreditCard,
  Banknote,
  CheckCircle,
  X,
  FileText,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_EXPENSES, ExpenseRecord } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function ExpensesPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(MOCK_EXPENSES);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [formCategory, setFormCategory] = useState<ExpenseRecord["category"]>("Store Supplies");
  const [formCategoryTh, setFormCategoryTh] = useState<string>("วัสดุสิ้นเปลือง / ถุงหูหิ้ว");
  const [formAmount, setFormAmount] = useState<string>("350.00");
  const [formPaidFromDrawer, setFormPaidFromDrawer] = useState<boolean>(true);
  const [formNote, setFormNote] = useState<string>("");

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const drawerExpenses = expenses
    .filter((e) => e.paidFromDrawer)
    .reduce((acc, exp) => acc + exp.amount, 0);

  // Net Profit Formula (Design Doc 7.7)
  const grossSales = 24850.0;
  const cogs = 17941.7;
  const grossProfit = grossSales - cogs;
  const netProfit = grossProfit - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount) || 0;
    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      docNo: `EXP-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`,
      category: formCategory,
      categoryTh: formCategoryTh || formCategory,
      amount,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      paidFromDrawer: formPaidFromDrawer,
      shiftId: formPaidFromDrawer ? "SHIFT-01-AFTERNOON" : undefined,
      spentBy: isTh ? "สมชาย พ." : "Somchai P.",
      note: formNote || (isTh ? "บันทึกค่าใช้จ่ายร้านค้า" : "Store expense"),
    };
    setExpenses([newExp, ...expenses]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Receipt className="h-6 w-6 text-emerald-600" />
                <span>{isTh ? "บันทึกค่าใช้จ่าย & คำนวณกำไรสุทธิ" : "Store Expenses & Net Profit"}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isTh
                  ? "บันทึกค่าใช้จ่ายจิปาถะ และหักออกจากกำไรขั้นต้นเพื่อให้ได้กำไรสุทธิแท้จริง (Design Doc ข้อ 7.7)"
                  : "Track daily expenses and calculate true net profit deduction"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isTh ? "+ บันทึกค่าใช้จ่าย" : "+ Record Expense"}</span>
            </button>
          </div>

          {/* Net Profit Calculation Formula Strip */}
          <div className="p-5 rounded-2xl bg-[#061911] border border-[#103a27] text-white">
            <div className="text-xs font-bold text-emerald-400 mb-3 flex items-center justify-between">
              <span>{isTh ? "การคำนวณกำไรสุทธิตามสูตร (Design Doc Section 7.7)" : "Net Profit Equation Waterfall"}</span>
              <span className="font-mono text-[11px] text-slate-400">STORE #01 • JUNE 2026</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0a271c] border border-emerald-800/40">
                <div className="text-slate-400">{isTh ? "ยอดขายรวม (Revenue)" : "Total Revenue"}</div>
                <div className="text-lg font-bold text-white mt-1">฿{grossSales.toFixed(2)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0a271c] border border-emerald-800/40">
                <div className="text-slate-400">{isTh ? "ต้นทุนขาย (COGS)" : "Cost of Goods Sold"}</div>
                <div className="text-lg font-bold text-slate-300 mt-1">-฿{cogs.toFixed(2)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0a271c] border border-emerald-800/40">
                <div className="text-slate-400">{isTh ? "ค่าใช้จ่ายรวม (Expenses)" : "Total Expenses"}</div>
                <div className="text-lg font-bold text-amber-400 mt-1">-฿{totalExpenses.toFixed(2)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d3525] border border-emerald-500/50">
                <div className="text-emerald-300 font-bold">{isTh ? "กำไรสุทธิ (Net Profit)" : "Net Profit"}</div>
                <div className="text-xl font-black text-[#bef264] mt-1">฿{netProfit.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                {isTh ? "รายการค่าใช้จ่ายของร้าน" : "Recorded Store Expenses"}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {expenses.length} {isTh ? "รายการ" : "records"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{isTh ? "เลขที่เอกสาร" : "Doc No"}</th>
                    <th className="py-3 px-3">{isTh ? "หมวดหมู่ค่าใช้จ่าย" : "Expense Category"}</th>
                    <th className="py-3 px-3">{isTh ? "วันที่บันทึก" : "Date & Time"}</th>
                    <th className="py-3 px-3">{isTh ? "ช่องทางจ่าย" : "Payment Source"}</th>
                    <th className="py-3 px-3">{isTh ? "รายละเอียด / หมายเหตุ" : "Memo"}</th>
                    <th className="py-3 px-4 text-right">{isTh ? "จำนวนเงิน (฿)" : "Amount (THB)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {exp.docNo}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                          {isTh ? exp.categoryTh : exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {exp.date}
                      </td>
                      <td className="py-3 px-3">
                        {exp.paidFromDrawer ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                            <Banknote className="h-3.5 w-3.5" />
                            {isTh ? "เงินสดในลิ้นชัก (กะ)" : "Cash Drawer"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-[11px]">
                            <CreditCard className="h-3.5 w-3.5" />
                            {isTh ? "โอนผ่านบัญชีร้าน" : "Bank Transfer"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-xs">
                        {exp.note}
                      </td>
                      <td className="py-3 px-4 text-right font-black font-mono text-slate-900 text-sm">
                        ฿{exp.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <span>{isTh ? "บันทึกค่าใช้จ่ายใหม่" : "Record New Expense"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "หมวดหมู่ค่าใช้จ่าย *" : "Expense Category *"}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const cat = e.target.value as ExpenseRecord["category"];
                    setFormCategory(cat);
                    setFormCategoryTh(
                      cat === "Utilities"
                        ? "ค่าไฟ / ค่าน้ำ"
                        : cat === "Store Supplies"
                        ? "ถุงหูหิ้วและกระดาษสลิป"
                        : cat === "Ice & Cold Store"
                        ? "ค่าน้ำแข็งตู้เย็น"
                        : cat === "Salary"
                        ? "เงินเดือนพนักงาน"
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
                  {isTh ? "จำนวนเงิน (บาท) *" : "Expense Amount (THB) *"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "แหล่งที่มาของเงิน *" : "Payment Tender Source *"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPaidFromDrawer(true)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      formPaidFromDrawer
                        ? "bg-amber-50 border-amber-500 text-amber-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px]">{isTh ? "💵 เบิกเงินในลิ้นชัก" : "Cash Drawer"}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{isTh ? "หักยอดปิดกะหน้าร้าน" : "Deducts from shift"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPaidFromDrawer(false)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      !formPaidFromDrawer
                        ? "bg-blue-50 border-blue-500 text-blue-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px]">{isTh ? "🏦 โอนผ่านบัญชีร้าน" : "Bank Transfer"}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{isTh ? "ไม่กระทบเงินสดลิ้นชัก" : "Store Bank Account"}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "รายละเอียด / หมายเหตุ" : "Memo / Reason"}
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder={isTh ? "ระบุเหตุผลในการใช้จ่าย..." : "Enter expense description..."}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black cursor-pointer shadow-sm"
                >
                  {isTh ? "บันทึกรายการ" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
