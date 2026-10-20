import Link from "next/link";
import { Store, ArrowLeft, LayoutDashboard, ShoppingCart, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#061a12] text-slate-100 flex flex-col justify-between selection:bg-[#bef264] selection:text-[#061a12] font-sans">
      {/* Top Header */}
      <header className="border-b border-[#0f3424] bg-[#061a12]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black shadow-inner group-hover:bg-emerald-500/30 transition">
            <Store className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1">
              KIPP <span className="text-emerald-400">MARKET</span>
            </div>
            <div className="text-[10px] text-emerald-300/70 font-mono">RETAIL POS PLATFORM</div>
          </div>
        </Link>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-xl border border-emerald-700/40 text-emerald-200 hover:text-white hover:bg-[#0e3324] text-xs font-semibold transition flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>กลับหน้าแรก</span>
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          {/* Glowing 404 Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold mb-4 shadow-sm animate-pulse">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>ERROR 404 • PAGE NOT FOUND</span>
          </div>

          <h1 className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-emerald-400/60 font-mono tracking-tighter">
            404
          </h1>

          <h2 className="text-2xl font-black text-white mt-4 tracking-tight">
            ไม่พบหน้าที่คุณต้องการ
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือ URL ไม่ถูกต้อง คุณสามารถเลือกกลับไปยังหน้าหลัก หรือเข้าใช้งานระบบขาย POS ได้ทันที
          </p>

          {/* Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            <Link
              href="/pos"
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold transition flex items-center justify-center gap-2.5 group"
            >
              <ShoppingCart className="h-5 w-5 text-emerald-200 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-emerald-100 font-normal">เปิดหน้าจอขาย</div>
                <div className="text-sm font-black">POS Terminal</div>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="p-4 rounded-2xl bg-[#0b291d] hover:bg-[#0f3424] border border-emerald-700/40 text-emerald-100 hover:text-white font-bold transition flex items-center justify-center gap-2.5 group"
            >
              <LayoutDashboard className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-slate-400 font-normal">ระบบจัดการร้าน</div>
                <div className="text-sm font-black">Store Dashboard</div>
              </div>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#0f3424] flex items-center justify-center gap-4 text-xs text-slate-400 font-mono">
            <Link href="/" className="hover:text-emerald-300 transition">หน้าหลัก (Home)</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-emerald-300 transition">เข้าสู่ระบบ (Login)</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-emerald-300 transition">สมัครร้านค้า (Register)</Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#0f3424] bg-[#061a12] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        © 2026 Kipp Market Platform — Retail POS & Inventory Management System
      </footer>
    </div>
  );
}
