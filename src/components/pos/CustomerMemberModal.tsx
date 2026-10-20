"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Search,
  UserPlus,
  Award,
  Sparkles,
  CheckCircle,
  X,
  Star,
  Gift,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { CustomerMember, MOCK_CUSTOMERS } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { sounds } from "@/lib/soundEffects";

interface CustomerMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCustomer: CustomerMember | null;
  onSelectCustomer: (customer: CustomerMember | null) => void;
  cartTotal: number;
}

export function CustomerMemberModal({
  isOpen,
  onClose,
  activeCustomer,
  onSelectCustomer,
  cartTotal,
}: CustomerMemberModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [activeTab, setActiveTab] = useState<"SEARCH" | "REGISTER">("SEARCH");
  const [phoneSearch, setPhoneSearch] = useState<string>("");
  const [customerList, setCustomerList] = useState<CustomerMember[]>(MOCK_CUSTOMERS);

  // New registration fields
  const [regPhone, setRegPhone] = useState<string>("");
  const [regName, setRegName] = useState<string>("");
  const [regBirthdate, setRegBirthdate] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter or match customer
  const cleanSearch = phoneSearch.replace(/[^0-9]/g, "");
  const matchedCustomer = customerList.find(
    (c) => c.phone.replace(/[^0-9]/g, "") === cleanSearch
  );

  const potentialEarnPoints = Math.max(1, Math.floor(cartTotal / 10));

  const handleApplyCustomer = (customer: CustomerMember) => {
    sounds.playSuccessChime();
    onSelectCustomer(customer);
    onClose();
  };

  const handleClearCustomer = () => {
    sounds.playErrorBuzzer();
    onSelectCustomer(null);
    onClose();
  };

  const handleRegisterNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regName) return;

    const newCustomer: CustomerMember = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      phone: regPhone.trim(),
      name: regName.trim(),
      tier: "BRONZE",
      pointsBalance: 50, // 50 welcome bonus points
      joinedDate: new Date().toLocaleDateString("en-CA"),
    };

    try {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: regPhone.trim(),
          name: regName.trim(),
          birthDate: regBirthdate || undefined,
        }),
      });
    } catch {
      // Offline fallback
    }

    sounds.playSuccessChime();
    setCustomerList((prev) => [newCustomer, ...prev]);
    onSelectCustomer(newCustomer);
    onClose();
  };

  const handleNumpadPress = (num: string) => {
    sounds.playScanBeep();
    if (activeTab === "SEARCH") {
      if (phoneSearch.length < 10) {
        setPhoneSearch((prev) => prev + num);
      }
    } else {
      if (regPhone.length < 10) {
        setRegPhone((prev) => prev + num);
      }
    }
  };

  const handleBackspace = () => {
    sounds.playScanBeep();
    if (activeTab === "SEARCH") {
      setPhoneSearch((prev) => prev.slice(0, -1));
    } else {
      setRegPhone((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up flex flex-col">
        {/* Header */}
        <div className="bg-[#061a12] text-white px-6 py-4 flex items-center justify-between border-b border-[#0f3424] shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  {isTh ? "สมาชิกลูกค้าสะสมแต้ม (Loyalty Member)" : "Customer Loyalty by Phone"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  F3
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                {isTh
                  ? "ระบุเบอร์โทรศัพท์เพื่อค้นหาหรือลงทะเบียนสมาชิกใหม่สะสมแต้มทันที"
                  : "Search or register customer membership by phone number"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2 py-1 rounded bg-[#0b291d] text-emerald-400 border border-emerald-700/40 font-mono text-[11px] font-bold">
              ESC ปิด
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Active Customer Status Bar (If attached) */}
        {activeCustomer && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isTh ? "บิลนี้กำลังผูกกับ:" : "Current Member:"}</span>
              <strong className="text-slate-900">{activeCustomer.name}</strong>
              <span className="font-mono text-emerald-700">({activeCustomer.phone})</span>
              <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold text-[10px]">
                {activeCustomer.pointsBalance} {isTh ? "แต้ม" : "pts"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearCustomer}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              {isTh ? "ยกเลิกการผูกสมาชิก" : "Detach Member"}
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.playScanBeep();
              setActiveTab("SEARCH");
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === "SEARCH"
                ? "border-emerald-600 text-emerald-800 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>{isTh ? "1. ค้นหาด้วยเบอร์โทรศัพท์" : "1. Search by Phone"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playScanBeep();
              setActiveTab("REGISTER");
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === "REGISTER"
                ? "border-emerald-600 text-emerald-800 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>{isTh ? "2. สมัครสมาชิกใหม่หน้าร้าน" : "2. Quick Register"}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {activeTab === "SEARCH" ? (
            <div className="space-y-5">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? "กรอกเบอร์โทรศัพท์ลูกค้า (10 หลัก):" : "Customer Phone Number (10 digits):"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                  <input
                    type="tel"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    placeholder="เช่น 0891234567"
                    className="w-full h-13 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-300 text-xl font-mono font-black text-slate-900 tracking-wider focus:bg-white focus:border-emerald-600 focus:outline-none transition shadow-inner"
                    autoFocus
                  />
                  {phoneSearch && (
                    <button
                      type="button"
                      onClick={() => setPhoneSearch("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Numpad for Touchscreen POS */}
              <div className="grid grid-cols-6 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNumpadPress(n)}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-mono font-black text-base shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPhoneSearch("")}
                  className="col-span-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="col-span-1 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  ⌫
                </button>
              </div>

              {/* Search Result Card */}
              {matchedCustomer ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-2 border-emerald-500 shadow-md animate-scale-up space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                        {matchedCustomer.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">
                            {matchedCustomer.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              matchedCustomer.tier === "GOLD"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : matchedCustomer.tier === "SILVER"
                                ? "bg-slate-200 text-slate-800 border border-slate-300"
                                : "bg-orange-100 text-orange-900 border border-orange-200"
                            }`}
                          >
                            ★ {matchedCustomer.tier} TIER
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                          <span>{matchedCustomer.phone}</span>
                          <span>•</span>
                          <span>{isTh ? "เป็นสมาชิกตั้งแต่:" : "Member since:"} {matchedCustomer.joinedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {isTh ? "แต้มสะสมปัจจุบัน" : "Points Balance"}
                      </div>
                      <div className="text-xl font-black text-emerald-700 font-mono">
                        {matchedCustomer.pointsBalance} {isTh ? "แต้ม" : "pts"}
                      </div>
                    </div>
                  </div>

                  {/* Points Earn Preview */}
                  <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <span>
                        {isTh
                          ? `ยอดบิล ฿${cartTotal.toFixed(2)} รับเพิ่มทันที:`
                          : `Cart ฿${cartTotal.toFixed(2)} will earn:`}
                      </span>
                    </div>
                    <span className="font-mono font-black text-emerald-800 text-sm">
                      +{potentialEarnPoints} {isTh ? "แต้ม" : "Points"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyCustomer(matchedCustomer)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{isTh ? "ยืนยันเลือกสมาชิกลูกค้านี้ [Enter]" : "Apply Member to Cart [Enter]"}</span>
                  </button>
                </div>
              ) : phoneSearch.length >= 9 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2 animate-fade-in">
                  <div className="text-xs font-bold text-amber-900">
                    {isTh ? `ไม่พบข้อมูลสมาชิกเบอร์ "${phoneSearch}"` : `No member found for "${phoneSearch}"`}
                  </div>
                  <p className="text-[11px] text-amber-800/80">
                    {isTh
                      ? "ลูกค้ายังไม่ได้เป็นสมาชิก สามารถกดสมัครสมาชิกด่วนได้ทันที ใช้เวลาไม่ถึง 10 วินาที"
                      : "Customer is not registered yet. Click below for instant quick registration."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegPhone(phoneSearch);
                      setActiveTab("REGISTER");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{isTh ? "สมัครสมาชิกใหม่ด้วยเบอร์นี้ทันที" : "Register with this number"}</span>
                  </button>
                </div>
              ) : (
                /* Demo Quick Customers List */
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {isTh ? "ตัวอย่างสมาชิกในระบบ (คลิกเพื่อทดสอบ):" : "Sample Members in Store:"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {customerList.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setPhoneSearch(c.phone);
                          handleApplyCustomer(c);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-left transition cursor-pointer"
                      >
                        <div className="font-bold text-xs text-slate-900 truncate">{c.name}</div>
                        <div className="font-mono text-[11px] text-emerald-700 font-semibold">{c.phone}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.pointsBalance} แต้ม • {c.tier}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Register New Customer Member */
            <form onSubmit={handleRegisterNewCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "เบอร์โทรศัพท์มือถือลูกค้า * (10 หลัก)" : "Mobile Phone Number *"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "ชื่อ-นามสกุล หรือ ชื่อเรียกของลูกค้า *" : "Customer Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="เช่น คุณกิตติศักดิ์ หรือ พี่สมชาย"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "วันเดือนปีเกิด (ไม่บังคับ - สำหรับรับสิทธิ์วันเกิด)" : "Birthday (Optional for birthday perk)"}
                </label>
                <input
                  type="date"
                  value={regBirthdate}
                  onChange={(e) => setRegBirthdate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-700 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <Gift className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {isTh
                    ? "โบนัสสมัครสมาชิกใหม่: รับฟรี 10 แต้มต้อนรับทันที พร้อมสะสมยอดซื้อของบิลนี้"
                    : "New Member Bonus: +10 Welcome Points instantly credited"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("SEARCH")}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  {isTh ? "ย้อนกลับ" : "Back"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isTh ? "บันทึกและใช้กับบิลนี้ทันที" : "Register & Apply to Cart"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
