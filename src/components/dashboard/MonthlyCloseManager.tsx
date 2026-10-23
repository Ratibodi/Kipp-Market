"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Sparkles,
  Clock,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ArchiveItem {
  id: string;
  yearMonth: string;
  totalSales: number;
  netProfit: number;
  receiptsCount: number;
  downloadToken: string;
  closedAt: string;
  closedBy: string;
}

export function MonthlyCloseManager() {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchArchives();
  }, []);

  async function fetchArchives() {
    setIsFetching(true);
    try {
      const res = await fetch("/api/admin/monthly-close");
      if (res.ok) {
        const data = await res.json();
        setArchives(data.archives || []);
      }
    } catch (err) {
      console.warn("Failed to fetch archives:", err);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleCloseAndPurge() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/monthly-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const result = await res.json();
        setIsConfirmOpen(false);
        setToastMessage(
          isTh
            ? `ปิดรอบเดือน ${result.yearMonth} สำเร็จ! ส่งออก Excel และเคลียร์ ${result.purgedBillsCount} บิลเรียบร้อย`
            : `Closed month ${result.yearMonth}! Exported Excel and cleared ${result.purgedBillsCount} bills.`
        );
        fetchArchives();
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch {
      setToastMessage(isTh ? "เกิดข้อผิดพลาดในการปิดรอบ" : "Error executing close");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Feature Banner */}
      <div className="bg-gradient-to-br from-[#061a12] to-[#0c2f21] text-white rounded-3xl p-6 border border-[#143d2c] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <Clock className="h-3 w-3" />
              <span>{isTh ? "ระบบตัดรอบอัตโนมัติ: ทุกเที่ยงคืน 00:00 น. วันที่ 1" : "Auto Close: 00:00:00 on the 1st"}</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {isTh ? "ระบบปิดรอบบัญชีสิ้นเดือน & ส่งออกไฟล์ Excel อัตโนมัติ" : "Month-End Close, Excel Archive & Purge"}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {isTh
                ? "รวบรวมยอดขาย กำไร และสต็อกสินค้าออกมาเป็นไฟล์ Excel 4 แผ่นงาน พร้อมเคลียร์ประวัติบิลออกจากฐานข้อมูล เพื่อคืนพื้นที่และความเร็วให้ระบบ 100% โดยที่ข้อมูลสินค้าและสต็อกยกยอดยังคงอยู่ครบถ้วน"
                : "Compiles monthly financials, exports 4-sheet Excel report, safely purges sales records to keep POS ultra-fast, and rolls over ending inventory."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 active:scale-95"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{isTh ? "ปิดรอบ & สำรองข้อมูลเดี๋ยวนี้" : "Close & Archive Now"}</span>
        </button>
      </div>

      {/* Confirmation Modal (Safety Gate) */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  {isTh ? "ยืนยันการปิดรอบ & สำรองข้อมูล" : "Confirm Monthly Close"}
                </h4>
                <p className="text-xs text-slate-500">
                  {isTh ? "ระบบความปลอดภัย 100%" : "Zero Data Loss Guarantee"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>{isTh ? "สิ่งที่จะเกิดขึ้นเมื่อยืนยัน:" : "What will happen:"}</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>{isTh ? "สร้างไฟล์ Excel สรุปยอดขาย กำไร และสต็อกยกยอด" : "Generates 4-sheet Excel report"}</li>
                <li>{isTh ? "บันทึกไฟล์ลงคลังประวัติย้อนหลัง ให้ดาวน์โหลดซ้ำได้ตลอดเวลา" : "Archives report file to cloud storage"}</li>
                <li>{isTh ? "ล้างบิลขายของเดือนนั้นออกจากระบบ เพื่อให้เว็บเร็วขึ้น" : "Purges historical slips to maximize speed"}</li>
                <li className="text-emerald-700 font-bold">{isTh ? "สินค้า สต็อก และราคาทั้งหมดไม่หาย 100%" : "Products and current stock remain intact 100%"}</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {isTh ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCloseAndPurge}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>
                  {isLoading
                    ? isTh ? "กำลังสร้าง Excel และปิดรอบ..." : "Generating & Closing..."
                    : isTh ? "ยืนยันดำเนินการปิดรอบ" : "Confirm Close"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archives History Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <h4 className="text-sm font-black text-slate-900">
              {isTh ? "คลังไฟล์ Excel ประจำเดือนย้อนหลัง" : "Archived Monthly Excel Reports"}
            </h4>
          </div>
          <button
            type="button"
            onClick={fetchArchives}
            className="text-xs text-slate-500 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            <span>{isTh ? "รีเฟรช" : "Refresh"}</span>
          </button>
        </div>

        {archives.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <FileSpreadsheet className="h-10 w-10 text-slate-300" />
            <p className="font-bold text-slate-700">
              {isTh ? "ยังไม่มีไฟล์รายงานปิดรอบประจำเดือน" : "No monthly archives yet"}
            </p>
            <p className="text-slate-400 max-w-sm">
              {isTh
                ? "เมื่อระบบตัดรอบสิ้นเดือนอัตโนมัติ หรือเมื่อเจ้าของร้านกดปิดรอบ ไฟล์ Excel จะปรากฏที่นี่เพื่อให้ดาวน์โหลดได้ตลอดเวลา"
                : "When monthly close is executed automatically or manually, reports will appear here for download."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {archives.map((arc) => (
              <div
                key={arc.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span>{isTh ? `รายงานรอบเดือน ${arc.yearMonth}` : `Month ${arc.yearMonth} Report`}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold font-mono">
                        {arc.receiptsCount} {isTh ? "บิล" : "slips"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-3">
                      <span>{isTh ? "ยอดขาย" : "Sales"}: ฿{Number(arc.totalSales).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{isTh ? "กำไรสุทธิ" : "Profit"}: ฿{Number(arc.netProfit).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      <span>•</span>
                      <span className="text-slate-400">{new Date(arc.closedAt).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`/api/admin/monthly-close/download/${arc.downloadToken}`}
                  download
                  className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{isTh ? "ดาวน์โหลดไฟล์ Excel (.xlsx)" : "Download (.xlsx)"}</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
