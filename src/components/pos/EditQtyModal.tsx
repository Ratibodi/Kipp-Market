"use client";

import { useState, useEffect, useRef } from "react";
import { X, Hash, Check, Plus, Minus } from "lucide-react";
import { CartItem } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

interface EditQtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: CartItem | null;
  onConfirmQty: (itemId: string, newQty: number) => void;
}

export function EditQtyModal({
  isOpen,
  onClose,
  targetItem,
  onConfirmQty,
}: EditQtyModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [qtyString, setQtyString] = useState<string>("1");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && targetItem) {
      setQtyString(targetItem.qty.toString());
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 80);
    }
  }, [isOpen, targetItem]);

  if (!isOpen || !targetItem) return null;

  const currentQtyNum = parseInt(qtyString, 10) || 0;
  const unitPrice = targetItem.unitPrice;
  const projectedTotal = currentQtyNum * unitPrice;

  const handleApply = (newQty: number) => {
    const validQty = Math.max(1, Math.min(9999, Math.floor(newQty)));
    onConfirmQty(targetItem.id, validQty);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply(currentQtyNum);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleNumpadClick = (val: string) => {
    if (val === "C") {
      setQtyString("1");
    } else if (val === "BACK") {
      setQtyString((prev) => (prev.length > 1 ? prev.slice(0, -1) : "1"));
    } else {
      setQtyString((prev) => {
        if (prev === "0" || prev === "1") return val;
        if (prev.length >= 4) return prev;
        return prev + val;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#071912] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                <span>{isTh ? "เปลี่ยนจำนวนสินค้า" : "Change Quantity"}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono text-[10px]">
                  [F4]
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium truncate max-w-[200px]">
                {targetItem.name}
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

        {/* Item Summary Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <img
            src={targetItem.imageUrl}
            alt={targetItem.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">
              {targetItem.name}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              ฿{unitPrice.toFixed(2)} / {isTh ? "ชิ้น" : "unit"}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              {isTh ? "ยอดรวมรายการ" : "Line Total"}
            </span>
            <span className="text-sm font-black font-mono text-emerald-700">
              ฿{projectedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Big Qty Input & Quick Buttons */}
        <div className="p-5 flex flex-col gap-4">
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {isTh ? "ระบุจำนวนชิ้น (กด Enter เพื่อตกลง)" : "Enter Quantity (Press Enter)"}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQtyString((prev) => Math.max(1, (parseInt(prev, 10) || 1) - 1).toString())}
                className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center transition border border-slate-300 active:scale-95"
              >
                <Minus className="h-5 w-5" />
              </button>

              <input
                ref={inputRef}
                type="number"
                min="1"
                max="9999"
                value={qtyString}
                onChange={(e) => setQtyString(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-12 rounded-2xl bg-slate-50 border-2 border-emerald-500 text-center text-2xl font-black font-mono text-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />

              <button
                type="button"
                onClick={() => setQtyString((prev) => ((parseInt(prev, 10) || 0) + 1).toString())}
                className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center transition border border-slate-300 active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Preset Increments */}
          <div className="grid grid-cols-4 gap-2">
            {[6, 12, 24, 48].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQtyString(preset.toString())}
                className="py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 font-bold font-mono text-xs transition"
              >
                +{preset} {isTh ? "ชิ้น" : "pcs"}
              </button>
            ))}
          </div>

          {/* On-screen Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "BACK"].map((keyVal) => (
              <button
                key={keyVal}
                type="button"
                onClick={() => handleNumpadClick(keyVal)}
                className={`h-11 rounded-xl font-mono font-black text-sm transition active:scale-95 flex items-center justify-center ${
                  keyVal === "C"
                    ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    : keyVal === "BACK"
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
                }`}
              >
                {keyVal === "BACK" ? "⌫" : keyVal}
              </button>
            ))}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => handleApply(currentQtyNum)}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Check className="h-5 w-5" />
            <span>{isTh ? `ยืนยันจำนวน (${currentQtyNum} ชิ้น)` : `Confirm Quantity (${currentQtyNum} pcs)`}</span>
            <span className="font-mono text-xs opacity-75">[Enter]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
