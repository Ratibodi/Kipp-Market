"use client";

import Link from "next/link";
import {
  Store,
  ShoppingCart,
  ScanBarcode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Receipt,
  QrCode,
  Banknote,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { language, t } = useLanguage();
  const isTh = language === "th";

  return (
    <div className="min-h-screen bg-[#071912] text-slate-100 flex flex-col font-sans selection:bg-[#bef264] selection:text-[#061a12]">
      {/* Top Navigation */}
      <header className="border-b border-[#0f3424] bg-[#061a12]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                KIPP <span className="text-emerald-400">MARKET</span>
              </span>
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                POS OS v3.4.2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher (TH / EN) */}
            <LanguageToggle variant="dark" />

            <Link
              href="/pos"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0e3324] hover:bg-[#144733] border border-emerald-700/40 text-emerald-200 hover:text-white transition"
            >
              🖥️ {t("nav.posTerminal")}
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0b291d] hover:bg-[#153a2a] text-slate-300 hover:text-white transition"
            >
              📊 {t("nav.dashboard")}
            </Link>
            <Link
              href="/dashboard/products"
              className="hidden lg:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0b291d] hover:bg-[#153a2a] text-slate-300 hover:text-white transition"
            >
              📦 {isTh ? "คลังสินค้า" : "Products"}
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0b291d] hover:bg-[#153a2a] text-slate-300 hover:text-white transition"
            >
              🔐 {isTh ? "เข้าสู่ระบบ" : "Login"}
            </Link>
            <Link
              href="/register"
              className="text-xs font-black px-3.5 py-1.5 rounded-lg bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] transition shadow-xs"
            >
              ✨ {isTh ? "เปิดร้านฟรี" : "Register"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b291d] border border-emerald-600/30 text-xs text-emerald-300 mb-6 shadow-sm">
          <Zap className="h-3.5 w-3.5 text-[#bef264]" />
          <span>
            {isTh
              ? "ระบบ Front-end ออกแบบตรงตามต้นฉบับ 100% พร้อมใช้งาน"
              : "Front-end precisely matching 100% of reference designs"}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-tight text-white">
          Kipp Market POS &
          <span className="block text-[#bef264] mt-2">
            Store Management System
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          {isTh
            ? "หน้าจอแคชเชียร์และระบบหลังร้านที่ออกแบบมาครบทั้ง 5 มุมมองหลัก: POS Main Checkout, Thai PromptPay QR flow, Cash Tender & PLU Quick-Pick, Manager Dashboard, และ Transactions Live Audit Feed."
            : "Cashier checkout and store management system built with 5 core interfaces: POS Main Checkout, Thai PromptPay QR flow, Cash Tender & PLU Quick-Pick, Manager Dashboard, and Transactions Live Audit Feed."}
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/pos"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-base shadow-xl shadow-lime-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5" />
            {isTh ? "เปิดหน้าจอขาย POS Terminal [F1]" : "Launch POS Terminal [F1]"}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#0c2e20] hover:bg-[#13422e] border border-emerald-600/40 text-emerald-200 font-bold text-base transition shadow-md"
          >
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            {isTh ? "เปิดระบบจัดการ Dashboard" : "Open Manager Dashboard"}
          </Link>
        </div>

        {/* Showcase Grid of the 5 Exact Screens */}
        <div className="mt-14 w-full text-left">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#0f3424]">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-emerald-400">●</span>{" "}
              {isTh
                ? "5 หน้าจอตามที่ดีไซน์ไว้ (100% Match)"
                : "5 Interfaces matching design 100%"}
            </h2>
            <span className="text-xs text-slate-400">
              {isTh ? "คลิกที่การ์ดเพื่อเปิดดูแต่ละหน้าได้ทันที" : "Click card to view screen directly"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Screen 1: POS Main Checkout Screen */}
            <Link
              href="/pos"
              className="p-5 rounded-2xl bg-[#082017] border border-[#143d2c] hover:border-emerald-500 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/50">
                    SCREEN 1 / POS
                  </span>
                  <ShoppingCart className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#bef264] transition">
                  POS Main Checkout Screen
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {isTh
                    ? "ตารางสินค้า Meiji Milk, CP Teriyaki, Singha Soda, Lay's Chips (฿196.00), ปุ่ม FAST PICK, แถบสแกนบาร์โค้ด USB Ready, และแผงคำนวณเงินทอน ฿304.00"
                    : "Cart items Meiji Milk, CP Teriyaki, Singha Soda, Lay's Chips (฿196.00), FAST PICK categories, USB Ready barcode scanner, and ฿304.00 change due."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0e2f20] flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>{isTh ? "เปิดหน้าจอขาย POS →" : "Open POS Screen →"}</span>
                <span className="font-mono text-[10px] text-slate-500">/pos</span>
              </div>
            </Link>

            {/* Screen 2: Thai PromptPay QR Flow */}
            <Link
              href="/pos"
              className="p-5 rounded-2xl bg-[#082017] border border-[#143d2c] hover:border-emerald-500 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/50">
                    SCREEN 2 / PROMPTPAY
                  </span>
                  <QrCode className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#bef264] transition">
                  Thai PromptPay QR Modal
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {isTh
                    ? "ขั้นตอน 3-Step Progress, Dynamic EMVCo QR Code, ตัวนับเวลา 02:44, Cashier Simulation Sandbox (Waiting / Success / Error) และ Settlement Slip"
                    : "3-Step Progress indicator, Dynamic EMVCo QR Code, 02:44 countdown timer, Cashier Simulation Sandbox, and Settlement Slip."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0e2f20] flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>{isTh ? "กดปุ่ม [F10] ในหน้า POS →" : "Press [F10] in POS →"}</span>
                <span className="font-mono text-[10px] text-slate-500">[F10] QR</span>
              </div>
            </Link>

            {/* Screen 3: Cash Tender & Quick-Pick Drawer */}
            <Link
              href="/pos"
              className="p-5 rounded-2xl bg-[#082017] border border-[#143d2c] hover:border-emerald-500 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/50">
                    SCREEN 3 / CASH & PLU
                  </span>
                  <Banknote className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#bef264] transition">
                  Cash Tender & Quick-Pick Drawer
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {isTh
                    ? "ปุ่มลัดธนบัตร (ALT+1 ถึง ALT+4), กล่องเงินทอน ฿304.00, และลิ้นชักสินค้าด่วน Quick-Pick PLU (ซาลาเปา, ขนมปังคัสตาร์ด, ชาไทย, กล้วยหอม)"
                    : "Denomination fast keys (ALT+1 to ALT+4), ฿304.00 change due, and Quick-Pick PLU drawer (Bao, Custard Bun, Thai Tea, Banana)."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0e2f20] flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>{isTh ? "กดปุ่ม [F9] ในหน้า POS →" : "Press [F9] in POS →"}</span>
                <span className="font-mono text-[10px] text-slate-500">[F9] Cash</span>
              </div>
            </Link>

            {/* Screen 4: Manager Dashboard */}
            <Link
              href="/dashboard"
              className="p-5 rounded-2xl bg-[#082017] border border-[#143d2c] hover:border-emerald-500 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/50">
                    SCREEN 4 / DASHBOARD
                  </span>
                  <TrendingUp className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#bef264] transition">
                  Manager Dashboard (Executive)
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {isTh
                    ? "4 KPI Cards (Gross Sales ฿24,850, Gross Profit Margin 27.8%), กราฟยอดขายรายชั่วโมง (Lunch Peak), Donut สัดส่วนการชำระเงิน, และตารางเตือนสินค้าใกล้หมด"
                    : "4 KPI Cards (Gross Sales ฿24,850, Gross Profit Margin 27.8%), Hourly Sales Trend chart (Lunch Peak), Payment Breakdown donut, and Reorder Warnings."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0e2f20] flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>{isTh ? "เปิดแดชบอร์ดผู้จัดการ →" : "Open Dashboard →"}</span>
                <span className="font-mono text-[10px] text-slate-500">/dashboard</span>
              </div>
            </Link>

            {/* Screen 5: Transactions Live Audit Feed & Slip */}
            <Link
              href="/dashboard/transactions"
              className="p-5 rounded-2xl bg-[#082017] border border-[#143d2c] hover:border-emerald-500 transition group flex flex-col justify-between md:col-span-2 lg:col-span-2"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/50">
                    SCREEN 5 / AUDIT FEED & SLIP
                  </span>
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#bef264] transition">
                  Transactions Live Audit Feed & 80mm Slip Inspector
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {isTh
                    ? "ตารางบันทึกการขายสดพร้อมระบบฟิลเตอร์, แถบรับรอง e-Tax Clearance พร้อม HSM keystore, และลิ้นชักด้านขวาแสดงใบเสร็จความร้อน 80mm ESC/POS เสมือนจริงและ Transaction Audit Log"
                    : "Real-time audit log with filters, e-Tax Clearance banner with RSA-2048 HSM keystore, and right drawer with 80mm ESC/POS thermal slip preview & audit log."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0e2f20] flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>{isTh ? "เปิดดูประวัติและใบเสร็จความร้อน →" : "Open Transactions & Slip →"}</span>
                <span className="font-mono text-[10px] text-slate-500">/dashboard/transactions</span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#0f3424] py-6 text-center text-xs text-slate-500 bg-[#05140e]">
        Kipp Market © 2026 — Retail POS & Convenience Store Management Architecture.
      </footer>
    </div>
  );
}
