"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Store,
  Lock,
  ArrowRight,
  KeyRound,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Users,
  Delete,
  Check,
  Building2,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";

interface StaffOption {
  id: string;
  displayName: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  isActive: boolean;
  phone?: string;
}

function LoginForm() {
  const { language } = useLanguage();
  const isTh = language === "th";
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const initialMode = searchParams.get("mode") === "pos" ? "CASHIER_PIN" : "OWNER_PASSWORD";

  const [loginMode, setLoginMode] = useState<"OWNER_PASSWORD" | "CASHIER_PIN">(initialMode);

  // Tab 1: Owner / Backoffice Password State
  const [loginPhone, setLoginPhone] = useState<string>("081-999-8841");
  const [password, setPassword] = useState<string>("kipp1234");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Tab 2: Cashier PIN State
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffOption | null>(null);
  const [pin, setPin] = useState<string>("");
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);

  // General State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Load staff options for PIN login
  useEffect(() => {
    async function fetchStaff() {
      setIsLoadingStaff(true);
      try {
        const res = await fetch("/api/staff");
        if (res.ok) {
          const data = await res.json();
          if (data?.staff && Array.isArray(data.staff)) {
            const activeOnly = data.staff.filter((s: StaffOption) => s.isActive);
            setStaffList(activeOnly);
            if (activeOnly.length > 0) {
              setSelectedStaff(activeOnly[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load staff for PIN login:", err);
      } finally {
        setIsLoadingStaff(false);
      }
    }
    fetchStaff();
  }, []);

  // Handle Tab 1: Owner Phone + Password Submit
  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: loginPhone,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || (isTh ? "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" : "Invalid phone or password"));
      } else {
        setLoginSuccess(true);
        setSuccessMessage(isTh ? "ยินดีต้อนรับเจ้าของร้าน กำลังพาเข้าสู่ระบบ..." : "Welcome Store Owner! Redirecting...");
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 300);
      }
    } catch {
      window.location.href = callbackUrl;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Tab 2: Cashier PIN Verification
  const verifyCashierPin = async (inputPin: string) => {
    if (!selectedStaff) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/pos-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedStaff.id,
          pin: inputPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || (isTh ? "รหัส PIN ไม่ถูกต้อง" : "Incorrect PIN"));
        setPin("");
      } else {
        setLoginSuccess(true);
        setSuccessMessage(isTh ? `ยินดีต้อนรับ ${selectedStaff.displayName} กำลังเปิดหน้าจอ POS...` : `Welcome ${selectedStaff.displayName}! Opening POS...`);
        setTimeout(() => {
          window.location.href = "/pos";
        }, 400);
      }
    } catch {
      window.location.href = "/pos";
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadPress = (num: string) => {
    if (isLoading || loginSuccess) return;
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMessage(null);
      if (nextPin.length === 4) {
        verifyCashierPin(nextPin);
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (isLoading || loginSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleKeypadClear = () => {
    if (isLoading || loginSuccess) return;
    setPin("");
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md bg-[#082217] border border-[#143d2c] rounded-3xl p-7 shadow-2xl space-y-5">
      {/* Top Header Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[#051710] rounded-2xl border border-emerald-900/50 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setLoginMode("OWNER_PASSWORD");
            setErrorMessage(null);
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            loginMode === "OWNER_PASSWORD"
              ? "bg-[#84cc16] text-[#061a12] shadow-sm font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>{isTh ? "เจ้าของร้าน / หลังร้าน" : "Owner Login"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setLoginMode("CASHIER_PIN");
            setErrorMessage(null);
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            loginMode === "CASHIER_PIN"
              ? "bg-[#84cc16] text-[#061a12] shadow-sm font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>{isTh ? "แคชเชียร์ (กด PIN)" : "Cashier PIN"}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs text-center font-medium animate-shake">
          {errorMessage}
        </div>
      )}

      {loginSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* MODE 1: OWNER PHONE + PASSWORD */}
      {loginMode === "OWNER_PASSWORD" && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-black text-white tracking-tight">
              {isTh ? "เข้าสู่ระบบร้านค้า (หลังร้าน)" : "Store Backoffice Login"}
            </h1>
            <p className="text-xs text-slate-400">
              {isTh
                ? "สำหรับเจ้าของร้านและผู้จัดการสาขา (เข้าด้วยเบอร์โทรศัพท์)"
                : "For Store Owners and General Managers (Mobile Login)"}
            </p>
          </div>

          <form onSubmit={handleOwnerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                {isTh ? "เบอร์โทรศัพท์มือถือที่ลงทะเบียน *" : "Registered Mobile Phone Number *"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="tel"
                  required
                  disabled={isLoading || loginSuccess}
                  placeholder="081-234-5678"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#051710] border border-emerald-700/40 text-slate-200 font-mono focus:outline-none focus:border-emerald-400 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                {isTh ? "รหัสผ่าน *" : "Password *"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  disabled={isLoading || loginSuccess}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#051710] border border-emerald-700/40 text-slate-200 focus:outline-none focus:border-emerald-400 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="rounded-xl bg-[#051710]/70 border border-emerald-900/40 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading || loginSuccess}
                    className="w-4 h-4 rounded border-emerald-600 bg-[#082217] text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-[#84cc16]"
                  />
                  <span className="font-bold text-xs text-white">
                    {isTh ? "จดจำการเข้าสู่ระบบบนเครื่องนี้" : "Remember login on this device"}
                  </span>
                </label>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {isTh ? "30 วัน" : "30 days"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6.5 leading-tight">
                {isTh
                  ? "เปิดไว้เพื่อให้เจ้าของร้านเข้าหน้าร้านได้ทันทีโดยไม่ต้องใส่รหัสผ่านซ้ำ"
                  : "Allows store owner to enter store immediately without re-entering password"}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-sm transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <>
                  <span>{isTh ? "เข้าสู่ระบบร้านค้า (หลังร้าน)" : "Login to Store"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* MODE 2: CASHIER QUICK PIN LOGIN */}
      {loginMode === "CASHIER_PIN" && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <KeyRound className="h-5 w-5 text-[#bef264]" />
              <span>{isTh ? "เข้าเครื่องคิดเงิน POS (ด้วย PIN)" : "Cashier POS Login"}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isTh ? "แตะเลือกชื่อพนักงาน แล้วกด PIN 4 หลักประจำตัว" : "Select your name and enter your 4-digit PIN"}
            </p>
          </div>

          {/* Staff Selector Chips */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300">
              {isTh ? "เลือกชื่อพนักงานแคชเชียร์:" : "Select Cashier:"}
            </label>
            {isLoadingStaff ? (
              <div className="py-2 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังโหลดรายชื่อพนักงาน...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                {staffList.map((staff) => {
                  const isSelected = selectedStaff?.id === staff.id;
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaff(staff);
                        setPin("");
                        setErrorMessage(null);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-400 text-white"
                          : "bg-[#051710] border-emerald-900/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected ? "bg-emerald-400 text-[#061a12]" : "bg-[#0e3324] text-emerald-300"
                        }`}
                      >
                        {staff.displayName.slice(0, 2)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate leading-tight">{staff.displayName}</div>
                        <div className="text-[9px] text-emerald-400/80 font-mono">
                          {staff.role === "MANAGER" ? "ผู้จัดการ" : "แคชเชียร์"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4-Dot PIN Indicator Display */}
          <div className="py-2 bg-[#051710] rounded-2xl border border-emerald-900/50 flex flex-col items-center justify-center gap-1.5">
            <div className="text-[10px] text-slate-400 font-medium">
              {selectedStaff ? `รหัส PIN ของ: ${selectedStaff.displayName}` : "กด PIN 4 หลัก"}
            </div>
            <div className="flex gap-4">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    pin.length > idx
                      ? "bg-[#bef264] shadow-sm shadow-lime-400/50 scale-110"
                      : "border-2 border-emerald-800 bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* POS Keypad */}
          <div className="grid grid-cols-3 gap-2 text-base font-bold font-mono">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                disabled={isLoading || loginSuccess}
                className="h-11 rounded-xl bg-[#0b291d] hover:bg-[#12422f] active:scale-95 text-white transition border border-emerald-800/40 flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeypadClear}
              disabled={isLoading || loginSuccess}
              className="h-11 rounded-xl bg-[#081f16] hover:bg-[#123829] active:scale-95 text-rose-400 text-xs font-sans font-bold transition border border-emerald-900/40 flex items-center justify-center cursor-pointer"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              disabled={isLoading || loginSuccess}
              className="h-11 rounded-xl bg-[#0b291d] hover:bg-[#12422f] active:scale-95 text-white transition border border-emerald-800/40 flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              disabled={isLoading || loginSuccess}
              className="h-11 rounded-xl bg-[#081f16] hover:bg-[#123829] active:scale-95 text-slate-300 transition border border-emerald-900/40 flex items-center justify-center cursor-pointer"
            >
              <Delete className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Info & Store Registration */}
      <div className="pt-3 border-t border-[#0f3424] text-center space-y-2 text-xs">
        <div className="text-slate-400">
          {isTh ? "ยังไม่มีร้านค้า?" : "Don't have a store yet?"}{" "}
          <Link href="/register" className="text-emerald-400 font-bold hover:underline">
            {isTh ? "ลงทะเบียนเปิดร้านค้าฟรี (Beta)" : "Register store for free"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#071912] text-slate-100 font-sans flex flex-col justify-between selection:bg-[#bef264] selection:text-[#061a12]">
      {/* Top Header */}
      <header className="border-b border-[#0f3424] bg-[#061a12]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
            <Store className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
            KIPP <span className="text-emerald-400">MARKET</span>
          </span>
        </Link>

        <LanguageToggle variant="dark" />
      </header>

      {/* Main Login Box with Suspense for useSearchParams */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-[#082217] border border-[#143d2c] rounded-3xl p-8 text-center text-emerald-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading Kipp Market...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#0f3424] py-4 text-center text-xs text-slate-500">
        Kipp Market © 2026 — Multi-Tenant SaaS Retail POS.
      </footer>
    </div>
  );
}
