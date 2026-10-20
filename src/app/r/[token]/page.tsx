"use client";

import { use } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Receipt,
  Download,
  Share2,
  Store,
  ShieldCheck,
  Clock,
  ChevronLeft,
  QrCode,
  Printer,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";

export default function EReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const { t, language } = useLanguage();
  const isTh = language === "th";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 sm:p-6 flex flex-col items-center justify-center select-none print:p-0 print:bg-white print:m-0 print:min-h-0">
      {/* Top Header Floating Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 print:hidden">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{isTh ? "กลับสู่หน้าหลัก" : "Back to Home"}</span>
        </Link>

        <LanguageToggle variant="light" />
      </div>

      {/* Main E-Receipt Card (Clean Digital Thermal Simulation & Thermal Printer 80mm/58mm Ready) */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-[80mm] print:max-w-[80mm] print:rounded-none print:mx-auto">
        {/* Receipt Header Banner */}
        <div className="bg-[#071912] text-white p-6 text-center space-y-2 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-300">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{isTh ? "ชำระเงินสำเร็จแล้ว (PAID & SETTLED)" : "Paid & Settled"}</span>
          </div>

          <h1 className="text-xl font-black tracking-wider text-white">
            KIPP MARKET
          </h1>
          <div className="text-xs text-slate-300 font-medium">
            {isTh ? "สาขาสุขุมวิท ซอย 24 (#024)" : "Sukhumvit Soi 24 Branch (#024)"}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {isTh ? "เลขประจำตัวผู้เสียภาษี: 0105558194821 (สำนักงานใหญ่)" : "TAX ID: 0105558194821 (Head Office)"}
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs pb-3 border-b border-dashed border-slate-300">
            <div>
              <span className="text-slate-400">{isTh ? "เลขที่ใบเสร็จ:" : "Receipt No:"}</span>
              <div className="font-mono font-bold text-slate-900">#TRX-9481</div>
            </div>
            <div className="text-right">
              <span className="text-slate-400">{isTh ? "วันที่และเวลา:" : "Date & Time:"}</span>
              <div className="font-mono text-slate-700">14/06/2026 14:28</div>
            </div>
            <div>
              <span className="text-slate-400">{isTh ? "แคชเชียร์:" : "Cashier:"}</span>
              <div className="font-medium text-slate-700">{isTh ? "สมชาย พ. (8841)" : "Somchai P. (8841)"}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-400">{isTh ? "ช่องชำระ:" : "Lane:"}</span>
              <div className="font-mono text-slate-700">Lane 01 / Term 01</div>
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
              {isTh ? "รายการสินค้าที่ซื้อ" : "Purchased Items"}
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900">
                    {isTh ? "นมสดเมจิ พาสเจอร์ไรส์ 830 มล." : "Meiji Fresh Milk 830ml"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">2 x ฿46.50</div>
                </div>
                <div className="font-mono font-bold text-slate-900">฿93.00</div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900">
                    {isTh ? "ข้าวไก่ย่างเทอริยากิ ซีพี 230 กรัม" : "CP Teriyaki Chicken Rice 230g"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">1 x ฿49.00</div>
                </div>
                <div className="font-mono font-bold text-slate-900">฿49.00</div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900">
                    {isTh ? "โซดาสิงห์ 325 มล." : "Singha Soda Water 325ml"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">2 x ฿16.00</div>
                </div>
                <div className="font-mono font-bold text-slate-900">฿32.00</div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900">
                    {isTh ? "เลย์ ร็อค รสโนริสาหร่าย 48 กรัม" : "Lay's Potato Chips Nori 48g"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">1 x ฿22.00</div>
                </div>
                <div className="font-mono font-bold text-slate-900">฿22.00</div>
              </div>
            </div>
          </div>

          {/* Price Summary Breakdown */}
          <div className="pt-3 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{isTh ? "ยอดรวมก่อนภาษี (Excl. VAT)" : "Subtotal (Excl. VAT)"}</span>
              <span className="font-mono">฿183.18</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{isTh ? "ภาษีมูลค่าเพิ่ม 7% (รวมในราคา)" : "VAT 7% Included"}</span>
              <span className="font-mono">฿12.82</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-950 text-base">
              <span>{isTh ? "ยอดชำระสุทธิ (THB)" : "GRAND TOTAL (THB)"}</span>
              <span className="text-xl font-mono text-emerald-700">฿196.00</span>
            </div>
          </div>

          {/* Payment Method Badge */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {isTh ? "ช่องทางการชำระ" : "Payment Method"}
              </span>
              <span className="font-bold text-slate-800">
                {isTh ? "ไทย พร้อมเพย์ QR (Dynamic EMVCo)" : "Thai PromptPay QR (B2C)"}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-slate-600">TX-9A4F881C</span>
          </div>

          {/* E-Tax Digital Signature Token */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-[11px] space-y-1 text-slate-600 font-mono">
            <div className="flex items-center gap-1 font-bold text-emerald-800 text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>e-Receipt Cryptographic Verification</span>
            </div>
            <div className="truncate text-slate-500">
              Token: {token || "a8f94c20e11849a6bf328901"}
            </div>
            <div className="text-[10px] text-slate-400">
              {isTh
                ? "เอกสารนี้ลงลายมือชื่อดิจิทัลและบันทึกบนคลาวด์เรียบร้อยแล้ว"
                : "Digitally signed and archived securely on Kipp Cloud"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-3 rounded-2xl bg-[#061a12] hover:bg-[#0f3424] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-[#143d2c]"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              <span>{isTh ? "พิมพ์สลิป (Print)" : "Print Slip"}</span>
            </button>
            <button
              type="button"
              onClick={() => alert(isTh ? "ดาวน์โหลด PDF ใบเสร็จสำเร็จ" : "PDF downloaded")}
              className="py-3 px-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{isTh ? "PDF" : "PDF"}</span>
            </button>
            <button
              type="button"
              onClick={() => alert(isTh ? "คัดลอกลิงก์ใบเสร็จเรียบร้อย" : "Link copied to clipboard")}
              className="px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>{isTh ? "แชร์" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400">
          {isTh ? "ขอบคุณที่ใช้บริการ กิ๊ป มาร์เก็ต • Kipp Market POS" : "Thank you for shopping at Kipp Market"}
        </div>
      </div>
    </div>
  );
}
