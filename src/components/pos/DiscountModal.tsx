"use client";

import { useState } from "react";
import { X, Tag, Check, Percent, Banknote, Trash2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface DiscountInfo {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  label: string;
}

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  activeDiscount: DiscountInfo | null;
  onApplyDiscount: (discount: DiscountInfo) => void;
  onClearDiscount: () => void;
}

const PROMO_CODES: Record<string, { type: "PERCENT" | "FIXED"; value: number; label: string }> = {
  SAVE10: { type: "PERCENT", value: 10, label: "โค้ดลด 10% (SAVE10)" },
  SAVE15: { type: "PERCENT", value: 15, label: "โค้ดลด 15% (SAVE15)" },
  KIPP50: { type: "FIXED", value: 50, label: "คูปองเงินสด 50 บาท (KIPP50)" },
  MEMBER5: { type: "PERCENT", value: 5, label: "ส่วนลดสมาชิก 5% (MEMBER5)" },
  VIP20: { type: "PERCENT", value: 20, label: "สิทธิ์สมาชิก VIP 20% (VIP20)" },
};

export function DiscountModal({
  isOpen,
  onClose,
  subtotal,
  activeDiscount,
  onApplyDiscount,
  onClearDiscount,
}: DiscountModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [promoInput, setPromoInput] = useState<string>("");
  const [customType, setCustomType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [customValue, setCustomValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (type: "PERCENT" | "FIXED", value: number, label: string, code: string) => {
    onApplyDiscount({
      code,
      type,
      value,
      label,
    });
    onClose();
  };

  const handleApplyPromoCode = () => {
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    if (PROMO_CODES[clean]) {
      const match = PROMO_CODES[clean];
      onApplyDiscount({
        code: clean,
        type: match.type,
        value: match.value,
        label: match.label,
      });
      setErrorMessage(null);
      setPromoInput("");
      onClose();
    } else {
      setErrorMessage(isTh ? `ไม่พบคูปอง "${clean}" กรุณาลองใหม่อีกครั้ง` : `Invalid promo code "${clean}"`);
    }
  };

  const handleApplyCustom = () => {
    const num = parseFloat(customValue);
    if (isNaN(num) || num <= 0) {
      setErrorMessage(isTh ? "กรุณาระบุจำนวนส่วนลดที่ถูกต้อง" : "Please enter a valid discount amount");
      return;
    }

    if (customType === "PERCENT" && num > 100) {
      setErrorMessage(isTh ? "ส่วนลดเปอร์เซ็นต์ไม่สามารถเกิน 100% ได้" : "Percentage discount cannot exceed 100%");
      return;
    }

    if (customType === "FIXED" && num > subtotal) {
      setErrorMessage(isTh ? "ส่วนลดบาทไม่สามารถเกินยอดรวมได้" : "Fixed discount cannot exceed subtotal");
      return;
    }

    onApplyDiscount({
      code: "CUSTOM",
      type: customType,
      value: num,
      label: customType === "PERCENT" ? `ส่วนลดพิเศษ ${num}%` : `ส่วนลดเงินสด ฿${num.toFixed(2)}`,
    });
    setCustomValue("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#071912] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-400/20 text-lime-400 border border-lime-400/30">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                <span>{isTh ? "ส่วนลดสมาชิก & คูปองโปรโมชัน" : "Member Discount & Coupons"}</span>
                <span className="px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-300 font-mono text-[10px]">
                  [F5]
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {isTh ? `ยอดรวมก่อนหักส่วนลด: ฿${subtotal.toFixed(2)}` : `Subtotal: ฿${subtotal.toFixed(2)}`}
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

        {/* Active Discount Alert if any */}
        {activeDiscount && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between px-5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>{isTh ? "กำลังใช้:" : "Active:"}</span>
              <span className="font-mono bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-950 font-black">
                {activeDiscount.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClearDiscount();
                onClose();
              }}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isTh ? "ยกเลิกส่วนลด" : "Remove"}</span>
            </button>
          </div>
        )}

        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {/* 1. Quick Presets */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {isTh ? "สิทธิ์ส่วนลดด่วนยอดนิยม" : "Quick Presets"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset("PERCENT", 5, "ส่วนลดสมาชิกทั่วไป 5%", "MEMBER5")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>{isTh ? "สมาชิกทั่วไป" : "Standard Member"}</span>
                  <span className="font-mono text-emerald-700 font-black">5%</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  -฿{((subtotal * 5) / 100).toFixed(2)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("PERCENT", 10, "สิทธิ์สมาชิก VIP 10%", "VIP10")}
                className="p-3 rounded-2xl bg-amber-50/60 hover:bg-amber-100 hover:border-amber-300 border border-amber-200 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                  <span>{isTh ? "👑 สมาชิก VIP / Gold" : "👑 VIP / Gold"}</span>
                  <span className="font-mono text-amber-800 font-black">10%</span>
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">
                  -฿{((subtotal * 10) / 100).toFixed(2)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("FIXED", 20, "คูปองส่วนลด ฿20", "COUPON20")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>{isTh ? "คูปองลด 20 บาท" : "฿20 Coupon"}</span>
                  <span className="font-mono text-emerald-700 font-black">฿20</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isTh ? "ท้ายบิลลด ฿20.00" : "Fixed ฿20.00 off"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("FIXED", 50, "คูปองเงินสด ฿50", "COUPON50")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>{isTh ? "คูปองลด 50 บาท" : "฿50 Coupon"}</span>
                  <span className="font-mono text-emerald-700 font-black">฿50</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isTh ? "ท้ายบิลลด ฿50.00" : "Fixed ฿50.00 off"}
                </div>
              </button>
            </div>
          </div>

          {/* 2. Enter Promo Code */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {isTh ? "กรอกรหัสคูปอง / โค้ดโปรโมชัน" : "Enter Promo Code"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isTh ? "เช่น SAVE10, KIPP50" : "e.g., SAVE10, KIPP50"}
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyPromoCode();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyPromoCode}
                className="px-4 py-2.5 rounded-xl bg-[#061a12] hover:bg-[#0c2f21] text-white text-xs font-bold transition cursor-pointer"
              >
                {isTh ? "ใช้โค้ด" : "Apply"}
              </button>
            </div>
          </div>

          {/* 3. Custom Discount Input */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {isTh ? "กำหนดส่วนลดเอง (Custom Discount)" : "Custom Discount"}
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setCustomType("PERCENT")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                  customType === "PERCENT"
                    ? "bg-[#061a12] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Percent className="h-3.5 w-3.5" />
                <span>{isTh ? "เปอร์เซ็นต์ (%)" : "Percent (%)"}</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomType("FIXED")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                  customType === "FIXED"
                    ? "bg-[#061a12] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Banknote className="h-3.5 w-3.5" />
                <span>{isTh ? "จำนวนเงิน (฿)" : "Amount (฿)"}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder={customType === "PERCENT" ? "10" : "50"}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCustom();
                    }
                  }}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  {customType === "PERCENT" ? "%" : "฿"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{isTh ? "ตกลง" : "Set"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
