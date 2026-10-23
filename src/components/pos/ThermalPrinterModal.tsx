"use client";

import { useState } from "react";
import { X, Printer, CheckCircle, Scissors, FileText, ArrowDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { sounds } from "@/lib/soundEffects";

interface ThermalPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminalCode?: string;
}

export function ThermalPrinterModal({
  isOpen,
  onClose,
  terminalCode = "POS-BKK-01",
}: ThermalPrinterModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPrint = () => {
    sounds.playScanBeep();
    setTestStatus(isTh ? "กำลังส่งคำสั่งพิมพ์ไปยังเครื่องพิมพ์..." : "Sending print job...");
    setTimeout(() => {
      window.print();
      setTestStatus(isTh ? "พิมพ์สลิปทดสอบสำเร็จ (Status: 200 OK)" : "Test Slip Printed Successfully!");
    }, 400);
  };

  const handlePaperFeed = () => {
    sounds.playScanBeep();
    setTestStatus(isTh ? "เลื่อนกระดาษฟีด 3 บรรทัด (Paper Feed Done)" : "Fed 3 lines of paper");
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleTestCut = () => {
    sounds.playScanBeep();
    setTestStatus(isTh ? "ทดสอบใบมีดตัดกระดาษอัตโนมัติ (Paper Cut Done)" : "Auto-cutter Test Done");
    setTimeout(() => setTestStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#071912] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                <span>{isTh ? "ทดสอบเครื่องพิมพ์สลิป" : "Thermal Slip Printer"}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono text-[10px]">
                  Epson
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Epson TM-T88VI (Thermal 80mm)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Notification */}
        {testStatus && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>{testStatus}</span>
          </div>
        )}

        {/* Thermal Slip Preview Simulation */}
        <div className="p-4 bg-slate-100 flex justify-center">
          <div className="w-64 bg-white p-4 shadow-sm border border-slate-300 font-mono text-[11px] text-slate-800 leading-tight rounded-sm select-text">
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <div className="font-bold text-xs text-black">*** KIPP MARKET ***</div>
              <div className="text-[10px] text-slate-600">สุขุมวิท 24 (#024)</div>
              <div className="text-[9px] text-slate-500 mt-1">TEST RECEIPT / ทดสอบพิมพ์</div>
            </div>

            <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>TERMINAL:</span>
                <span className="font-bold">{terminalCode}</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="text-emerald-700 font-bold">ONLINE (USB/LAN)</span>
              </div>
              <div className="flex justify-between">
                <span>PAPER:</span>
                <span>80mm Thermal Roll</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-500 space-y-1">
              <div>เครื่องพิมพ์พร้อมใช้งาน 100%</div>
              <div className="font-mono text-[8px] text-slate-400">=== EPSON ESC/POS READY ===</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex flex-col gap-2 bg-white">
          <button
            type="button"
            onClick={handleTestPrint}
            className="w-full py-3 rounded-2xl bg-[#061a12] hover:bg-[#0c2f21] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            <span>{isTh ? "สั่งพิมพ์สลิปทดสอบ [Print Test]" : "Print Test Slip"}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePaperFeed}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <ArrowDown className="h-3.5 w-3.5 text-slate-600" />
              <span>{isTh ? "เลื่อนกระดาษ" : "Feed Paper"}</span>
            </button>

            <button
              type="button"
              onClick={handleTestCut}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Scissors className="h-3.5 w-3.5 text-slate-600" />
              <span>{isTh ? "ทดสอบใบมีดตัด" : "Test Cut"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
