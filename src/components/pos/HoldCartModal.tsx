"use client";

import { useState } from "react";
import {
  PauseCircle,
  PlayCircle,
  Trash2,
  Clock,
  User,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { CartItem } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

export interface HeldCart {
  id: string;
  heldAt: string; // e.g. "16:42"
  heldDate: string; // e.g. "2026-10-20"
  note: string; // e.g. "ลูกค้าไปหยิบไข่ไก่เพิ่ม"
  items: CartItem[];
  totalAmount: number;
  totalUnits: number;
  cashierName: string;
}

interface HoldCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldCarts: HeldCart[];
  activeCartItems: CartItem[];
  activeCartTotal: number;
  onHoldCurrentCart: (note?: string) => void;
  onRecallCart: (heldCart: HeldCart) => void;
  onDiscardHeldCart: (id: string) => void;
}

export function HoldCartModal({
  isOpen,
  onClose,
  heldCarts,
  activeCartItems,
  activeCartTotal,
  onHoldCurrentCart,
  onRecallCart,
  onDiscardHeldCart,
}: HoldCartModalProps) {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [noteInput, setNoteInput] = useState("");
  const [showNewHoldInput, setShowNewHoldInput] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(
    heldCarts[0]?.id || null
  );

  if (!isOpen) return null;

  const handleHoldCurrent = () => {
    if (activeCartItems.length === 0) return;
    onHoldCurrentCart(noteInput.trim() || undefined);
    setNoteInput("");
    setShowNewHoldInput(false);
  };

  const selectedCart = heldCarts.find((c) => c.id === selectedCartId) || heldCarts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#061a12] text-white px-6 py-4 flex items-center justify-between border-b border-[#0f3424] shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shadow-inner">
              <PauseCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  {isTh ? "ระบบพักบิล (Hold Carts / Park Bill)" : "Parked Bills (Hold Carts)"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  {heldCarts.length} {isTh ? "บิลที่พักไว้" : "Held"}
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                {isTh
                  ? "พักตะกร้าเพื่อคิดเงินลูกค้าคิวถัดไป และดึงบิลกลับมาคิดเงินต่อได้ตลอดเวลา [F6]"
                  : "Park active transaction to serve next customer. Recall anytime [F6]"}
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

        {/* Action Banner: Park Current Active Cart */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
              🛒
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">
                {isTh ? "ตะกร้าสินค้าปัจจุบันหน้าร้าน:" : "Active Register Cart:"}{" "}
                <span className="font-mono text-emerald-700 font-extrabold">
                  {activeCartItems.length} {isTh ? "รายการ" : "items"} (฿{activeCartTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })})
                </span>
              </div>
              <div className="text-[11px] text-amber-800/80">
                {activeCartItems.length > 0
                  ? (isTh ? "สามารถกดพักบิลปัจจุบันนี้เพื่อเปิดตะกร้าว่างได้ทันที" : "Ready to park this cart to serve the next customer")
                  : (isTh ? "ขณะนี้ตะกร้าหน้าร้านว่างเปล่า พร้อมดึงบิลที่พักไว้กลับมา" : "Active register is empty, ready to recall a held bill")}
              </div>
            </div>
          </div>

          {activeCartItems.length > 0 && (
            <div className="flex items-center gap-2">
              {showNewHoldInput ? (
                <div className="flex items-center gap-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleHoldCurrent();
                      if (e.key === "Escape") setShowNewHoldInput(false);
                    }}
                    placeholder={isTh ? "ระบุหมายเหตุ (เช่น ลูกค้าลืมเงินสด)..." : "Note (e.g. Forgot wallet)..."}
                    className="px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-56 shadow-inner"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleHoldCurrent}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>{isTh ? "ยืนยันพักบิล" : "Confirm"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewHoldInput(false)}
                    className="px-2 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewHoldInput(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <PauseCircle className="h-4 w-4" />
                  <span>{isTh ? "กดพักบิลปัจจุบันนี้ [F6]" : "Park Active Cart [F6]"}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Body: Left List + Right Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Held Carts List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-2.5 bg-slate-50/50">
            {heldCarts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-2xl">
                  📭
                </div>
                <div className="font-bold text-sm text-slate-700">
                  {isTh ? "ไม่มีบิลที่พักไว้ในขณะนี้" : "No Parked Bills"}
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {isTh
                    ? "เมื่อมีสินค้าในตะกร้า สามารถกดปุ่ม [F6] หรือปุ่มพักบิล เพื่อจัดเก็บตะกร้าไว้ชั่วคราวได้"
                    : "When items are in cart, press [F6] or click Park Bill to temporarily hold the cart."}
                </p>
              </div>
            ) : (
              heldCarts.map((held, idx) => {
                const isSelected = (selectedCartId || heldCarts[0]?.id) === held.id;
                return (
                  <div
                    key={held.id}
                    onClick={() => setSelectedCartId(held.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-white border-amber-400 shadow-md ring-2 ring-amber-400/30"
                        : "bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-amber-100 text-amber-800 font-mono font-black text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-900 truncate max-w-[150px]">
                          {held.note || (isTh ? `ลูกค้าคิวที่ #${idx + 1}` : `Customer #${idx + 1}`)}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-sm text-emerald-700">
                        ฿{held.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{held.heldAt} น.</span>
                      </span>
                      <span>
                        {held.items.length} {isTh ? "รายการ" : "items"} ({held.totalUnits} {isTh ? "ชิ้น" : "pcs"})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-2.5 w-2.5" />
                        <span>{held.cashierName}</span>
                      </span>
                      {isSelected && (
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          <span>{isTh ? "เลือกดู" : "Selected"}</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Held Cart Detail & Recall Actions (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between p-5 bg-white overflow-hidden">
            {selectedCart ? (
              <>
                <div className="flex-1 overflow-y-auto pr-1">
                  {/* Bill Header Info */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 mb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {selectedCart.note || (isTh ? "บิลที่พักไว้" : "Parked Bill")}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold">
                          {selectedCart.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{selectedCart.heldDate} {selectedCart.heldAt}</span>
                        <span>•</span>
                        <span>{isTh ? "แคชเชียร์:" : "Cashier:"} {selectedCart.cashierName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isTh ? "ยอดรวมทั้งสิ้น" : "Total Amount"}
                      </div>
                      <div className="text-xl font-black text-emerald-700 font-mono">
                        ฿{selectedCart.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                    <span>{isTh ? "รายการสินค้าในตะกร้านี้:" : "Items in this cart:"}</span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden mb-4">
                    {selectedCart.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.barcode}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-slate-900">
                            ฿{item.lineTotal.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.qty} × ฿{item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Recall / Discard Actions */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDiscardHeldCart(selectedCart.id)}
                    className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isTh ? "ยกเลิกบิลนี้ (Discard)" : "Discard Bill"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                    >
                      {isTh ? "ยกเลิก" : "Close"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onRecallCart(selectedCart);
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>{isTh ? "ดึงบิลกลับมาขายต่อ (Recall) [Enter]" : "Recall to Register [Enter]"}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="h-8 w-8 mb-2 text-slate-300" />
                <p className="text-xs">{isTh ? "เลือกบิลจากรายการทางซ้ายเพื่อดูรายละเอียด" : "Select a held cart on the left to view details"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
