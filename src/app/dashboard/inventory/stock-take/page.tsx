"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Barcode,
  Search,
  ScanBarcode,
  Check,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_CATALOG_PRODUCTS, CatalogProduct, MOCK_STOCK_TAKES } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

interface CountItem {
  product: CatalogProduct;
  systemQty: number;
  countedQty: number;
  isCounted: boolean;
}

export default function StockTakePage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  // Mode: Blind Count (Cashier) vs Manager Audit (Manager)
  const [isBlindCount, setIsBlindCount] = useState<boolean>(true);
  const [sessionStatus, setSessionStatus] = useState<"DRAFT" | "APPROVED">("DRAFT");
  const [searchBarcode, setSearchBarcode] = useState<string>("");

  const [countItems, setCountItems] = useState<CountItem[]>(() =>
    MOCK_CATALOG_PRODUCTS.map((prod) => ({
      product: prod,
      systemQty: prod.stockQty,
      countedQty: prod.stockQty, // defaults matching
      isCounted: true,
    }))
  );

  // Simulate one item with a discrepancy (Shrinkage)
  // E.g. Lay's Chips: System has 25, physical count is 22 (Variance = -3)
  const handleUpdateCount = (productId: string, val: string) => {
    const num = parseFloat(val);
    setCountItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              countedQty: isNaN(num) || num < 0 ? 0 : num,
              isCounted: true,
            }
          : item
      )
    );
  };

  // Variance Calculations
  const totalVarianceQty = countItems.reduce(
    (acc, item) => acc + (item.countedQty - item.systemQty),
    0
  );
  const totalVarianceValue = countItems.reduce(
    (acc, item) =>
      acc + (item.countedQty - item.systemQty) * item.product.avgCost,
    0
  );

  const handleApproveAdjustments = () => {
    if (
      confirm(
        isTh
          ? `ยืนยันอนุมัติปรับยอดสต็อกส่วนต่างรวม ฿${totalVarianceValue.toFixed(2)} เข้าบัญชีแยกประเภทใช่หรือไม่?`
          : `Approve stock adjustment totaling ฿${totalVarianceValue.toFixed(2)}?`
      )
    ) {
      setSessionStatus("APPROVED");
      alert(
        isTh
          ? "อนุมัติรอบนับสต็อกสำเร็จ! บันทึก StockMovement เรียบร้อย"
          : "Stock take approved! StockMovements ledger updated."
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  SESSION #ST-202606-W2
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    sessionStatus === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {sessionStatus === "APPROVED" ? (isTh ? "อนุมัติแล้ว" : "APPROVED") : (isTh ? "ฉบับร่าง (กำลังนับ)" : "DRAFT")}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <Layers className="h-6 w-6 text-emerald-600" />
                <span>{isTh ? "ตรวจนับสต็อกสินค้า (Cycle Count & Stock Take)" : "Stock Take & Cycle Counting"}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTh
                  ? "ระบบ Blind Count นับตามจริงโดยไม่แสดงยอดระบบ เพื่อป้องกันความเอนเอียง (Design Doc ข้อ 7.6)"
                  : "Blind Count Mode with Variance Value reconciliation and Manager approval workflow"}
              </p>
            </div>

            {/* Mode Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBlindCount(!isBlindCount)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isBlindCount
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {isBlindCount ? <EyeOff className="h-4 w-4 text-amber-400" /> : <Eye className="h-4 w-4 text-emerald-600" />}
                <span>
                  {isBlindCount
                    ? isTh ? "โหมดนับจริง (Blind Count: ซ่อนยอดระบบ)" : "Blind Count Mode (Hidden)"
                    : isTh ? "โหมดผู้จัดการ (Audit: แสดงยอดระบบ)" : "Manager Audit Mode (Visible)"}
                </span>
              </button>

              {sessionStatus === "DRAFT" && (
                <button
                  type="button"
                  onClick={handleApproveAdjustments}
                  className="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isTh ? "อนุมัติผลนับปรับยอด" : "Approve & Adjust Stock"}</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Variance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">{isTh ? "จำนวนรายการที่ตรวจนับ" : "Total Counted Items"}</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {countItems.length} {isTh ? "รายการ" : "SKUs"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">{isTh ? "ส่วนต่างจำนวนชิ้น (Variance Qty)" : "Variance Quantity"}</div>
              <div
                className={`text-2xl font-black font-mono mt-1 ${
                  totalVarianceQty < 0 ? "text-rose-600" : totalVarianceQty > 0 ? "text-blue-600" : "text-emerald-600"
                }`}
              >
                {totalVarianceQty > 0 ? `+${totalVarianceQty}` : totalVarianceQty}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">{isTh ? "มูลค่าส่วนต่างสต็อก (Variance Value)" : "Variance Value (THB)"}</div>
              <div
                className={`text-2xl font-black font-mono mt-1 ${
                  totalVarianceValue < 0 ? "text-rose-600" : totalVarianceValue > 0 ? "text-blue-600" : "text-emerald-600"
                }`}
              >
                ฿{totalVarianceValue.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">{isTh ? "สถานะการขายหน้าร้าน" : "POS Live Status"}</div>
              <div className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isTh ? "เปิดขายตามปกติ (ไม่หยุดการขาย)" : "Sales Uninterrupted"}</span>
              </div>
            </div>
          </div>

          {/* Counting Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                {isTh ? "ตารางกรอกจำนวนนับจริงประจำรอบ" : "Physical Count Verification Sheet"}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {isBlindCount
                  ? isTh ? "🔒 ซ่อนตัวเลขในระบบสำหรับพนักงาน" : "🔒 System values obscured for unbiased count"
                  : isTh ? "🔓 แสดงการเปรียบเทียบ Variance ครบถ้วน" : "🔓 Full Variance audit visible"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{isTh ? "สินค้า" : "Product"}</th>
                    <th className="py-3 px-3">{isTh ? "บาร์โค้ด" : "Barcode"}</th>
                    {!isBlindCount && (
                      <th className="py-3 px-3 text-right">{isTh ? "ยอดในระบบ" : "System Qty"}</th>
                    )}
                    <th className="py-3 px-3 text-center">{isTh ? "จำนวนนับได้จริง *" : "Counted Qty *"}</th>
                    {!isBlindCount && (
                      <>
                        <th className="py-3 px-3 text-right">{isTh ? "ส่วนต่าง (Variance)" : "Variance"}</th>
                        <th className="py-3 px-3 text-right">{isTh ? "ต้นทุนเฉลี่ย" : "Unit Cost"}</th>
                        <th className="py-3 px-4 text-right">{isTh ? "มูลค่าส่วนต่าง (฿)" : "Variance Value"}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {countItems.map((item) => {
                    const variance = item.countedQty - item.systemQty;
                    const varianceVal = variance * item.product.avgCost;

                    return (
                      <tr key={item.product.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.nameEn}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {isTh ? item.product.nameTh : item.product.nameEn}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                SKU: {item.product.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-700">
                          {item.product.barcode}
                        </td>

                        {/* System Qty (Hidden in Blind Count Mode) */}
                        {!isBlindCount && (
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                            {item.systemQty} {item.product.unit}
                          </td>
                        )}

                        {/* Counted Qty Input */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            disabled={sessionStatus === "APPROVED"}
                            value={item.countedQty}
                            onChange={(e) => handleUpdateCount(item.product.id, e.target.value)}
                            className="w-20 h-8 text-center rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                          />
                        </td>

                        {/* Variance Columns (Visible only in Audit Mode) */}
                        {!isBlindCount && (
                          <>
                            <td className="py-3 px-3 text-right font-mono font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  variance === 0
                                    ? "bg-emerald-100 text-emerald-800"
                                    : variance < 0
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {variance > 0 ? `+${variance}` : variance}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-500">
                              ฿{item.product.avgCost.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black">
                              <span
                                className={
                                  varianceVal < 0
                                    ? "text-rose-600"
                                    : varianceVal > 0
                                    ? "text-blue-600"
                                    : "text-slate-400"
                                }
                              >
                                {varianceVal > 0 ? `+฿${varianceVal.toFixed(2)}` : `฿${varianceVal.toFixed(2)}`}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
