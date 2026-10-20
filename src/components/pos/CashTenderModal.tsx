"use client";

import { useState, useEffect } from "react";
import {
  Banknote,
  QrCode,
  CreditCard,
  Ticket,
  Printer,
  CheckCircle,
  X,
  Lock,
  Plus,
  Zap,
} from "lucide-react";
import { QUICK_PICK_ITEMS, QuickPickItem } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

interface CashTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSale: (tendered: number, change: number) => void;
  onOpenPromptPay: () => void;
  onAddQuickPickItem: (item: QuickPickItem) => void;
  totalAmount?: number;
  trxId?: string;
}

export function CashTenderModal({
  isOpen,
  onClose,
  onCompleteSale,
  onOpenPromptPay,
  onAddQuickPickItem,
  totalAmount = 196.0,
  trxId = "#TRX-9481",
}: CashTenderModalProps) {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [tenderedAmount, setTenderedAmount] = useState<number>(500);

  const [selectedQuickPickCat, setSelectedQuickPickCat] = useState<string>("All Items");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [sendSms, setSendSms] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const change = Math.max(0, tenderedAmount - totalAmount);
        onCompleteSale(tenderedAmount, change);
      } else if (e.key === "F10") {
        e.preventDefault();
        onOpenPromptPay();
      } else if (e.altKey && e.key === "1") {
        e.preventDefault();
        setTenderedAmount(totalAmount);
      } else if (e.altKey && e.key === "2") {
        e.preventDefault();
        setTenderedAmount(200);
      } else if (e.altKey && e.key === "3") {
        e.preventDefault();
        setTenderedAmount(500);
      } else if (e.altKey && e.key === "4") {
        e.preventDefault();
        setTenderedAmount(1000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, tenderedAmount, totalAmount, onClose, onCompleteSale, onOpenPromptPay]);

  if (!isOpen) return null;

  const changeDue = Math.max(0, tenderedAmount - totalAmount);

  const filteredQuickPickItems =
    selectedQuickPickCat === "All Items"
      ? QUICK_PICK_ITEMS
      : QUICK_PICK_ITEMS.filter((item) => item.category === selectedQuickPickCat);

  return (
    <div className="fixed inset-0 z-50 bg-[#061a12]/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="w-full max-w-[1420px] max-h-[92vh] flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Left Card: Payment & Checkout (~62% width) */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col justify-between overflow-y-auto">
          {/* Header Row */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-800 shadow-sm">
                  <Banknote className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t("cash.title")}</h2>
                  <div className="text-xs text-slate-500 font-mono">
                    {isTh ? "บิล " : "TRANSACTION "}
                    <strong className="text-slate-800">{trxId}</strong> •{" "}
                    {isTh ? "เลน 01 / สมชาย พ." : "Lane 01 / Somchai P."}
                  </div>
                </div>
              </div>

              {/* Amount Due Indicator */}
              <div className="bg-[#081f16] px-5 py-2.5 rounded-2xl text-right shadow-sm border border-emerald-800/40">
                <div className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                  {t("cash.amountDue")}
                </div>
                <div className="text-2xl font-black text-white font-mono flex items-center justify-end gap-1.5">
                  ฿{totalAmount.toFixed(2)}
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                </div>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white border-2 border-emerald-600/40 text-slate-900 font-bold text-xs shadow-sm flex items-center gap-2"
              >
                <Banknote className="h-4 w-4 text-emerald-700" />
                <span>{t("footer.cashKey")}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  [F9]
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenPromptPay}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <QrCode className="h-4 w-4 text-slate-500" />
                <span>{t("pos.promptpayQrBtn")}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-500 font-mono">
                  [F10]
                </span>
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span>{t("pos.creditCardBtn")}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-500 font-mono">
                  [F11]
                </span>
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <Ticket className="h-4 w-4 text-slate-500" />
                <span>{isTh ? "คูปองร้านค้า & แต้มสะสม" : "Store Voucher & Points"}</span>
              </button>
            </div>

            {/* Fast-Keys Section */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 tracking-wider text-[11px] uppercase">
                  {t("cash.fastKeysTitle")}
                </span>
                <span className="text-emerald-700 font-semibold text-[11px]">
                  {t("cash.autoTenderReady")}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* ALT+1 Exact Cash */}
                <button
                  type="button"
                  onClick={() => setTenderedAmount(totalAmount)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    tenderedAmount === totalAmount
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-700">
                      ALT+1
                    </span>
                    {tenderedAmount === totalAmount && (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">{t("cash.exactCash")}</div>
                  <div className="text-lg font-black text-slate-900 font-mono">฿{totalAmount.toFixed(2)}</div>
                </button>

                {/* ALT+2 ฿200 */}
                <button
                  type="button"
                  onClick={() => setTenderedAmount(200)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    tenderedAmount === 200
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-700">
                      ALT+2
                    </span>
                    <span className="text-[10px] px-1 rounded bg-red-100 text-red-700 font-bold">฿</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">{t("cash.twoRed")}</div>
                  <div className="text-lg font-black text-slate-900 font-mono">฿200.00</div>
                </button>

                {/* ALT+3 ฿500 (Selected in Screenshot 5) */}
                <button
                  type="button"
                  onClick={() => setTenderedAmount(500)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    tenderedAmount === 500
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-700">
                      ALT+3
                    </span>
                    <span className="p-0.5 rounded-full bg-emerald-500 text-white">
                      <CheckCircle className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">{t("cash.purpleNote")}</div>
                  <div className="text-lg font-black text-slate-900 font-mono">฿500</div>
                </button>

                {/* ALT+4 ฿1000 */}
                <button
                  type="button"
                  onClick={() => setTenderedAmount(1000)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    tenderedAmount === 1000
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-700">
                      ALT+4
                    </span>
                    <span className="text-[10px] px-1 rounded bg-amber-100 text-amber-800 font-bold">฿</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">{t("cash.brownNote")}</div>
                  <div className="text-lg font-black text-slate-900 font-mono">฿1,000.00</div>
                </button>
              </div>
            </div>

            {/* Cash Received Input */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700 tracking-wider text-[11px] uppercase">
                  {t("cash.receivedTendered")}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{t("cash.tabEdit")}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-300">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-400">฿</span>
                  <input
                    type="number"
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(Number(e.target.value) || 0)}
                    className="text-2xl font-black text-slate-900 font-mono bg-transparent outline-none w-48"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTenderedAmount(0)}
                  className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs tracking-wider transition"
                >
                  CLR
                </button>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {t("cash.enterAmountHelp")}
              </div>
            </div>

            {/* Change Due Card (Dark Green) */}
            <div className="mt-4 p-4 rounded-2xl bg-[#061b12] text-white border border-[#143d2c] shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    {t("cash.changeDue")}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0c2e20] text-emerald-300 font-semibold border border-emerald-700/50">
                  {t("cash.balancedReturn")}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="text-3xl font-black text-[#bef264] font-mono tracking-tight flex items-baseline gap-1.5">
                  ฿{changeDue.toFixed(2)}
                  <span className="text-sm font-bold text-emerald-400">THB</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">
                  <Lock className="h-3 w-3" />
                  <span>{t("cash.drawerAutoPop")}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#0e3524] text-xs">
                <div className="text-[11px] text-slate-300 font-medium mb-1.5">
                  {t("cash.optimalNotes")}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e3324] border border-emerald-700/40 text-emerald-200 text-[11px] font-mono">
                    {isTh ? "ธนบัตร 100 บาท 1 ใบ" : "1x ฿100 Red Note"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e3324] border border-emerald-700/40 text-emerald-200 text-[11px] font-mono">
                    {isTh ? "ธนบัตร 100 บาท 2 ใบ" : "2x ฿100 Red Note"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e3324] border border-emerald-700/40 text-emerald-200 text-[11px] font-mono">
                    {isTh ? "เหรียญ 2 บาท 2 เหรียญ" : "2x ฿2 Gold Coin"}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Options */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={printReceipt}
                    onChange={(e) => setPrintReceipt(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#061a12]"
                  />
                  <span className="font-medium text-slate-800">
                    {t("cash.printThermalPaper")}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#061a12]"
                  />
                  <span className="text-slate-600">
                    {t("cash.sendSms")}
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Printer className="h-3.5 w-3.5" />
                <span>{t("cash.printerReady")}</span>
              </div>
            </div>
          </div>

          {/* Bottom Modal Buttons */}
          <div className="flex items-center gap-3 pt-5 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition flex items-center gap-2"
            >
              <span className="font-mono text-xs text-slate-500">[Esc]</span>
              {t("cash.backToCart")}
            </button>

            <button
              type="button"
              onClick={() => onCompleteSale(tenderedAmount, changeDue)}
              className="flex-1 py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="h-5 w-5" />
              <span>{t("cash.completeSale")}</span>
              <span className="px-2 py-0.5 rounded bg-black/15 text-xs font-mono font-bold">
                [Enter]
              </span>
            </button>
          </div>
        </div>

        {/* Right Drawer: Quick-Pick Drawer (~38% width) */}
        <div className="w-full lg:w-[460px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-800">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">{t("cash.quickPickDrawer")}</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                [F6] PLU
              </span>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                { id: "All Items", key: "quickpick.allItems" },
                { id: "Bakery", key: "quickpick.bakery" },
                { id: "Dim Sum", key: "quickpick.dimSum" },
                { id: "Fresh Fruit", key: "quickpick.freshFruit" },
                { id: "Beverages", key: "quickpick.beverages" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedQuickPickCat(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedQuickPickCat === cat.id
                      ? "bg-[#061a12] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t(cat.key)}
                </button>
              ))}
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 max-h-[460px] overflow-y-auto pr-1">
              {filteredQuickPickItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/80 rounded-2xl border border-slate-200 p-2.5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-sm transition group"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-200">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono font-bold">
                      PLU {item.plu}
                    </div>
                  </div>

                  <div className="mt-2 flex-1">
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.name}</h4>
                    <div className="text-xs font-black text-emerald-800 font-mono mt-0.5">
                      ฿{item.price.toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddQuickPickItem(item)}
                    className="mt-2 w-full py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <Plus className="h-3 w-3 text-emerald-600" />
                    <span>{t("quickpick.add")}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-3 font-medium">
            <span>{t("cash.nonBarcodeSync")}</span>
            <span className="font-mono text-slate-400">{t("cash.holdShift")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
