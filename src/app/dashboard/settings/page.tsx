"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Building2,
  Plus,
  MapPin,
  X,
  AlertCircle,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useLanguage } from "@/context/LanguageContext";
import {
  createPromptPayQrDataUrl,
  formatPromptPayDisplay,
} from "@/lib/promptpay";

interface BranchItem {
  id: string;
  name: string;
  code: string;
  address: string;
  isActive: boolean;
  terminalsCount: number;
  createdAt: string;
}

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [activeTab, setActiveTab] = useState<"BRANCHES" | "PROMPTPAY" | "SCALE" | "TERMINALS">("BRANCHES");

  // Branches State
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>("");
  const [newBranchCode, setNewBranchCode] = useState<string>("");
  const [newBranchAddress, setNewBranchAddress] = useState<string>("");
  const [isSubmittingBranch, setIsSubmittingBranch] = useState<boolean>(false);
  const [branchToast, setBranchToast] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);

  // PromptPay Settings
  const [promptPayType, setPromptPayType] = useState<string>("PHONE");
  const [promptPayId, setPromptPayId] = useState<string>("0819998841");
  const [accountName, setAccountName] = useState<string>("กิ๊ป มินิมาร์ท");
  const [testQrDataUrl, setTestQrDataUrl] = useState<string>("");
  const [testEmvPayload, setTestEmvPayload] = useState<string>("");
  const [isGeneratingTestQr, setIsGeneratingTestQr] = useState<boolean>(false);

  // Scale Settings
  const [scaleEnabled, setScaleEnabled] = useState<boolean>(true);
  const [scalePrefix, setScalePrefix] = useState<string>("21");
  const [scalePluLength, setScalePluLength] = useState<string>("5");
  const [scaleValueType, setScaleValueType] = useState<string>("WEIGHT_G");

  // Save feedback & loading state
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const data = await res.json();
        if (data?.branches && Array.isArray(data.branches)) {
          setBranches(data.branches);
        }
      }
    } catch (err) {
      console.warn("Failed to load branches:", err);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBranch(true);
    setBranchError(null);
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBranchName,
          code: newBranchCode,
          address: newBranchAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBranchError(data.error || "เกิดข้อผิดพลาดในการสร้างสาขา");
      } else {
        setBranchToast(data.message || "สร้างสาขาเรียบร้อยแล้ว");
        setIsAddBranchModalOpen(false);
        setNewBranchName("");
        setNewBranchCode("");
        setNewBranchAddress("");
        loadBranches();
      }
    } catch {
      setBranchError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmittingBranch(false);
      setTimeout(() => setBranchToast(null), 4000);
    }
  };

  const handleToggleBranch = async (branch: BranchItem) => {
    try {
      const nextActive = !branch.isActive;
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: branch.id,
          isActive: nextActive,
        }),
      });
      if (res.ok) {
        setBranchToast(
          nextActive
            ? `เปิดใช้งาน ${branch.name} เรียบร้อยแล้ว`
            : `ระงับ ${branch.name} ชั่วคราวแล้ว`
        );
        loadBranches();
      }
    } catch {
      setBranchError("เกิดข้อผิดพลาดในการปรับสถานะสาขา");
    } finally {
      setTimeout(() => setBranchToast(null), 4000);
    }
  };


  // Load existing payment settings on mount
  useEffect(() => {
    loadBranches();
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings/payment");
        if (res.ok) {
          const data = await res.json();
          if (data?.settings) {
            const pId = data.settings.promptpayId || "0819998841";
            setPromptPayType(data.settings.promptpayType || "PHONE");
            setPromptPayId(pId);
            setAccountName(data.settings.accountName || "กิ๊ป มินิมาร์ท");
            // Generate initial test QR
            generateTestQrCode(pId);
          }
        }
      } catch (e) {
        console.warn("Failed to load settings:", e);
      }
    }
    loadSettings();
  }, []);

  const generateTestQrCode = async (idToUse?: string) => {
    const targetId = idToUse || promptPayId;
    if (!targetId) return;

    setIsGeneratingTestQr(true);
    try {
      const { payload, qrDataUrl } = await createPromptPayQrDataUrl(targetId, 1.0);
      setTestQrDataUrl(qrDataUrl);
      setTestEmvPayload(payload);
    } catch (err) {
      console.error("Test QR generation error:", err);
    } finally {
      setIsGeneratingTestQr(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptpayType: promptPayType,
          promptpayId: promptPayId,
          accountName: accountName,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Refresh preview test QR code
        await generateTestQrCode(promptPayId);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
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
                  ? "กำหนดค่า PromptPay QR สำหรับให้ลูกค้าสแกนจ่ายเงินจริง, สเปกตาชั่ง EAN-13 และเครื่อง POS"
                  : "Configure PromptPay QR parameters for live customer payments, EAN-13 scales, and terminals"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isTh ? "กำลังบันทึก..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isTh ? "บันทึกการตั้งค่า" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>
                {isTh
                  ? "บันทึกการตั้งค่า PromptPay เรียบร้อยแล้ว พร้อมให้ลูกค้าสแกนจ่ายที่เครื่อง POS ทันที"
                  : "PromptPay settings saved! Ready for live customer scanning at POS."}
              </span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("BRANCHES")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === "BRANCHES"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>{isTh ? "1. สาขาร้านค้า (Branches)" : "1. Store Branches"}</span>
            </button>

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
              <span>{isTh ? "2. PromptPay QR (สแกนจ่าย)" : "2. PromptPay QR"}</span>
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
              <span>{isTh ? "3. บาร์โค้ดตาชั่ง (Scale EAN-13)" : "3. Scale Barcode"}</span>
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
              <span>{isTh ? "4. เครื่อง POS & Device Token" : "4. Terminals & Pairing"}</span>
            </button>
          </div>

          {/* Feedback Toasts for Branches */}
          {branchToast && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{branchToast}</span>
            </div>
          )}
          {branchError && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>{branchError}</span>
            </div>
          )}

          {/* TAB 1: BRANCHES MANAGEMENT */}
          {activeTab === "BRANCHES" && (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    <span>{isTh ? "สาขาร้านค้าทั้งหมด" : "All Store Branches"}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isTh
                      ? "เพิ่มและจัดการสาขาของร้านค้า เชื่อมต่อเครื่องคิดเงิน POS และแยกยอดขายตามสาขา"
                      : "Add and manage multiple retail branches with distinct POS terminals"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isTh ? "+ เพิ่มสาขาใหม่" : "+ Add New Branch"}</span>
                </button>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isTh ? "สาขาทั้งหมด" : "Total Branches"}
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{branches.length} สาขา</div>
                  <div className="text-[10px] text-slate-500 mt-1">เครือข่ายร้านค้า</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isTh ? "สาขาที่เปิดทำการ" : "Active Branches"}
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {branches.filter((b) => b.isActive).length} สาขา
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">พร้อมคิดเงินหน้าร้าน</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isTh ? "เครื่อง POS รวมทุกสาขา" : "Total POS Terminals"}
                  </div>
                  <div className="text-2xl font-black text-blue-700 mt-1">
                    {branches.reduce((acc, b) => acc + (b.terminalsCount || 1), 0)} เครื่อง
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium mt-1">จุดชำระเงิน</div>
                </div>
              </div>

              {/* Branch Cards Grid */}
              {isLoadingBranches ? (
                <div className="py-12 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium">กำลังโหลดข้อมูลสาขา...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-500/50 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <span>{branch.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                #{branch.code}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[220px]">{branch.address}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                            branch.isActive
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {branch.isActive ? (isTh ? "● เปิดทำการ" : "Active") : isTh ? "○ พักทำการ" : "Suspended"}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Monitor className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold">
                            {branch.terminalsCount || 1} {isTh ? "เครื่อง POS ประจำการ" : "Terminals"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleBranch(branch)}
                          className={`text-xs font-bold transition px-3 py-1 rounded-xl cursor-pointer ${
                            branch.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-emerald-700 hover:bg-emerald-50 font-black"
                          }`}
                        >
                          {branch.isActive ? (isTh ? "พักทำการชั่วคราว" : "Suspend") : isTh ? "เปิดใช้งาน" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROMPTPAY SETTINGS */}
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
                      <option value="PHONE">{isTh ? "เบอร์โทรศัพท์มือถือ (Phone Number 10 หลัก)" : "Mobile Phone (10 digits)"}</option>
                      <option value="TAX_ID">{isTh ? "เลขประจำตัวผู้เสียภาษี (Tax ID 13 หลัก)" : "Tax ID (13 digits)"}</option>
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
                      placeholder={promptPayType === "PHONE" ? "081-234-5678" : "0-1055-58194-82-1"}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isTh
                        ? "หมายเลขที่ผูกกับบัญชีธนาคารของร้านค้าเพื่อรับเงินโอนตรงเข้าบัญชี"
                        : "Account identifier linked with merchant bank account"}
                    </p>
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
                    onClick={() => generateTestQrCode(promptPayId)}
                    disabled={isGeneratingTestQr}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingTestQr ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#bef264]" />
                        <span>กำลังสร้าง QR ทดสอบ...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-[#bef264]" />
                        <span>{isTh ? "ทดสอบสร้าง QR PromptPay 1.00 บาท (สแกนได้จริง)" : "Generate Test 1.00 THB QR"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Live EMVCo Scannable QR Preview */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="w-48 h-48 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm flex flex-col items-center justify-center mb-3 relative">
                    {testQrDataUrl ? (
                      <div className="relative flex items-center justify-center">
                        <img
                          src={testQrDataUrl}
                          alt="Live PromptPay QR Test"
                          className="w-44 h-44 object-contain rounded-lg"
                        />
                        {/* Center Thai QR Badge */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#002f6c] border-2 border-white rounded-md flex items-center justify-center shadow pointer-events-none">
                          <span className="text-white font-black text-[7px] leading-tight text-center tracking-tight">
                            THAI<br />QR
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-900">{accountName}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {promptPayType}: {formatPromptPayDisplay(promptPayId, promptPayType)}
                  </div>
                  <div className="text-xs font-black font-mono text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>฿1.00 THB • EMVCo Payload พร้อมสแกนจริง</span>
                  </div>
                  {testEmvPayload && (
                    <div className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-xs" title={testEmvPayload}>
                      EMV: {testEmvPayload.slice(0, 24)}...{testEmvPayload.slice(-6)}
                    </div>
                  )}
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

      {/* MODAL: ADD NEW BRANCH */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isTh ? "เพิ่มสาขาร้านค้าใหม่" : "Add New Store Branch"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isTh ? "กำหนดชื่อ รหัสสาขา และที่อยู่ตั้งร้าน" : "Set branch name, code and location"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBranchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "ชื่อสาขา * (เช่น สาขาอารีย์, สาขาสยามสแควร์)" : "Branch Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สาขาอารีย์ ซอย 1"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "รหัสสาขา * (Branch Code เช่น 025 หรือ BKK-02)" : "Branch Code *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น BKK-02 หรือ 025"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-slate-900 uppercase font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "ที่อยู่ / ที่ตั้งสาขา" : "Branch Address"}
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น เลขที่ 12/3 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="flex-1 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmittingBranch ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{isTh ? "บันทึกสาขาใหม่" : "Save Branch"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
