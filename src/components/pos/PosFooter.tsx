"use client";

import { Printer, Lock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function PosFooter() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  return (
    <footer className="shrink-0 select-none bg-[#081812] text-slate-300 border-t border-[#0e2c1f]">
      {/* Upper Status Line */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#0f2e21] bg-[#071912]">
        <div className="flex items-center gap-5 text-slate-300">
          {/* Cloud Sync */}
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 font-semibold">{t("footer.cloudSync")}</span>
            <span className="text-white">{t("footer.live")}</span>
          </div>

          {/* Printer status */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>{isTh ? "Epson TM-T88VI (ความร้อน พร้อมใช้งาน)" : "Epson TM-T88VI (Thermal Ready)"}</span>
          </div>

          {/* Cash Drawer status */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>{isTh ? "ลิ้นชัก: ปิดอยู่" : "Drawer: Closed"}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-slate-400">
            {t("footer.lastSale")}{" "}
            <span className="text-white font-mono font-medium">#TRX-9480</span>{" "}
            <span className="text-slate-400">(฿115.00 • 2m ago)</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-[11px] font-semibold">
            <CheckCircle className="h-3 w-3" />
            {t("footer.taxReady")}
          </div>
        </div>
      </div>

      {/* Bottom Keyboard Hotkeys Guide */}
      <div className="px-4 py-1.5 bg-[#030d09] text-[11px] flex flex-wrap items-center justify-between gap-2 font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            <strong className="text-emerald-400 font-bold">[F2]</strong> {t("footer.search")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F4]</strong> {t("footer.editQtyKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F6]</strong> {t("footer.holdCartKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F7]</strong> {t("footer.couponKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F8]</strong> {t("footer.clearCartKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F9]</strong> {t("footer.cashKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F10]</strong> {t("footer.qrKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F11]</strong> {t("footer.cardKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F12]</strong> {t("footer.trueMoneyKey")}
          </span>
          <span className="text-red-400 font-medium">
            <strong className="text-red-400 font-bold">[Del]</strong> {t("footer.voidLineKey")}
          </span>
        </div>

        <div className="text-slate-500 text-[11px]">
          Terminal ID: <span className="text-slate-300">POS-BKK-01</span> • Kipp OS v3.4.2
        </div>
      </div>
    </footer>
  );
}
