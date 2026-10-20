"use client";

import { useState } from "react";
import {
  Truck,
  Plus,
  Calculator,
  FileCheck,
  Calendar,
  Building2,
  DollarSign,
  ArrowRight,
  Package,
  CheckCircle,
  X,
  Layers,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_RECEIPTS, GoodsReceipt, MOCK_CATALOG_PRODUCTS, CatalogProduct } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function GoodsReceiptPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [receipts, setReceipts] = useState<GoodsReceipt[]>(MOCK_RECEIPTS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Goods Receipt Form State
  const [supplier, setSupplier] = useState<string>("CP-Meiji Distribution");
  const [docRef, setDocRef] = useState<string>(`PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-088`);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct>(MOCK_CATALOG_PRODUCTS[0]);
  const [recvQty, setRecvQty] = useState<string>("24");
  const [recvCost, setRecvCost] = useState<string>("34.00");

  // Real-time Moving Average Calculation (Design Doc 7.4)
  const currentQty = selectedProduct.stockQty;
  const currentAvgCost = selectedProduct.avgCost;
  const incomingQty = parseFloat(recvQty) || 0;
  const incomingCost = parseFloat(recvCost) || 0;

  let newAvgCost = incomingCost;
  if (currentQty + incomingQty > 0) {
    if (currentQty <= 0) {
      newAvgCost = incomingCost;
    } else {
      newAvgCost =
        (currentQty * currentAvgCost + incomingQty * incomingCost) /
        (currentQty + incomingQty);
    }
  }

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const newGr: GoodsReceipt = {
      id: `gr-${Date.now()}`,
      docNo: docRef,
      supplier,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      itemCount: 1,
      totalCost: incomingQty * incomingCost,
      status: "RECEIVED",
      receivedBy: isTh ? "สมชาย พ." : "Somchai P.",
    };
    setReceipts([newGr, ...receipts]);
    setIsModalOpen(false);
    alert(
      isTh
        ? `บันทึกรับสินค้า ${selectedProduct.nameTh} จำนวน ${incomingQty} ชิ้นเรียบร้อย ต้นทุนเฉลี่ยใหม่: ฿${newAvgCost.toFixed(2)}`
        : `Received ${incomingQty} pcs. New Moving Average Cost: ฿${newAvgCost.toFixed(2)}`
    );
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
                <Truck className="h-6 w-6 text-emerald-600" />
                <span>{isTh ? "รับสินค้าเข้าสต็อก & ต้นทุนเฉลี่ย" : "Goods Receipt & Moving Average Cost"}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isTh
                  ? "คำนวณต้นทุนแบบ Moving Average และล็อคต้นทุนเข้าคลังอัตโนมัติ (Design Doc ข้อ 7.4)"
                  : "Automatic Moving Average Cost re-calculation & Inventory Ledger locking"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isTh ? "+ บันทึกรับสินค้าเข้า" : "+ New Goods Receipt"}</span>
            </button>
          </div>

          {/* Formula Callout Banner */}
          <div className="p-4 rounded-2xl bg-[#071912] border border-emerald-900/60 text-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Moving Average Costing Engine</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800">
                    KIPP-COST-v1
                  </span>
                </div>
                <div className="text-slate-400 mt-0.5 font-mono text-[11px]">
                  newAvgCost = (qtyOnHand × avgCost + recvQty × recvCost) ÷ (qtyOnHand + recvQty)
                </div>
              </div>
            </div>

            <div className="text-[11px] text-emerald-300 font-medium bg-[#0b291d] px-3 py-1.5 rounded-xl border border-emerald-700/40">
              {isTh
                ? "🔒 ต้นทุนถูกล็อคฝั่งเซิร์ฟเวอร์ แคชเชียร์ไม่เห็นต้นทุน"
                : "🔒 Cost locked on server; Cashiers never see unit cost"}
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>{isTh ? "ประวัติการรับสินค้าเข้าคลังล่าสุด" : "Recent Goods Receipt History"}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {receipts.length} {isTh ? "เอกสาร" : "documents"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{isTh ? "เลขที่เอกสาร" : "Doc Ref"}</th>
                    <th className="py-3 px-3">{isTh ? "ซัพพลายเออร์" : "Supplier"}</th>
                    <th className="py-3 px-3">{isTh ? "วันที่รับสินค้า" : "Received At"}</th>
                    <th className="py-3 px-3 text-center">{isTh ? "จำนวนรายการ" : "Items"}</th>
                    <th className="py-3 px-3 text-right">{isTh ? "มูลค่ารวม (฿)" : "Total Cost (THB)"}</th>
                    <th className="py-3 px-3 text-center">{isTh ? "ผู้รับสินค้า" : "Receiver"}</th>
                    <th className="py-3 px-4 text-center">{isTh ? "สถานะ" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.map((rc) => (
                    <tr key={rc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {rc.docNo}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {rc.supplier}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {rc.date}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {rc.itemCount} {isTh ? "รายการ" : "items"}
                      </td>
                      <td className="py-3 px-3 text-right font-black font-mono text-slate-900">
                        ฿{rc.totalCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">
                        {rc.receivedBy}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <CheckCircle className="h-3 w-3" />
                          {isTh ? "รับเข้าคลังแล้ว" : "Received"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* NEW GOODS RECEIPT MODAL WITH LIVE MOVING AVERAGE PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                <span>{isTh ? "บันทึกรับสินค้าเข้าสต็อก (Goods Receipt)" : "Record Goods Receipt"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ผู้จัดจำหน่าย (Supplier) *" : "Supplier *"}
                  </label>
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="CP-Meiji Distribution">CP-Meiji Distribution</option>
                    <option value="CPF Direct Retail">CPF Direct Retail</option>
                    <option value="Thai President Foods PCL">Thai President Foods PCL</option>
                    <option value="ThaiBev Logistics BKK">ThaiBev Logistics BKK</option>
                    <option value="Frito-Lay Thailand">Frito-Lay Thailand</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "เลขที่ใบสั่งซื้อ / PO Reference *" : "PO Reference *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={docRef}
                    onChange={(e) => setDocRef(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "เลือกสินค้าที่จะรับเข้า *" : "Select Product to Receive *"}
                </label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => {
                    const prod = MOCK_CATALOG_PRODUCTS.find((p) => p.id === e.target.value);
                    if (prod) setSelectedProduct(prod);
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-medium"
                >
                  {MOCK_CATALOG_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isTh ? p.nameTh : p.nameEn} (ปัจจุบันคงเหลือ: {p.stockQty} {p.unit} • ต้นทุนเดิม: ฿{p.avgCost.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? `จำนวนที่รับเข้า (${selectedProduct.unit}) *` : `Quantity Received (${selectedProduct.unit}) *`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={recvQty}
                    onChange={(e) => setRecvQty(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-base font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ต้นทุนรับเข้าต่อหน่วย (บาท) *" : "Incoming Unit Cost (THB) *"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={recvCost}
                    onChange={(e) => setRecvCost(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-emerald-700 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* REAL-TIME MOVING AVERAGE CALCULATION PREVIEW BOX */}
              <div className="p-4 rounded-2xl bg-[#061a12] border border-[#12422e] text-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-[#0f3424]">
                  <span>{isTh ? "การจำลองคำนวณต้นทุนใหม่ (Live Moving Average)" : "Live Costing Simulation"}</span>
                  <span className="font-mono text-[10px]">REALTIME</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div>
                    <div className="text-slate-400">{isTh ? "ต้นทุนเดิม:" : "Previous Cost:"}</div>
                    <div className="font-mono font-bold text-white mt-0.5">฿{currentAvgCost.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 font-mono">({currentQty} {selectedProduct.unit})</div>
                  </div>
                  <div>
                    <div className="text-slate-400">{isTh ? "ต้นทุนรับเข้าใหม่:" : "Incoming Cost:"}</div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5">฿{incomingCost.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 font-mono">({incomingQty} {selectedProduct.unit})</div>
                  </div>
                  <div>
                    <div className="text-slate-400">{isTh ? "ต้นทุนเฉลี่ยใหม่:" : "New Moving Avg:"}</div>
                    <div className="font-mono font-black text-xl text-[#bef264] mt-0.5">฿{newAvgCost.toFixed(2)}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      ({currentQty + incomingQty} {selectedProduct.unit})
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black cursor-pointer shadow-sm"
                >
                  {isTh ? "ยืนยันรับสินค้าเข้าคลัง" : "Confirm Goods Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
