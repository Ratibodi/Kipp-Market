"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  Lock,
  Loader2,
  Check,
  Power,
  Store,
  ChevronRight,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useLanguage } from "@/context/LanguageContext";

interface StaffItem {
  id: string;
  displayName: string;
  phone: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  isActive: boolean;
  hasPin: boolean;
  isLocked?: boolean;
  branchId?: string | null;
  branchName?: string;
  branchCode?: string;
}

interface BranchOption {
  id: string;
  name: string;
  code: string;
  address?: string;
}

export default function StaffManagementPage() {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Add Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newRole, setNewRole] = useState<"CASHIER" | "MANAGER">("CASHIER");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("1234");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset PIN Modal State
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState<boolean>(false);
  const [selectedStaffForPin, setSelectedStaffForPin] = useState<StaffItem | null>(null);
  const [resetPinValue, setResetPinValue] = useState<string>("");

  // Branch Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [selectedStaffForTransfer, setSelectedStaffForTransfer] = useState<StaffItem | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<string>("");

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        if (data?.staff) {
          setStaffList(data.staff);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch staff:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const data = await res.json();
        if (data?.branches && Array.isArray(data.branches)) {
          setBranches(data.branches);
          if (data.branches.length > 0 && !selectedBranchId) {
            setSelectedBranchId(data.branches[0].id);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch branches:", err);
    }
  };

  useEffect(() => {
    loadStaff();
    loadBranches();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorToast(null);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: newName,
          phone: newPhone,
          role: newRole,
          pin: newPin,
          branchId: selectedBranchId || (branches[0]?.id || undefined),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorToast(data.error || "เกิดข้อผิดพลาดในการสร้างพนักงาน");
      } else {
        setSuccessToast(data.message || "เพิ่มพนักงานเรียบร้อยแล้ว");
        setIsAddModalOpen(false);
        setNewName("");
        setNewPhone("");
        setNewPin("1234");
        loadStaff();
      }
    } catch {
      setErrorToast("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleTransferBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForTransfer || !targetBranchId) return;

    setIsSubmitting(true);
    setErrorToast(null);

    try {
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStaffForTransfer.id,
          branchId: targetBranchId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorToast(data.error || "เกิดข้อผิดพลาดในการย้ายสาขา");
      } else {
        const targetBranchName =
          branches.find((b) => b.id === targetBranchId)?.name || "สาขาที่เลือก";
        setSuccessToast(`ย้าย "${selectedStaffForTransfer.displayName}" ไปยัง ${targetBranchName} เรียบร้อยแล้ว`);
        setIsTransferModalOpen(false);
        loadStaff();
      }
    } catch {
      setErrorToast("ไม่สามารถย้ายสาขาได้");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPin) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStaffForPin.id,
          pin: resetPinValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorToast(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัส PIN");
      } else {
        setSuccessToast(data.message || "เปลี่ยนรหัส PIN เรียบร้อยแล้ว");
        setIsResetPinModalOpen(false);
        setResetPinValue("");
        loadStaff();
      }
    } catch {
      setErrorToast("ไม่สามารถเปลี่ยนรหัส PIN ได้");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleToggleActive = async (staff: StaffItem) => {
    if (staff.role === "OWNER") {
      alert("ไม่สามารถระงับบัญชีเจ้าของร้านได้");
      return;
    }

    try {
      const nextActive = !staff.isActive;
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: staff.id,
          isActive: nextActive,
        }),
      });

      if (res.ok) {
        setSuccessToast(
          nextActive
            ? `เปิดใช้งาน ${staff.displayName} เรียบร้อยแล้ว`
            : `ระงับการใช้งาน ${staff.displayName} ชั่วคราวแล้ว`
        );
        loadStaff();
      }
    } catch {
      setErrorToast("เกิดข้อผิดพลาดในการปรับสถานะ");
    } finally {
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const totalStaff = staffList.length;
  const managers = staffList.filter((s) => s.role === "MANAGER").length;
  const cashiers = staffList.filter((s) => s.role === "CASHIER").length;
  const activeCount = staffList.filter((s) => s.isActive).length;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader />

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Users className="h-6 w-6 text-emerald-600" />
                <span>{isTh ? "จัดการพนักงาน & แคชเชียร์" : "Staff & Cashier Management"}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isTh
                  ? "กำหนดสิทธิ์พนักงาน, ตั้งรหัส PIN 4 หลักประจำเครื่อง POS และควบคุมการเข้าใช้งานของทีมงาน"
                  : "Assign team roles, set 4-digit POS cashier PINs, and manage permissions"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isTh ? "+ เพิ่มพนักงานใหม่" : "+ Add New Staff"}</span>
            </button>
          </div>

          {/* Feedback Toasts */}
          {successToast && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}
          {errorToast && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>{errorToast}</span>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isTh ? "พนักงานทั้งหมด" : "Total Staff"}
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalStaff} คน</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                {activeCount} คน ใช้งานอยู่
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isTh ? "เจ้าของร้าน (Owner)" : "Store Owner"}
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1">1 คน</div>
              <div className="text-[10px] text-slate-500 mt-1">สิทธิ์สูงสุดทุกระบบ</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isTh ? "ผู้จัดการสาขา" : "Managers"}
              </div>
              <div className="text-2xl font-black text-blue-700 mt-1">{managers} คน</div>
              <div className="text-[10px] text-blue-600 font-medium mt-1">อนุมัติ Void / ส่วนลด</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isTh ? "แคชเชียร์ประจำเครื่อง" : "Cashiers"}
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{cashiers} คน</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">คิดเงิน & เปิด-ปิดกะ</div>
            </div>
          </div>

          {/* Staff List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {isTh ? "รายชื่อทีมงานและพนักงานในร้าน" : "Active Staff Roster"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isTh
                    ? "พนักงานใช้รหัส PIN 4 หลักเพื่อปลดล็อคเข้าใช้งานเครื่องคิดเงิน POS"
                    : "Cashiers use their assigned 4-digit PIN to operate POS terminals"}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <span className="text-xs">กำลังโหลดรายชื่อพนักงาน...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-5">ชื่อ-นามสกุล</th>
                      <th className="py-3.5 px-4">สาขาประจำ (Branch)</th>
                      <th className="py-3.5 px-4">เบอร์โทรศัพท์</th>
                      <th className="py-3.5 px-4">บทบาทหน้าที่ (Role)</th>
                      <th className="py-3.5 px-4 text-center">รหัส PIN หน้าร้าน POS</th>
                      <th className="py-3.5 px-4 text-center">สถานะ</th>
                      <th className="py-3.5 px-5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map((staff) => {
                      const isOwner = staff.role === "OWNER";
                      const isManager = staff.role === "MANAGER";

                      return (
                        <tr key={staff.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                isOwner
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : isManager
                                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              }`}
                            >
                              {staff.displayName.slice(0, 2)}
                            </div>
                            <div>
                              <div>{staff.displayName}</div>
                              {isOwner && (
                                <div className="text-[10px] text-amber-600 font-normal">
                                  เจ้าของบัญชีหลัก
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
                              <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[140px]">{staff.branchName || "สาขาหลัก"}</span>
                              {staff.branchCode && (
                                <span className="text-[10px] text-slate-400 font-mono">({staff.branchCode})</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                            {staff.phone}
                          </td>

                          <td className="py-3.5 px-4">
                            {isOwner ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-800 border border-amber-500/30">
                                👑 {isTh ? "เจ้าของร้าน (Owner)" : "Store Owner"}
                              </span>
                            ) : isManager ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-800 border border-blue-500/30">
                                🛡️ {isTh ? "ผู้จัดการสาขา (Manager)" : "Branch Manager"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                                🏷️ {isTh ? "แคชเชียร์ (Cashier)" : "POS Cashier"}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono">
                            <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold text-xs border border-slate-200">
                              <KeyRound className="h-3 w-3 text-slate-400" />
                              <span>••••</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {staff.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {isTh ? "ใช้งานปกติ" : "Active"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                {isTh ? "ระงับใช้งาน" : "Inactive"}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-5 text-right space-x-2">
                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStaffForTransfer(staff);
                                  setTargetBranchId(staff.branchId || (branches[0]?.id || ""));
                                  setIsTransferModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                              >
                                {isTh ? "ย้ายสาขา" : "Transfer"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStaffForPin(staff);
                                setResetPinValue("");
                                setIsResetPinModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                            >
                              {isTh ? "เปลี่ยน PIN" : "Reset PIN"}
                            </button>

                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(staff)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                  staff.isActive
                                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {staff.isActive
                                  ? isTh
                                    ? "ระงับสิทธิ์"
                                    : "Deactivate"
                                  : isTh
                                  ? "เปิดใช้งาน"
                                  : "Activate"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Permissions Matrix Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>{isTh ? "ตารางเปรียบเทียบสิทธิ์การใช้งาน (Permissions Matrix)" : "Role Permissions Matrix"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTh
                  ? "ระบบความปลอดภัยป้องกันการทุจริต แยกหน้าที่ระหว่างแคชเชียร์ ผู้จัดการ และเจ้าของร้าน"
                  : "Fraud prevention and duty segregation between staff levels"}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">ความสามารถในระบบ</th>
                    <th className="py-2.5 px-4 text-center text-emerald-700">แคชเชียร์ (Cashier)</th>
                    <th className="py-2.5 px-4 text-center text-blue-700">ผู้จัดการ (Manager)</th>
                    <th className="py-2.5 px-4 text-center text-amber-700 font-black">เจ้าของร้าน (Owner)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold">คิดเงินหน้าร้าน POS, สแกนบาร์โค้ด, รับเงินสด & QR</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ทำได้</td>
                    <td className="py-2.5 px-4 text-center text-blue-600 font-bold">✓ ทำได้</td>
                    <td className="py-2.5 px-4 text-center text-amber-600 font-bold">✓ ทำได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold">พักบิลชั่วคราว (Hold Cart) และดึงบิลขึ้นมาคิดเงินต่อ</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ทำได้</td>
                    <td className="py-2.5 px-4 text-center text-blue-600 font-bold">✓ ทำได้</td>
                    <td className="py-2.5 px-4 text-center text-amber-600 font-bold">✓ ทำได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold">เปิดกะ-ปิดกะลิ้นชักเงินสด (Shift Open / Close)</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ประจำตัว</td>
                    <td className="py-2.5 px-4 text-center text-blue-600 font-bold">✓ ตรวจสอบได้</td>
                    <td className="py-2.5 px-4 text-center text-amber-600 font-bold">✓ ดูย้อนหลังได้</td>
                  </tr>
                  <tr className="bg-amber-50/30">
                    <td className="py-2.5 px-4 font-semibold text-rose-800">
                      ยกเลิกบิล (Void Bill) หรือคืนเงิน (Refund)
                    </td>
                    <td className="py-2.5 px-4 text-center text-rose-600 font-bold">
                      ✗ ต้องขอ PIN ผู้จัดการ
                    </td>
                    <td className="py-2.5 px-4 text-center text-blue-600 font-bold">✓ อนุมัติได้</td>
                    <td className="py-2.5 px-4 text-center text-amber-600 font-bold">✓ อนุมัติได้</td>
                  </tr>
                  <tr className="bg-amber-50/30">
                    <td className="py-2.5 px-4 font-semibold text-rose-800">
                      ให้ส่วนลดพิเศษท้ายบิลเกิน 10%
                    </td>
                    <td className="py-2.5 px-4 text-center text-rose-600 font-bold">
                      ✗ ต้องขอ PIN ผู้จัดการ
                    </td>
                    <td className="py-2.5 px-4 text-center text-blue-600 font-bold">✓ อนุมัติได้</td>
                    <td className="py-2.5 px-4 text-center text-amber-600 font-bold">✓ อนุมัติได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold">เข้าแดชบอร์ดหลังร้าน ดูยอดขายและต้นทุน-กำไรสุทธิ</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่มีสิทธิ์เข้า</td>
                    <td className="py-2.5 px-4 text-center text-blue-600 font-bold">✓ ดูยอดขายสาขา</td>
                    <td className="py-2.5 px-4 text-center text-amber-600 font-bold">✓ ดูได้ทั้งหมด</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold">ตั้งค่า PromptPay ร้านค้า, บัญชีรับเงิน และจัดการทีมงาน</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่มีสิทธิ์เข้า</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่มีสิทธิ์เข้า</td>
                    <td className="py-2.5 px-4 text-center text-amber-600 font-bold">✓ เจ้าของร้านเท่านั้น</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: ADD NEW STAFF */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">เพิ่มพนักงานใหม่</h3>
                  <p className="text-xs text-slate-400">กำหนดชื่อ ตำแหน่ง และรหัส PIN หน้าร้าน</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล หรือชื่อเล่น *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น มะนาว พนักงานแคชเชียร์"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์มือถือ (ถ้ามี)</label>
                <input
                  type="tel"
                  placeholder="081-234-5678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">บทบาทหน้าที่ (Role) *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "CASHIER" | "MANAGER")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="CASHIER">แคชเชียร์ (คิดเงินหน้าร้าน POS, เปิด-ปิดกะ)</option>
                  <option value="MANAGER">ผู้จัดการสาขา (มีสิทธิ์อนุมัติ Void และดูข้อมูลสาขา)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">สาขาที่สังกัด (Branch Assignment) *</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium focus:outline-none focus:border-emerald-600"
                >
                  {branches.length === 0 ? (
                    <option value="">สาขาหลัก (Default Branch)</option>
                  ) : (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.name} ({b.code})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  กำหนดว่าพนักงานคนนี้จะปฏิบัติงานและบันทึกยอดขายผูกกับสาขาใด
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รหัส PIN 4 หลักสำหรับกดเข้าเครื่อง POS *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="เช่น 1234"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold tracking-widest focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  พนักงานจะใช้เลข PIN 4 หลักนี้ในการกดเข้ากะและคิดเงินที่เครื่องหน้าร้าน
                </p>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>บันทึกพนักงาน</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PIN */}
      {isResetPinModalOpen && selectedStaffForPin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">เปลี่ยนรหัส PIN</h3>
                  <p className="text-xs text-slate-400">{selectedStaffForPin.displayName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetPinModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  กำหนดรหัส PIN ใหม่ (ตัวเลข 4 หลัก) *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="เช่น 5678"
                  value={resetPinValue}
                  onChange={(e) => setResetPinValue(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 font-mono text-center text-lg font-bold tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetPinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || resetPinValue.length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>เปลี่ยนรหัส</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER BRANCH */}
      {isTransferModalOpen && selectedStaffForTransfer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">ย้ายสาขาประจำ</h3>
                  <p className="text-xs text-slate-400">{selectedStaffForTransfer.displayName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTransferBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  เลือกสาขาใหม่ที่ต้องการให้ไปประจำการ *
                </label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium focus:outline-none focus:border-emerald-600"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      📍 {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  เมื่อย้ายแล้ว ยอดขายและกะทำงานจะเชื่อมโยงกับสาขาใหม่ทันที
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetBranchId}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>บันทึกการย้าย</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
