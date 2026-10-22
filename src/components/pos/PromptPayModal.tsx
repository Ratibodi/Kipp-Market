"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Printer,
  MessageSquare,
  Lock,
  ChevronRight,
  X,
  FileCheck2,
  SlidersHorizontal,
  Loader2,
  Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  createPromptPayQrDataUrl,
  formatPromptPayDisplay,
} from "@/lib/promptpay";

interface PromptPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount?: number;
  trxId?: string;
  promptPayId?: string;
  accountName?: string;
  promptPayType?: string;
}

export function PromptPayModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount = 196.0,
  trxId = "#TRX-9481",
  promptPayId: initialPromptPayId,
  accountName: initialAccountName,
  promptPayType: initialPromptPayType,
}: PromptPayModalProps) {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [secondsLeft, setSecondsLeft] = useState(164); // 02:44

  const [simState, setSimState] = useState<"Waiting" | "Success" | "Expired" | "Bank Error">("Waiting");
  const [autoPrint, setAutoPrint] = useState(true);
  const [sendSms, setSendSms] = useState(true);

  // Real PromptPay QR state
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [emvPayload, setEmvPayload] = useState<string>("");
  const [promptPayId, setPromptPayId] = useState<string>(initialPromptPayId || "0819998841");
  const [accountName, setAccountName] = useState<string>(initialAccountName || "กิ๊ป มินิมาร์ท");
  const [promptPayType, setPromptPayType] = useState<string>(initialPromptPayType || "PHONE");
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(true);

  // Load real store PromptPay settings and generate authentic EMVCo QR code
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadRealQr() {
      setIsLoadingQr(true);
      try {
        let activeId = initialPromptPayId;
        let activeName = initialAccountName;
        let activeType = initialPromptPayType;

        // If not provided in props, fetch live store payment settings
        if (!activeId) {
          try {
            const res = await fetch("/api/settings/payment");
            if (res.ok) {
              const data = await res.json();
              if (data?.settings?.promptpayId) {
                activeId = data.settings.promptpayId;
                activeName = data.settings.accountName || activeName;
                activeType = data.settings.promptpayType || activeType;
              }
            }
          } catch (fetchErr) {
            console.warn("Could not fetch store payment settings, using local fallback:", fetchErr);
          }
        }

        const targetId = activeId || "0819998841";
        const targetName = activeName || "กิ๊ป มินิมาร์ท";
        const targetType = activeType || "PHONE";

        // Generate genuine Bank of Thailand EMVCo QR Code
        const { payload, qrDataUrl: generatedUrl } = await createPromptPayQrDataUrl(
          targetId,
          amount
        );

        if (isMounted) {
          setQrDataUrl(generatedUrl);
          setEmvPayload(payload);
          setPromptPayId(targetId);
          setAccountName(targetName);
          setPromptPayType(targetType);
        }
      } catch (err) {
        console.error("Failed to generate live PromptPay QR:", err);
      } finally {
        if (isMounted) setIsLoadingQr(false);
      }
    }

    loadRealQr();

    return () => {
      isMounted = false;
    };
  }, [isOpen, amount, initialPromptPayId, initialAccountName, initialPromptPayType]);
  useEffect(() => {
    if (!isOpen) return;
    if (simState !== "Waiting") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setSimState("Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, simState]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "F5") {
        e.preventDefault();
        setSecondsLeft(180);
      } else if (e.key === "F3") {
        e.preventDefault();
        setSecondsLeft(180);
      } else if (e.key === "Enter" || e.key === " ") {
        if (simState === "Success") {
          e.preventDefault();
          onPaymentSuccess();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, simState, onClose, onPaymentSuccess]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#061a12]/90 backdrop-blur-sm flex flex-col justify-between overflow-y-auto font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="bg-[#082017] border-b border-[#0f3424] px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="hover:text-white cursor-pointer" onClick={onClose}>
              {t("pp.breadcrumbCart")}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-500" />
            <span className="hover:text-white cursor-pointer" onClick={onClose}>
              {t("pp.breadcrumbTender")}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-500" />
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="text-base">❇️</span> {t("pp.breadcrumbTitle")}
            </span>
          </div>

          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Ref: <strong className="text-white font-mono">{trxId}</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Lane 01 / Station POS-BKK-01</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t("pp.itmxLive")}</span>
          </div>
          <span className="text-slate-400 font-mono">14:38:12 ICT</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-[1520px] w-full mx-auto px-6 py-5 flex flex-col gap-4">
        {/* Step Progress Tracker */}
        <div className="bg-white/95 rounded-2xl p-4 shadow-lg border border-slate-200/80 flex items-center justify-between max-w-4xl mx-auto w-full">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">{t("pp.step1")}</div>
              <div className="text-[11px] text-emerald-600 font-mono">{t("pp.step1Sub")}</div>
            </div>
          </div>

          <div className="h-0.5 w-16 bg-slate-200" />

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#071a12] text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/30">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                {t("pp.step2")}
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">{t("pp.step2Sub")}</div>
            </div>
          </div>

          <div className="h-0.5 w-16 bg-slate-200" />

          {/* Step 3 */}
          <div className="flex items-center gap-3 opacity-60">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-slate-600">{t("pp.step3")}</div>
              <div className="text-[11px] text-slate-400">{t("pp.step3Sub")}</div>
            </div>
          </div>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          {/* Left Column: QR & Status Cards (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Dark Thai QR Payment Banner */}
            <div className="bg-[#081b13] rounded-2xl p-4 text-white border border-[#143d2c] flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white px-2 py-1.5 rounded-lg flex items-center justify-center shadow-inner">
                  <span className="text-[#002f6c] font-black text-xs tracking-tight">THAI QR</span>
                </div>
                <div>
                  <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                    Thai QR Payment • <span className="text-[10px] tracking-widest text-emerald-400">||||||||||</span>
                  </div>
                  <div className="text-[10px] text-slate-300 tracking-wider">
                    NATIONAL ELECTRONIC PAYMENT SERVICE
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="text-emerald-400 font-bold font-mono">
                  {promptPayType === "TAX_ID" ? "TAX ID" : "PROMPTPAY"}: {formatPromptPayDisplay(promptPayId, promptPayType)}
                </div>
                <div className="text-[11px] text-slate-300 uppercase font-semibold">
                  {accountName} (LANE 01)
                </div>
              </div>
            </div>

            {/* Shield Notice */}
            <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-xl p-3 flex items-center gap-3 text-emerald-950 text-xs shadow-sm">
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="leading-snug">
                <strong className="text-emerald-900 font-semibold">Duplicate Payment Shield Active:</strong>{" "}
                Session locked to Slip Verification Node. Customer app will resolve exact amount only.
              </div>
            </div>

            {/* Main Interactive Card: QR + Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Sub-Card: QR Card */}
              <div className="md:col-span-6 flex flex-col items-center bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="w-full bg-[#003865] text-white py-1.5 px-3 rounded-t-lg text-center font-bold text-xs tracking-wider flex items-center justify-center gap-1.5">
                  PROMPTPAY <span className="text-[9px] tracking-widest text-cyan-300">||||||||||</span>
                </div>

                <div className="relative p-2 bg-white border-x border-b border-slate-100 flex items-center justify-center w-full min-h-[230px]">
                  {isLoadingQr ? (
                    <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 text-emerald-700">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-xs font-semibold">กำลังสร้าง QR พร้อมเพย์...</span>
                    </div>
                  ) : qrDataUrl ? (
                    <div className="relative flex items-center justify-center">
                      <img
                        src={qrDataUrl}
                        alt={`PromptPay QR for ${amount} THB`}
                        className="w-56 h-56 object-contain rounded-lg"
                      />
                      {/* Center Thai QR Badge Overlay (Bank of Thailand standard badge) */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#002f6c] border-2 border-white rounded-lg flex items-center justify-center shadow-md pointer-events-none">
                        <span className="text-white font-black text-[8px] leading-tight text-center tracking-tight">
                          THAI<br />QR
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-xs text-rose-500 font-medium text-center p-4">
                      ไม่สามารถสร้าง QR ได้ กรุณาตรวจสอบการตั้งค่า PromptPay
                    </div>
                  )}
                </div>

                <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 px-1">
                  <span title={emvPayload}>EMV: {emvPayload ? `${emvPayload.slice(0, 14)}...` : "000201010212"}</span>
                  <span>CRC: {emvPayload ? emvPayload.slice(-4) : "OK"}</span>
                </div>
              </div>

              {/* Right Sub-Cards: Vertical Stack */}
              <div className="md:col-span-6 flex flex-col gap-3">
                {/* 1. Tender Amount Locked */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    {t("pp.tenderAmountLocked")}
                  </div>
                  <div className="text-3xl font-extrabold text-[#081a12] tracking-tight mt-1 flex items-baseline gap-1">
                    ฿{amount.toFixed(2)} <span className="text-sm font-bold text-emerald-700">THB</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {isTh ? "VAT 7% (รวม ฿12.82) • 4 รายการ (6 ชิ้น)" : "Vat 7% (฿12.82 Incl.) • 4 Items (6 Pcs)"}
                  </div>
                </div>

                {/* 2. Session Timeout */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      {t("pp.sessionTimeout")}
                    </span>
                    <span className="font-mono text-sm font-extrabold text-slate-900">{timeFormatted}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(secondsLeft / 180) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5">
                    {t("pp.refreshCycle")}
                  </div>
                </div>

                {/* 3. Awaiting Bank Settlement */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    simState === "Success"
                      ? "bg-emerald-50 border-emerald-300"
                      : simState === "Expired"
                      ? "bg-amber-50 border-amber-300"
                      : simState === "Bank Error"
                      ? "bg-red-50 border-red-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {simState === "Success" ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : simState === "Expired" || simState === "Bank Error" ? (
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-[#092218] border-t-transparent animate-spin shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {simState === "Success"
                          ? isTh ? "ยืนยันยอดเงินจากธนาคารสำเร็จ!" : "Bank Settlement Confirmed!"
                          : simState === "Expired"
                          ? isTh ? "QR Code หมดอายุแล้ว" : "QR Code Expired"
                          : simState === "Bank Error"
                          ? isTh ? "การเชื่อมต่อระบบ ITMX ขัดข้อง" : "ITMX Network Connection Error"
                          : t("pp.awaitingSettlement")}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {simState === "Success"
                          ? isTh
                            ? "สลิปธนาคารกสิกรไทย (K+) ได้รับการตรวจสอบลายมือชื่อ 9A4F881C เรียบร้อย"
                            : "Kasikorn Bank (K+) slip verified with cryptographic signature 9A4F881C."
                          : t("pp.checkingBanks")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSecondsLeft(180)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
                {t("pp.reCheck")}
              </button>

              <button
                type="button"
                onClick={() => setSecondsLeft(180)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
                {t("pp.reGen")}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 ml-auto"
              >
                <X className="h-3.5 w-3.5 text-red-500" />
                {t("pp.returnCart")}
              </button>
            </div>

            {/* Cashier Simulation Sandbox */}
            <div className="p-3 bg-slate-100/90 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                <span>{t("pp.simulation")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimState("Waiting")}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition ${
                    simState === "Waiting"
                      ? "bg-[#071a12] text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                  }`}
                >
                  {t("pp.waiting")}
                </button>
                <button
                  type="button"
                  onClick={() => setSimState("Success")}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition ${
                    simState === "Success"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                  }`}
                >
                  {t("pp.success")}
                </button>
                <button
                  type="button"
                  onClick={() => setSimState("Expired")}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition ${
                    simState === "Expired"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                  }`}
                >
                  {t("pp.expired")}
                </button>
                <button
                  type="button"
                  onClick={() => setSimState("Bank Error")}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition ${
                    simState === "Bank Error"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
                  }`}
                >
                  {t("pp.bankError")}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tender Audit & Settlement Slip (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* 1. Tender Audit Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">{t("pp.tenderAudit")}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold tracking-wide">
                  {t("pp.pendingScan")}
                </span>
              </div>

              {/* Items List */}
              <div className="mt-3 divide-y divide-slate-100 text-xs">
                <div className="py-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>{t("pos.itemDescription")}</span>
                  <span>{isTh ? "จำนวน • รวม" : "QTY • SUB"}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{isTh ? "นมสดเมจิ 830 มล." : "Meiji Fresh Milk 830ml"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: 8850329144</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono">฿49.00</div>
                    <div className="text-[10px] text-slate-400">1 × 49.00</div>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{isTh ? "ข้าวหน้าไก่เทอริยากิ ซีพี" : "CP Teriyaki Chicken Rice Bowl"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: 8850123991</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono">฿69.00</div>
                    <div className="text-[10px] text-slate-400">1 × 69.00</div>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{isTh ? "โซดาสิงห์ 325 มล." : "Singha Soda Water (Bottle)"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: 8850999120</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono">฿30.00</div>
                    <div className="text-[10px] text-slate-400">3 × 10.00</div>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{isTh ? "เลย์ ร็อค มันฝรั่งทอดกรอบ 48 กรัม" : "Lay's Classic Rock Salt 48g"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: 8851442019</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono">฿25.00</div>
                    <div className="text-[10px] text-slate-400">1 × 25.00</div>
                  </div>
                </div>
              </div>

              {/* Tax & Totals */}
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>{t("pp.taxableAmount")}</span>
                  <span className="font-mono text-slate-800">฿183.18</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("pp.vatAmount")}</span>
                  <span className="font-mono text-slate-800">฿12.82</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">{t("pp.totalTenderLock")}</span>
                  <span className="text-2xl font-black text-slate-950 font-mono">฿{amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 2. Settlement Slip Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t("pp.settlementSlip")}</div>
                    <div className="text-[11px] text-slate-500">{t("pp.awaitingVerification")}</div>
                  </div>
                </div>
              </div>

              {/* Slip Metrics Table */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 text-xs space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                  <span>{t("pp.authSlipMetrics")}</span>
                  <span className="text-emerald-600 font-semibold">{t("pp.standby")}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">{t("pp.paymentMethod")}</span>
                  <span className="font-bold text-slate-800">PromptPay QR (B2C)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("pp.clearingGateway")}</span>
                  <span className="font-medium text-slate-800">Kasikorn K PLUS / ITMX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("pp.bankTransId")}</span>
                  <span className="font-mono text-slate-400">
                    {simState === "Success" ? "TX-TH-9A4F881C" : "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("pp.senderAccount")}</span>
                  <span className="font-mono text-slate-800">XXX-X-X9201-1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("pp.timestamp")}</span>
                  <span className="text-slate-600">
                    {simState === "Success" ? "14:28:12 ICT (Verified)" : t("pp.pendingScanText")}
                  </span>
                </div>
              </div>

              {/* Receipt Delivery Options */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoPrint}
                    onChange={(e) => setAutoPrint(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 accent-[#061a12]"
                  />
                  <Printer className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-slate-800 font-medium">{t("pp.autoPrintSlip")}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 accent-[#061a12]"
                  />
                  <MessageSquare className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-slate-800 font-medium">{t("pp.smsReceipt")}</span>
                </label>
              </div>

              {/* Big Confirmation Button */}
              <button
                type="button"
                disabled={simState !== "Success"}
                onClick={onPaymentSuccess}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-2 ${
                  simState === "Success"
                    ? "bg-[#84cc16] hover:bg-[#65a30d] text-[#091a13] cursor-pointer ring-2 ring-emerald-500/50"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {simState === "Success"
                  ? t("pp.paymentVerifiedBtn")
                  : t("pp.waitingConfirmationBtn")}
              </button>
            </div>

            {/* Manager Fallback Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{t("pp.managerFallback")}</div>
                  <div className="text-[11px] text-slate-500">{t("pp.supervisorKey")}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSimState("Success")}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 transition"
              >
                {t("pp.manualAudit")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hotkeys Guide Bar */}
      <div className="bg-[#030d09] border-t border-[#0e2c1f] px-6 py-2 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            <strong className="text-slate-300">[Esc]</strong> {isTh ? "ยกเลิกกลับสู่ตะกร้า" : "Cancel to Cart"}
          </span>
          <span>
            <strong className="text-emerald-400">[F5]</strong> {isTh ? "ดึงข้อมูลใหม่" : "Force Re-poll"}
          </span>
          <span>
            <strong className="text-emerald-400">[F3]</strong> {isTh ? "สร้าง QR ใหม่" : "Regenerate Payload"}
          </span>
          <span>
            <strong className="text-emerald-400">[F1]</strong> {isTh ? "สิทธิ์หัวหน้างาน" : "Supervisor Override"}
          </span>
          <span>
            <strong className="text-emerald-400">[Space / Enter]</strong> {isTh ? "ปิดบิลเมื่อยืนยันยอด" : "Finalize when Confirmed"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Slip Matching Node: BKK-CORE-ITMX-04</span>
        </div>
      </div>
    </div>
  );
}
