"use client";

import { useState } from "react";
import {
  Clock,
  Banknote,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  Printer,
  X,
  Coins,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface ShiftState {
  status: "OPEN" | "CLOSED";
  shiftId: string;
  openedAt: string;
  openedBy: string;
  openingCash: number;
  cashSales: number;
  qrSales: number;
  creditSales: number;
  drawerExpenses: number;
}

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftState: ShiftState;
  onUpdateShift: (updated: ShiftState) => void;
}

export function ShiftModal({
  isOpen,
  onClose,
  shiftState,
  onUpdateShift,
}: ShiftModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [activeTab, setActiveTab] = useState<"OPEN" | "PAID_OUT" | "CLOSE">(
    shiftState.status === "OPEN" ? "CLOSE" : "OPEN"
  );

  // Open Shift Form State
  const [openingFloat, setOpeningFloat] = useState<number>(shiftState.openingCash || 2000);

  // Paid Out Form State
  const [payoutAmount, setPayoutAmount] = useState<string>("150");
  const [payoutReason, setPayoutReason] = useState<string>(
    isTh ? "ค่าน้ำแข็งตู้เครื่องดื่มเย็น" : "Ice bag replenishment"
  );

  // Close Shift Denominations State
  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    b1000: 7,
    b500: 4,
    b100: 11,
    b50: 3,
    b20: 5,
    coins: 20,
  });
  const [closeNote, setCloseNote] = useState<string>("");

  if (!isOpen) return null;

  // Calculate counted total from denominations
  const countedCash =
    denominations.b1000 * 1000 +
    denominations.b500 * 500 +
    denominations.b100 * 100 +
    denominations.b50 * 50 +
    denominations.b20 * 20 +
    denominations.coins;

  // Expected Cash = Opening Cash + Cash Sales - Drawer Expenses
  const expectedCash =
    shiftState.openingCash + shiftState.cashSales - shiftState.drawerExpenses;
  const cashVariance = countedCash - expectedCash;

  const handleDenomChange = (key: string, val: string) => {
    const num = parseInt(val, 10);
    setDenominations((prev) => ({
      ...prev,
      [key]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const handleOpenShift = () => {
    onUpdateShift({
      ...shiftState,
      status: "OPEN",
      shiftId: `SHIFT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01`,
      openedAt: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      openingCash: openingFloat,
    });
    onClose();
  };

  const handleRecordPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (!isNaN(amount) && amount > 0) {
      onUpdateShift({
        ...shiftState,
        drawerExpenses: shiftState.drawerExpenses + amount,
      });
      alert(isTh ? `บันทึกเบิกจ่าย ฿${amount.toFixed(2)} เรียบร้อย` : `Recorded ฿${amount.toFixed(2)} payout successfully`);
      setPayoutAmount("");
    }
  };

  const handleCloseShift = () => {
    onUpdateShift({
      ...shiftState,
      status: "CLOSED",
    });
    alert(isTh ? "ปิดกะและพิมพ์รายงาน Z-Report สำเร็จ" : "Shift closed and Z-Report generated successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans select-none">
      <div className="w-full max-w-2xl bg-[#071d14] border border-[#144733] rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#092218] border-b border-[#123e2c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                {isTh ? "การจัดการกะและลิ้นชักเงิน" : "Shift & Cash Drawer Management"}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    shiftState.status === "OPEN"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-700/50 text-slate-400"
                  }`}
                >
                  {shiftState.status === "OPEN" ? (isTh ? "กะกำลังเปิด" : "SHIFT OPEN") : (isTh ? "ปิดกะแล้ว" : "SHIFT CLOSED")}
                </span>
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                {shiftState.shiftId} • {shiftState.openedBy} • {isTh ? "เครื่อง POS 01" : "Terminal 01"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-[#0d2e20] hover:bg-[#164431] flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-[#061911] border-b border-[#0f3525] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("OPEN")}
            className={`py-3 flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === "OPEN"
                ? "bg-[#0b291d] text-[#bef264] border-b-2 border-[#bef264]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="h-4 w-4" />
            {isTh ? "1. เปิดกะ (เงินทอน)" : "1. Open Shift"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PAID_OUT")}
            className={`py-3 flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === "PAID_OUT"
                ? "bg-[#0b291d] text-[#bef264] border-b-2 border-[#bef264]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            {isTh ? "2. เบิกเงินลิ้นชัก" : "2. Drawer Paid Out"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CLOSE")}
            className={`py-3 flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === "CLOSE"
                ? "bg-[#0b291d] text-[#bef264] border-b-2 border-[#bef264]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="h-4 w-4" />
            {isTh ? "3. ปิดกะ & นับเงิน (Z-Report)" : "3. Close Shift & Count"}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: OPEN SHIFT */}
          {activeTab === "OPEN" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0a271c] border border-emerald-600/30 text-xs space-y-2">
                <div className="font-bold text-emerald-300">
                  {isTh ? "ตั้งค่าเงินทอนเริ่มต้นก่อนเปิดการขาย" : "Configure initial cash float before sales start"}
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {isTh
                    ? "กรอกยอดเงินสดที่นับได้ในลิ้นชักเพื่อใช้เป็นเงินทอนตั้งต้น บิลขายใบแรกจะไม่สามารถบันทึกได้หากยังไม่ได้เปิดกะ"
                    : "Enter initial cash counted in drawer. Cash transactions cannot be recorded until a shift is officially opened."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isTh ? "เงินทอนตั้งต้น (บาท)" : "Opening Cash Float (THB)"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#051710] border border-emerald-600/40 text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#082217] border border-[#113a29]">
                  <div className="text-slate-400">{isTh ? "พนักงานประจำกะ" : "Staff Responsible"}</div>
                  <div className="font-bold text-white mt-1">{shiftState.openedBy}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#082217] border border-[#113a29]">
                  <div className="text-slate-400">{isTh ? "ช่องชำระเงิน" : "POS Lane / Terminal"}</div>
                  <div className="font-bold text-white mt-1 font-mono">Lane 01 / Term 01</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenShift}
                className="w-full py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-sm transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                {isTh ? "ยืนยันเปิดกะขายหน้าร้าน" : "Confirm Open Shift"}
              </button>
            </div>
          )}

          {/* TAB 2: DRAWER EXPENSE / PAID OUT */}
          {activeTab === "PAID_OUT" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0a271c] border border-emerald-600/30 text-xs text-slate-300">
                {isTh
                  ? "เบิกเงินสดออกจากลิ้นชักระหว่างกะ (เช่น จ่ายค่าน้ำแข็ง, ค่าของใช้เร่งด่วน) ยอดเงินนี้จะถูกนำไปหักออกจากเงินที่ควรมีในลิ้นชักตอนปิดกะอัตโนมัติ"
                  : "Record cash removed from drawer for ad-hoc operational expenses. Deducts automatically from expected cash."}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isTh ? "จำนวนเงินที่เบิก (บาท)" : "Amount Paid Out (THB)"}
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#051710] border border-emerald-600/40 text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-400"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isTh ? "เหตุผลในการเบิกจ่าย" : "Reason / Expense Category"}
                </label>
                <input
                  type="text"
                  value={payoutReason}
                  onChange={(e) => setPayoutReason(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#051710] border border-emerald-600/40 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#082217] border border-[#113a29] flex justify-between items-center text-xs">
                <span className="text-slate-400">{isTh ? "ยอดเบิกสะสมในกะนี้:" : "Total Drawer Payouts:"}</span>
                <span className="font-bold font-mono text-amber-400">฿{shiftState.drawerExpenses.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleRecordPayout}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg cursor-pointer"
              >
                {isTh ? "บันทึกการเบิกเงินออกจากลิ้นชัก" : "Record Drawer Payout"}
              </button>
            </div>
          )}

          {/* TAB 3: CLOSE SHIFT & COUNT */}
          {activeTab === "CLOSE" && (
            <div className="space-y-5">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#09251a] border border-[#12422e]">
                  <div className="text-slate-400">{isTh ? "เงินทอนตั้งต้น" : "Opening Float"}</div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    ฿{shiftState.openingCash.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#09251a] border border-[#12422e]">
                  <div className="text-slate-400">{isTh ? "ยอดขายเงินสด" : "Cash Sales"}</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    ฿{shiftState.cashSales.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#09251a] border border-[#12422e]">
                  <div className="text-slate-400">{isTh ? "ยอดเงินที่ควรมี" : "Expected Cash"}</div>
                  <div className="text-base font-black font-mono text-[#bef264] mt-1">
                    ฿{expectedCash.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Denomination Counter Grid */}
              <div className="rounded-2xl bg-[#082217] border border-[#123e2c] p-4">
                <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                  <span>{isTh ? "ตารางนับเงินจริงตามชนิดธนบัตร / เหรียญ" : "Physical Cash Count Breakdown"}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {isTh ? "รวมนับได้: " : "Counted: "} ฿{countedCash.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { key: "b1000", label: "฿1,000", mult: 1000 },
                    { key: "b500", label: "฿500", mult: 500 },
                    { key: "b100", label: "฿100", mult: 100 },
                    { key: "b50", label: "฿50", mult: 50 },
                    { key: "b20", label: "฿20", mult: 20 },
                    { key: "coins", label: isTh ? "เหรียญรวม" : "Coins Total", mult: 1 },
                  ].map((d) => (
                    <div key={d.key} className="p-2.5 rounded-xl bg-[#061911] border border-[#0e3524]">
                      <div className="flex justify-between text-slate-400 text-[10px] mb-1 font-mono">
                        <span>{d.label}</span>
                        <span>฿{(denominations[d.key] * d.mult).toFixed(2)}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={denominations[d.key]}
                        onChange={(e) => handleDenomChange(d.key, e.target.value)}
                        className="w-full h-8 px-2 text-center rounded-lg bg-[#0b291d] border border-emerald-700/40 text-sm font-bold font-mono text-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Variance Calculation Callout */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  Math.abs(cashVariance) < 0.01
                    ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-200"
                    : cashVariance > 0
                    ? "bg-blue-950/40 border-blue-600/40 text-blue-200"
                    : "bg-rose-950/40 border-rose-600/40 text-rose-200"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">
                    {Math.abs(cashVariance) < 0.01
                      ? isTh ? "✅ ยอดเงินตรงเป๊ะ (ไม่มีส่วนต่าง)" : "✅ Perfect Match (No Variance)"
                      : cashVariance > 0
                      ? isTh ? "🔵 เงินเกินในลิ้นชัก" : "🔵 Cash Surplus"
                      : isTh ? "⚠️ เงินขาดในลิ้นชัก" : "⚠️ Cash Shortage"}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {isTh ? "เงินที่นับได้จริงเทียบกับยอดระบบ" : "Counted cash vs System expectation"}
                  </div>
                </div>
                <div className="text-xl font-black font-mono">
                  {cashVariance > 0 ? `+฿${cashVariance.toFixed(2)}` : `฿${cashVariance.toFixed(2)}`}
                </div>
              </div>

              {/* Note field if variance */}
              {Math.abs(cashVariance) >= 0.01 && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isTh ? "หมายเหตุชี้แจงส่วนต่างเงินสด *" : "Variance Explanation Note *"}
                  </label>
                  <input
                    type="text"
                    value={closeNote}
                    onChange={(e) => setCloseNote(e.target.value)}
                    placeholder={isTh ? "กรอกเหตุผลที่เงินขาด/เกิน..." : "Enter reason for discrepancy..."}
                    className="w-full h-10 px-3 rounded-xl bg-[#051710] border border-rose-500/40 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseShift}
                  className="flex-1 py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-sm transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  {isTh ? "ปิดกะ & พิมพ์รายงาน Z-Report" : "Close Shift & Print Z-Report"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
