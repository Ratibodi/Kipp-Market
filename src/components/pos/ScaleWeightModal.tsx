"use client";

import { useState } from "react";
import { Scale, Delete, CheckCircle, X, Barcode, Calculator, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface WeightProduct {
  id: string;
  nameTh: string;
  nameEn: string;
  pricePerKg: number;
  plu: string;
  imageUrl: string;
}

export const SAMPLE_WEIGHT_PRODUCTS: WeightProduct[] = [
  {
    id: "w-pork",
    nameTh: "หมูเนื้อแดงหั่นชิ้น (สด)",
    nameEn: "Fresh Sliced Pork Meat",
    pricePerKg: 180.0,
    plu: "01234",
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "w-chicken",
    nameTh: "อกไก่สดปลอดสาร",
    nameEn: "Organic Chicken Breast",
    pricePerKg: 110.0,
    plu: "01235",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "w-beef",
    nameTh: "เนื้อวัวบดพรีเมียม",
    nameEn: "Premium Minced Beef",
    pricePerKg: 320.0,
    plu: "01236",
    imageUrl: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=160&h=160&q=80",
  },
];

interface ScaleWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWeightItem: (item: {
    id: string;
    name: string;
    unitPrice: number;
    weightKg: number;
    totalAmount: number;
    barcode: string;
  }) => void;
}

export function ScaleWeightModal({
  isOpen,
  onClose,
  onAddWeightItem,
}: ScaleWeightModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [selectedProduct, setSelectedProduct] = useState<WeightProduct>(
    SAMPLE_WEIGHT_PRODUCTS[0]
  );
  const [inputMode, setInputMode] = useState<"BY_WEIGHT" | "BY_BAHT">("BY_WEIGHT");
  const [inputValue, setInputValue] = useState<string>("0.350");

  if (!isOpen) return null;

  // Calculation
  let calculatedWeight = 0;
  let calculatedPrice = 0;

  if (inputMode === "BY_WEIGHT") {
    calculatedWeight = parseFloat(inputValue) || 0;
    calculatedPrice = Math.round(calculatedWeight * selectedProduct.pricePerKg * 100) / 100;
  } else {
    calculatedPrice = parseFloat(inputValue) || 0;
    calculatedWeight =
      selectedProduct.pricePerKg > 0
        ? Math.round((calculatedPrice / selectedProduct.pricePerKg) * 1000) / 1000
        : 0;
  }

  const handleNumpad = (char: string) => {
    if (char === "." && inputValue.includes(".")) return;
    if (inputValue === "0" && char !== ".") {
      setInputValue(char);
    } else {
      setInputValue((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handleClear = () => {
    setInputValue("0");
  };

  const handlePreset = (kg: number) => {
    setInputMode("BY_WEIGHT");
    setInputValue(kg.toFixed(3));
  };

  const handleSimulateScaleBarcode = () => {
    // Generate EAN-13 Scale Barcode: 21 (Prefix) + 01234 (PLU) + 00350 (350g) + 4 (Checksum)
    const weightGrams = Math.round(calculatedWeight * 1000)
      .toString()
      .padStart(5, "0");
    const barcodeStr = `21${selectedProduct.plu}${weightGrams}4`;

    onAddWeightItem({
      id: `w-${Date.now()}`,
      name: `${isTh ? selectedProduct.nameTh : selectedProduct.nameEn} (${calculatedWeight.toFixed(3)} kg)`,
      unitPrice: selectedProduct.pricePerKg,
      weightKg: calculatedWeight,
      totalAmount: calculatedPrice,
      barcode: barcodeStr,
    });
    onClose();
  };

  const handleConfirm = () => {
    if (calculatedWeight <= 0) return;
    onAddWeightItem({
      id: `w-${Date.now()}`,
      name: `${isTh ? selectedProduct.nameTh : selectedProduct.nameEn} (${calculatedWeight.toFixed(3)} kg)`,
      unitPrice: selectedProduct.pricePerKg,
      weightKg: calculatedWeight,
      totalAmount: calculatedPrice,
      barcode: `21${selectedProduct.plu}${Math.round(calculatedWeight * 1000).toString().padStart(5, "0")}4`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans select-none">
      <div className="w-full max-w-2xl bg-[#071d14] border border-[#144733] rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#092218] border-b border-[#123e2c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-lime-500/20 border border-lime-400/40 flex items-center justify-center text-[#bef264]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {isTh ? "ชั่งน้ำหนักสินค้า & บาร์โค้ดตาชั่ง [F2]" : "Weighing Scale & Scale Barcode [F2]"}
              </h2>
              <div className="text-xs text-slate-400">
                {isTh
                  ? "รองรับเนื้อสัตว์ อาหารสด และบาร์โค้ดสติกเกอร์ EAN-13 Prefix 21/22"
                  : "Supports fresh meat, poultry, produce, and EAN-13 scale barcodes"}
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Product Selection & Live Display */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-300">
              {isTh ? "1. เลือกสินค้าชั่งน้ำหนัก" : "1. Select Weighable Product"}
            </div>

            <div className="space-y-2">
              {SAMPLE_WEIGHT_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className={`w-full p-2.5 rounded-2xl border flex items-center gap-3 text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-[#0c3926] border-[#bef264] shadow-md ring-1 ring-[#bef264]/40"
                        : "bg-[#082217] border-[#0f3826] hover:border-emerald-700/60"
                    }`}
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.nameEn}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">
                        {isTh ? prod.nameTh : prod.nameEn}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        ฿{prod.pricePerKg.toFixed(2)} / kg • PLU: {prod.plu}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Scale Weight / Total Display */}
            <div className="p-4 rounded-2xl bg-[#051710] border border-emerald-500/30 space-y-3">
              <div className="flex justify-between items-baseline text-xs text-slate-400">
                <span>{isTh ? "น้ำหนักสุทธิ (กก.):" : "Net Weight (kg):"}</span>
                <span className="text-2xl font-black font-mono text-[#bef264]">
                  {calculatedWeight.toFixed(3)} <span className="text-xs text-slate-400">kg</span>
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-slate-400 border-t border-[#0d2e20] pt-2">
                <span>{isTh ? "ราคารวมสุทธิ:" : "Calculated Amount:"}</span>
                <span className="text-xl font-black font-mono text-white">
                  ฿{calculatedPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[0.25, 0.5, 1.0, 2.0].map((kg) => (
                <button
                  key={kg}
                  type="button"
                  onClick={() => handlePreset(kg)}
                  className="py-1.5 rounded-xl bg-[#0a2c1e] hover:bg-[#11422f] border border-emerald-700/40 text-[11px] font-mono font-bold text-emerald-300 transition cursor-pointer text-center"
                >
                  {kg} kg
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Mode Toggle & Numeric Keypad */}
          <div className="flex flex-col justify-between space-y-4">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#061911] border border-[#0f3525] text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setInputMode("BY_WEIGHT");
                  setInputValue("0.350");
                }}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  inputMode === "BY_WEIGHT"
                    ? "bg-[#bef264] text-[#061a12] shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⚖️ {isTh ? "กรอกน้ำหนัก (กก.)" : "By Weight (kg)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode("BY_BAHT");
                  setInputValue("50");
                }}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  inputMode === "BY_BAHT"
                    ? "bg-[#bef264] text-[#061a12] shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                💵 {isTh ? "กรอกตามงบ (บาท)" : "By Budget (THB)"}
              </button>
            </div>

            {/* Input Value Display */}
            <div className="h-12 px-4 rounded-2xl bg-[#051710] border border-emerald-600/40 flex items-center justify-between font-mono">
              <span className="text-xs text-slate-400">
                {inputMode === "BY_WEIGHT" ? (isTh ? "ระบุน้ำหนัก:" : "Weight:") : (isTh ? "ระบุเงิน:" : "Budget:")}
              </span>
              <span className="text-xl font-bold text-white">
                {inputValue} {inputMode === "BY_WEIGHT" ? "kg" : "฿"}
              </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumpad(n)}
                  className="h-11 rounded-xl bg-[#09251a] hover:bg-[#113a29] border border-[#12422e] text-base font-bold font-mono text-white transition active:scale-95 cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleNumpad(".")}
                className="h-11 rounded-xl bg-[#09251a] hover:bg-[#113a29] border border-[#12422e] text-lg font-bold font-mono text-white transition active:scale-95 cursor-pointer"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleNumpad("0")}
                className="h-11 rounded-xl bg-[#09251a] hover:bg-[#113a29] border border-[#12422e] text-base font-bold font-mono text-white transition active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-11 rounded-xl bg-[#09251a] hover:bg-[#113a29] border border-[#12422e] flex items-center justify-center text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
              >
                <Delete className="h-4 w-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-sm transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                {isTh
                  ? `เพิ่มลงบิล ฿${calculatedPrice.toFixed(2)} (${calculatedWeight.toFixed(3)} กก.)`
                  : `Add to Cart ฿${calculatedPrice.toFixed(2)}`}
              </button>

              <button
                type="button"
                onClick={handleSimulateScaleBarcode}
                className="w-full py-2.5 rounded-xl bg-[#0b2b1d] hover:bg-[#12402c] border border-emerald-600/40 text-xs font-bold text-emerald-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Barcode className="h-4 w-4" />
                {isTh ? "จำลองสแกนบาร์โค้ดตาชั่ง EAN-13" : "Simulate EAN-13 Scale Barcode"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
