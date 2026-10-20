"use client";

import { useState } from "react";
import { Lock, UserCheck, Delete, AlertCircle, ShieldAlert, Store, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { MOCK_STAFF, StaffMember } from "@/data/mockData";

interface LockScreenModalProps {
  isOpen: boolean;
  onUnlock: (staff: StaffMember) => void;
}

export function LockScreenModal({ isOpen, onUnlock }: LockScreenModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [selectedStaff, setSelectedStaff] = useState<StaffMember>(MOCK_STAFF[0]);
  const [pin, setPin] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (isLockedOut) return;
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg(null);

      // Auto submit if 4 digits entered and matches
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isLockedOut) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    if (isLockedOut) return;
    setPin("");
    setErrorMsg(null);
  };

  const verifyPin = async (inputPin: string) => {
    try {
      const res = await fetch("/api/auth/pos-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedStaff.id,
          pin: inputPin,
        }),
      });

      if (res.ok) {
        setPin("");
        setErrorMsg(null);
        setFailedAttempts(0);
        onUnlock(selectedStaff);
        return;
      }
    } catch {
      // Offline fallback
    }

    if (inputPin === selectedStaff.pin) {
      setPin("");
      setErrorMsg(null);
      setFailedAttempts(0);
      onUnlock(selectedStaff);
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      setPin("");
      if (nextFailed >= 5) {
        setIsLockedOut(true);
        setErrorMsg(isTh ? "ใส่ PIN ผิดเกิน 5 ครั้ง ระบบถูกล็อคชั่วคราว 5 นาที" : "5 failed attempts. Locked out for 5 minutes.");
        setTimeout(() => {
          setIsLockedOut(false);
          setFailedAttempts(0);
          setErrorMsg(null);
        }, 15000); // 15s in demo simulation
      } else {
        setErrorMsg(
          isTh
            ? `รหัส PIN ไม่ถูกต้อง (ผิด ${nextFailed}/5 ครั้ง)`
            : `Incorrect PIN (${nextFailed}/5 attempts)`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-md bg-[#071d14] border border-[#144733] rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center">
        {/* Header Store Brand */}
        <div className="flex items-center gap-2 mb-4 text-emerald-400">
          <Store className="h-5 w-5" />
          <span className="font-mono text-xs tracking-wider uppercase font-bold">
            KIPP MARKET • POS TERMINAL #01
          </span>
        </div>

        <div className="h-14 w-14 rounded-2xl bg-[#0b291d] border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-black tracking-tight text-white">
          {isTh ? "ล็อคหน้าจอพนักงาน POS" : "POS Terminal Lock Screen"}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-5 text-center">
          {isTh
            ? "เลือกชื่อพนักงานประจำกะ และกดรหัส PIN 4 หลัก เพื่อปลดล็อค"
            : "Select active staff member and enter 4-digit PIN to unlock"}
        </p>

        {/* Staff Selector Pills */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6">
          {MOCK_STAFF.map((staff) => {
            const isSelected = selectedStaff.id === staff.id;
            return (
              <button
                key={staff.id}
                type="button"
                onClick={() => {
                  setSelectedStaff(staff);
                  setPin("");
                  setErrorMsg(null);
                }}
                className={`p-2 rounded-2xl border flex flex-col items-center text-center transition cursor-pointer ${
                  isSelected
                    ? "bg-[#0c3926] border-emerald-400 shadow-md ring-1 ring-emerald-400/50"
                    : "bg-[#092218] border-[#103b29] hover:border-emerald-700/60 text-slate-400"
                }`}
              >
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-10 h-10 rounded-full object-cover mb-1.5 border border-emerald-500/40"
                />
                <span className="text-[11px] font-bold text-white truncate w-full">
                  {isTh ? staff.name.split(" ")[0] : staff.nameEn}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono font-medium">
                  {staff.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* PIN Indicators Display */}
        <div className="flex items-center justify-center gap-3 mb-4 h-8">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? "bg-[#bef264] scale-110 shadow-lg shadow-lime-400/40"
                    : "border-2 border-emerald-800/70 bg-[#092418]"
                }`}
              />
            );
          })}
        </div>

        {/* Error / Lockout Message */}
        <div className="h-6 flex items-center justify-center text-center mb-2">
          {errorMsg && (
            <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </span>
          )}
        </div>

        {/* Numeric Keypad (Numpad) */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-2.5 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isLockedOut}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-[#0b291d] hover:bg-[#123e2d] border border-[#144733] text-xl font-bold font-mono text-white active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isLockedOut || pin.length === 0}
            onClick={handleClear}
            className="h-14 rounded-2xl bg-[#092218] hover:bg-[#0e3324] border border-[#103a28] text-xs font-bold text-slate-400 active:scale-95 transition disabled:opacity-40 cursor-pointer"
          >
            {isTh ? "ล้าง" : "CLEAR"}
          </button>
          <button
            type="button"
            disabled={isLockedOut}
            onClick={() => handleKeyPress("0")}
            className="h-14 rounded-2xl bg-[#0b291d] hover:bg-[#123e2d] border border-[#144733] text-xl font-bold font-mono text-white active:scale-95 transition disabled:opacity-40 shadow-sm cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            disabled={isLockedOut || pin.length === 0}
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-[#092218] hover:bg-[#0e3324] border border-[#103a28] flex items-center justify-center text-slate-300 active:scale-95 transition disabled:opacity-40 cursor-pointer"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Demo PIN Hint */}
        <div className="text-[10px] text-slate-500 font-mono text-center">
          {isTh
            ? `รหัสทดสอบ: ${selectedStaff.nameEn} คือ PIN: [${selectedStaff.pin}]`
            : `Demo PIN: ${selectedStaff.nameEn} uses [${selectedStaff.pin}]`}
        </div>
      </div>
    </div>
  );
}
