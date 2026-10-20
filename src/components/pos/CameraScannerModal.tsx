"use client";

import { useState, useEffect } from "react";
import { Camera, Zap, RefreshCw, X, Check, Barcode } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function CameraScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: CameraScannerModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (code: string, name: string) => {
    setScannedFeedback(`${name} (${code})`);
    setTimeout(() => {
      onScanSuccess(code);
      setScannedFeedback(null);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150 font-sans select-none">
      <div className="w-full max-w-md bg-[#071d14] border border-[#144733] rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#092218] border-b border-[#123e2c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">
                {isTh ? "สแกนบาร์โค้ดด้วยกล้อง [F3]" : "Camera Barcode Scanner [F3]"}
              </h2>
              <div className="text-[10px] text-slate-400 font-mono">
                {isTh ? "สำหรับมือถือ / แท็บเล็ตหน้าร้าน" : "For mobile / tablet POS setups"}
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

        {/* Viewfinder Area */}
        <div className="relative aspect-4/3 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          {/* Mock Camera Feed Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 opacity-80" />

          {/* Target Reticle Frame */}
          <div className="relative w-64 h-36 border-2 border-emerald-400/60 rounded-2xl flex items-center justify-center bg-black/30 shadow-inner">
            {/* Animated Laser Scanning Line */}
            <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />

            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-lime-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-lime-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-lime-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-lime-400" />

            <div className="text-[11px] font-mono text-emerald-300/80 uppercase tracking-widest text-center px-4">
              {scannedFeedback ? (
                <span className="text-lime-300 font-bold flex items-center gap-1 justify-center">
                  <Check className="h-4 w-4" />
                  {scannedFeedback}
                </span>
              ) : (
                isTh ? "จัดบาร์โค้ดให้อยู่ในกรอบ" : "Align barcode within frame"
              )}
            </div>
          </div>

          {/* Camera Controls Bar */}
          <div className="absolute bottom-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFlashOn(!flashOn)}
              className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                flashOn
                  ? "bg-amber-400 text-slate-950 border-amber-300"
                  : "bg-black/60 text-slate-300 border-white/20 hover:bg-black/80"
              }`}
            >
              <Zap className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCameraFacing(cameraFacing === "environment" ? "user" : "environment")
              }
              className="p-2 rounded-xl bg-black/60 text-slate-300 border border-white/20 hover:bg-black/80 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Test Barcodes for Demo */}
        <div className="p-4 bg-[#092218] border-t border-[#123e2c] space-y-2">
          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Barcode className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isTh ? "คลิกทดสอบสแกนตัวอย่าง:" : "Quick sample barcode scan:"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSimulateScan("8850188201948", "Meiji Milk")}
              className="p-2 rounded-xl bg-[#0c2f21] hover:bg-[#144733] border border-emerald-700/50 text-left transition cursor-pointer"
            >
              <div className="font-bold text-white text-[11px]">🥛 นมสดเมจิ 830มล.</div>
              <div className="text-[9px] font-mono text-emerald-400">8850188201948</div>
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan("8850999001201", "Singha Soda")}
              className="p-2 rounded-xl bg-[#0c2f21] hover:bg-[#144733] border border-emerald-700/50 text-left transition cursor-pointer"
            >
              <div className="font-bold text-white text-[11px]">🍾 โซดาสิงห์ 325มล.</div>
              <div className="text-[9px] font-mono text-emerald-400">8850999001201</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
