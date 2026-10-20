"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  Database,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardDrive,
  BarChart,
  Settings,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { MOCK_TENANTS, TenantStore } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";

export default function SuperAdminPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [tenants, setTenants] = useState<TenantStore[]>(MOCK_TENANTS);
  const [signupOpen, setSignupOpen] = useState<boolean>(true);
  const [requireApproval, setRequireApproval] = useState<boolean>(true);

  // Storage Quota (Supabase Free Tier: 500 MB)
  const totalStorageMb = tenants.reduce((acc, t) => acc + t.storageMb, 0);
  const quotaLimitMb = 500.0;
  const storagePercent = (totalStorageMb / quotaLimitMb) * 100;

  const handleToggleStatus = (id: string, newStatus: TenantStore["status"]) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#071912] text-slate-100 font-sans flex flex-col justify-between selection:bg-[#bef264] selection:text-[#061a12]">
      {/* Platform Header */}
      <header className="border-b border-[#0f3424] bg-[#061a12]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-black">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>KIPP PLATFORM</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SUPER ADMIN
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Role: kipp_admin (BYPASSRLS)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle variant="dark" />
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0e3324] hover:bg-[#144733] border border-emerald-700/40 text-emerald-200 transition"
          >
            {isTh ? "แดชบอร์ดร้านค้า →" : "Store Dashboard →"}
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0f3424]">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Store className="h-6 w-6 text-emerald-400" />
              <span>{isTh ? "การจัดการร้านค้า Multi-Tenant & โควตาเซิร์ฟเวอร์" : "Multi-Tenant Platform & Quota"}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isTh
                ? "อนุมัติร้านค้าช่วง Beta และมอนิเตอร์ขนาดฐานข้อมูลเทียบกับ Supabase Free Tier 500MB (Design Doc ข้อ 8)"
                : "Tenant onboarding approvals and database capacity monitoring"}
            </p>
          </div>
        </div>

        {/* Database Storage Capacity Gauge (Design Doc Section 8) */}
        <div className="p-6 rounded-3xl bg-[#082217] border border-[#143d2c] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">
                {isTh ? "ตัววัดการใช้งานฐานข้อมูล Supabase PostgreSQL (Free Tier 500MB)" : "Supabase PostgreSQL Database Storage Gauge"}
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-300">
              {totalStorageMb.toFixed(1)} MB / {quotaLimitMb.toFixed(0)} MB ({storagePercent.toFixed(1)}%)
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#051710] rounded-full overflow-hidden border border-[#0e3524] relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                storagePercent > 90
                  ? "bg-rose-500"
                  : storagePercent > 70
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(100, storagePercent)}%` }}
            />
          </div>

          {/* Free Tier Capacity Rules Warning */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2 pt-1 border-t border-[#0e3022]">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <CheckCircle className="h-4 w-4" />
              <span>{isTh ? "ความจุปลอดภัย: ร้านเล็กใช้ ~10-30 MB/เดือน" : "Healthy status: Small store consumes ~10-30 MB/mo"}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Warning threshold: 70% (350MB) • Critical threshold: 90% (450MB)
            </div>
          </div>
        </div>

        {/* Platform Beta Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#082217] border border-[#143d2c] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{isTh ? "เปิดรับสมัครร้านค้า Beta" : "Accept New Signups"}</div>
              <div className="text-[11px] text-slate-400">{isTh ? "อนุญาตให้ร้านใหม่ลงทะเบียน" : "Open registration"}</div>
            </div>
            <button
              type="button"
              onClick={() => setSignupOpen(!signupOpen)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                signupOpen ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
              }`}
            >
              {signupOpen ? "OPEN" : "PAUSED"}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#082217] border border-[#143d2c] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{isTh ? "ต้องรออนุมัติก่อนขาย" : "Require Admin Approval"}</div>
              <div className="text-[11px] text-slate-400">{isTh ? "สถานะเริ่มต้น PENDING" : "Default status: PENDING"}</div>
            </div>
            <button
              type="button"
              onClick={() => setRequireApproval(!requireApproval)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                requireApproval ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-slate-800 text-slate-400"
              }`}
            >
              {requireApproval ? "ENABLED" : "AUTO"}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#082217] border border-[#143d2c] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{isTh ? "จำนวนร้านทั้งหมด" : "Total Tenants"}</div>
              <div className="text-[11px] text-slate-400">{isTh ? "จำกัดไม่เกิน 20 ร้านช่วง Beta" : "Max 20 during Beta"}</div>
            </div>
            <div className="text-xl font-black font-mono text-emerald-400">
              {tenants.length} / 20
            </div>
          </div>
        </div>

        {/* Tenant Stores Table */}
        <div className="rounded-3xl bg-[#082217] border border-[#143d2c] overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-[#061911] border-b border-[#0f3424] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isTh ? "รายชื่อร้านค้าในระบบ (Tenant Directory)" : "Registered Tenant Stores"}</span>
              <span className="text-xs font-mono font-normal text-slate-400">({tenants.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#051710] border-b border-[#0e3022] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">{isTh ? "ชื่อร้านค้า" : "Store Name"}</th>
                  <th className="py-3 px-4">{isTh ? "อีเมลเจ้าของ" : "Owner Email"}</th>
                  <th className="py-3 px-4 text-center">{isTh ? "สาขา / POS" : "Branches/POS"}</th>
                  <th className="py-3 px-4 text-right">{isTh ? "บิลเฉลี่ย/วัน" : "Daily Bills"}</th>
                  <th className="py-3 px-4 text-right">{isTh ? "ขนาดข้อมูล (DB)" : "DB Used"}</th>
                  <th className="py-3 px-4 text-center">{isTh ? "สถานะ" : "Status"}</th>
                  <th className="py-3 px-6 text-center">{isTh ? "การอนุมัติ" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0e3022]">
                {tenants.map((store) => (
                  <tr key={store.id} className="hover:bg-[#0a291c] transition">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-white text-xs">{isTh ? store.nameTh : store.nameEn}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">/{store.slug}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {store.ownerEmail}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      {store.branchesCount} {isTh ? "สาขา" : "br"} • {store.terminalsCount} POS
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                      ~{store.dailyTrxAvg} {isTh ? "บิล" : "bills"}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {store.storageMb.toFixed(1)} MB
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          store.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : store.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {store.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {store.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(store.id, "ACTIVE")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition cursor-pointer"
                          >
                            {isTh ? "✓ อนุมัติ" : "Approve"}
                          </button>
                        )}
                        {store.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(store.id, "SUSPENDED")}
                            className="px-2.5 py-1 rounded-lg bg-[#0e3524] hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-[11px] font-bold transition cursor-pointer"
                          >
                            {isTh ? "ระงับ" : "Suspend"}
                          </button>
                        )}
                        {store.status === "SUSPENDED" && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(store.id, "ACTIVE")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold transition cursor-pointer"
                          >
                            {isTh ? "เปิดใช้งาน" : "Re-activate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#0f3424] py-4 text-center text-xs text-slate-500">
        Kipp Market © 2026 — Platform Administration & Multi-Tenant Control.
      </footer>
    </div>
  );
}
