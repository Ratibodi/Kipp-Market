"use client";

import { useState } from "react";
import {
  Settings,
  QrCode,
  Scale,
  Monitor,
  Store,
  CheckCircle,
  Copy,
  Save,
  Key,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [activeTab, setActiveTab] = useState<"PROMPTPAY" | "SCALE" | "TERMINALS">("PROMPTPAY");

  // PromptPay Settings
  const [promptPayType, setPromptPayType] = useState<string>("TAX_ID");
  const [promptPayId, setPromptPayId] = useState<string>("0105558194821");
  const [accountName, setAccountName] = useState<string>("KIPP MARKET CO., LTD.");
  const [isTestQrGenerated, setIsTestQrGenerated] = useState<boolean>(false);

  // Scale Settings
  const [scaleEnabled, setScaleEnabled] = useState<boolean>(true);
  const [scalePrefix, setScalePrefix] = useState<string>("21");
  const [scalePluLength, setScalePluLength] = useState<string>("5");
  const [scaleValueType, setScaleValueType] = useState<string>("WEIGHT_G");

  // Save feedback
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader />

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Settings className="h-6 w-6 text-emerald-600" />
                <span>{isTh ? "ตั้งค่าระบบร้าน & การรับเงิน" : "Store & Payment Settings"}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isTh
                  ? "กำหนดค่า PromptPay QR, สเปกบาร์โค้ดตาชั่ง EAN-13 และการลงทะเบียนเครื่อง POS"
                  : "Configure PromptPay QR parameters, EAN-13 scale prefixes, and terminal pairing tokens"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isTh ? "บันทึกการตั้งค่า" : "Save Changes"}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{isTh ? "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว" : "Settings saved successfully"}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("PROMPTPAY")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === "PROMPTPAY"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>{isTh ? "1. ตั้งค่า PromptPay QR" : "1. PromptPay QR"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SCALE")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === "SCALE"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>{isTh ? "2. บาร์โค้ดตาชั่ง (Scale EAN-13)" : "2. Scale Barcode"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TERMINALS")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === "TERMINALS"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>{isTh ? "3. เครื่อง POS & Device Token" : "3. Terminals & Pairing"}</span>
            </button>
          </div>

          {/* TAB 1: PROMPTPAY SETTINGS */}
          {activeTab === "PROMPTPAY" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isTh ? "ประเภทบัญชี PromptPay *" : "PromptPay Identifier Type *"}
                    </label>
                    <select
                      value={promptPayType}
                      onChange={(e) => setPromptPayType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="TAX_ID">{isTh ? "เลขประจำตัวผู้เสียภาษี (Tax ID 13 หลัก)" : "Tax ID (13 digits)"}</option>
                      <option value="PHONE">{isTh ? "เบอร์โทรศัพท์มือถือ (Phone Number)" : "Phone Number"}</option>
                      <option value="NATIONAL_ID">{isTh ? "เลขบัตรประชาชน (National ID 13 หลัก)" : "Citizen National ID"}</option>
                      <option value="EWALLET">{isTh ? "e-Wallet ID (15 หลัก)" : "e-Wallet ID (15 digits)"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isTh ? "หมายเลข PromptPay ID *" : "PromptPay ID Number *"}
                    </label>
                    <input
                      type="text"
                      value={promptPayId}
                      onChange={(e) => setPromptPayId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isTh ? "ชื่อบัญชีร้านค้าที่แสดงตอนลูกค้าสแกน *" : "Registered Account Name *"}
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTestQrGenerated(true)}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-[#bef264]" />
                    <span>{isTh ? "ทดสอบสร้าง QR PromptPay 1.00 บาท" : "Generate Test 1.00 THB QR"}</span>
                  </button>
                </div>

                {/* Right: EMVCo QR Preview */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-300 shadow-sm flex flex-col items-center justify-center mb-3">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021229370016A0000006770101110113010555819482154041.005802TH53037646304ABCD"
                      alt="PromptPay QR Test"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-xs font-bold text-slate-900">{accountName}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {promptPayType}: {promptPayId}
                  </div>
                  <div className="text-xs font-black font-mono text-emerald-700 mt-1">
                    ฿1.00 THB • EMVCo Payload OK
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCALE BARCODE SETTINGS */}
          {activeTab === "SCALE" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="p-4 rounded-2xl bg-[#061a12] border border-[#144733] text-slate-200 text-xs">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  <span>โครงสร้างบาร์โค้ดสติกเกอร์ตาชั่ง (Scale EAN-13 Specification)</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300">
                  [Prefix 2 หลัก: {scalePrefix}] [PLU {scalePluLength} หลัก: 01234] [ค่า {scaleValueType === "WEIGHT_G" ? "น้ำหนัก (กรัม)" : "ราคา (สตางค์)"} 5 หลัก: 00350] [Check Digit: C]
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "Prefix ตาชั่ง (ปกติ 20 - 29)" : "Scale Barcode Prefix"}
                  </label>
                  <input
                    type="text"
                    value={scalePrefix}
                    onChange={(e) => setScalePrefix(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ความยาวรหัสสินค้า (PLU Length)" : "PLU Digit Length"}
                  </label>
                  <select
                    value={scalePluLength}
                    onChange={(e) => setScalePluLength(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="4">4 หลัก (4 digits)</option>
                    <option value="5">5 หลัก (5 digits - มาตรฐานค้าปลีก)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ชนิดค่าที่ฝังในบาร์โค้ด (Embedded Value Type)" : "Embedded Value Type"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setScaleValueType("WEIGHT_G")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        scaleValueType === "WEIGHT_G"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="text-xs">{isTh ? "⚖️ ฝังน้ำหนัก (Weight in Grams)" : "Weight in Grams"}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">00350 = 0.350 กิโลกรัม</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScaleValueType("PRICE_SATANG")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        scaleValueType === "PRICE_SATANG"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="text-xs">{isTh ? "💵 ฝังราคา (Price in Satang)" : "Price in Satang"}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">05000 = 50.00 บาท</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMINALS & PAIRING */}
          {activeTab === "TERMINALS" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isTh ? "เครื่องขายหน้าร้านที่ลงทะเบียนไว้ (Registered Terminals)" : "Registered POS Terminals"}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {isTh ? "สาขาสุขุมวิท 24 (#BKK01)" : "Sukhumvit 24 Branch (#BKK01)"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(isTh ? "สร้าง Pairing Token ใหม่สำหรับเครื่อง POS: TKN-BKK01-9X82F10A" : "Generated Pairing Token")}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="h-4 w-4 text-[#bef264]" />
                  <span>{isTh ? "+ ลงทะเบียนเครื่องใหม่" : "+ Pair New Device"}</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      T01
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Terminal 01 (Main Cashier)</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Device Token Hash: e3b0c442...98b0 • Last Seen: Just now
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ● ONLINE
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      T02
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Terminal 02 (Fresh Bar & Meat)</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Device Token Hash: 7b8f9a21...120a • Last Seen: 15m ago
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                    STANDBY
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
