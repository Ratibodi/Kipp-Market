"use client";

import { Printer, Lock, Unlock, CheckCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PosFooterProps {
  isDrawerOpen?: boolean;
  onKickDrawer?: () => void;
  onTestPrint?: () => void;
  onSyncOutbox?: () => void;
  isOnline?: boolean;
  outboxPendingCount?: number;
}

export function PosFooter({
  isDrawerOpen = false,
  onKickDrawer,
  onTestPrint,
  onSyncOutbox,
  isOnline = true,
  outboxPendingCount = 0,
}: PosFooterProps) {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  return (
    <footer className="shrink-0 select-none bg-[#081812] text-slate-300 border-t border-[#0e2c1f]">
      {/* Upper Status Line */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#0f2e21] bg-[#071912]">
        <div className="flex items-center gap-4 text-slate-300">
          {/* Cloud Sync Status (Clickable) */}
          <button
            type="button"
            onClick={onSyncOutbox}
            title={isTh ? "คลิกเพื่อสั่งซิงก์ข้อมูลออฟไลน์ทันที" : "Click to sync offline sales queue"}
            className="flex items-center gap-1.5 font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            {isOnline ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300 font-semibold">{t("footer.cloudSync")}</span>
                <span className="text-white font-mono text-[11px]">{t("footer.live")}</span>
                {outboxPendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    ({outboxPendingCount} {isTh ? "รอซิงก์" : "queued"})
                  </span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400 font-semibold">{isTh ? "โหมดออฟไลน์" : "Offline"}</span>
                <span className="text-slate-300 font-mono text-[10px]">
                  ({outboxPendingCount} {isTh ? "บิลในเครื่อง" : "cached"})
                </span>
              </>
            )}
          </button>

          {/* Printer status (Clickable to test print) */}
          <button
            type="button"
            onClick={onTestPrint}
            title={isTh ? "กดเพื่อทดสอบเครื่องพิมพ์สลิป [Test Print]" : "Click to test thermal printer"}
            className="flex items-center gap-1.5 text-slate-300 px-2 py-1 rounded-lg hover:bg-emerald-950/60 hover:text-white border border-transparent hover:border-emerald-600/30 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium">Epson TM-T88VI</span>
            <span className="text-[10px] text-emerald-300/80 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40">
              {isTh ? "ทดสอบพิมพ์" : "Test Print"}
            </span>
          </button>

          {/* Cash Drawer status (Clickable to Kick Drawer) */}
          <button
            type="button"
            onClick={onKickDrawer}
            title={isTh ? "กดเพื่อเด้งเปิดลิ้นชักเก็บเงิน (Cash Drawer Kick)" : "Click to kick cash drawer"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer border ${
              isDrawerOpen
                ? "bg-amber-500/20 text-amber-300 border-amber-400/50 animate-pulse font-bold"
                : "text-slate-300 hover:bg-white/5 border-transparent hover:border-slate-700 font-medium"
            }`}
          >
            {isDrawerOpen ? (
              <>
                <Unlock className="h-3.5 w-3.5 text-amber-400" />
                <span>{isTh ? "⚡ ลิ้นชัก: เด้งเปิดแล้ว!" : "⚡ Drawer: OPENED!"}</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>{isTh ? "ลิ้นชัก: ปิดอยู่ (คลิกเปิด)" : "Drawer: Closed (Click)"}</span>
              </>
            )}
          </button>
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
            <strong className="text-emerald-400 font-bold">[F3]</strong> {isTh ? "กล้อง" : "Camera"}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F4]</strong> {t("footer.editQtyKey")}
          </span>
          <span>
            <strong className="text-lime-400 font-bold">[F5]</strong> {isTh ? "ส่วนลด" : "Discount"}
          </span>
          <span>
            <strong className="text-amber-400 font-bold">[F6]</strong> {t("footer.holdCartKey")}
          </span>
          <span>
            <strong className="text-emerald-400 font-bold">[F7]</strong> {isTh ? "สมาชิก" : "Member"}
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
