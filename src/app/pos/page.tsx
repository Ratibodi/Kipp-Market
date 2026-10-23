"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ScanBarcode,
  Plus,
  Minus,
  Trash2,
  User,
  Tag,
  Flame,
  Coffee,
  Cookie,
  UtensilsCrossed,
  Croissant,
  Banknote,
  QrCode,
  CreditCard,
  Smartphone,
  Check,
  RotateCcw,
  Sparkles,
  Scale,
  Camera,
  Lock,
  X,
} from "lucide-react";
import { PosHeader } from "@/components/pos/PosHeader";
import { PosFooter } from "@/components/pos/PosFooter";
import { PromptPayModal } from "@/components/pos/PromptPayModal";
import { CashTenderModal } from "@/components/pos/CashTenderModal";
import { LockScreenModal } from "@/components/pos/LockScreenModal";
import { ShiftModal, ShiftState } from "@/components/pos/ShiftModal";
import { ScaleWeightModal } from "@/components/pos/ScaleWeightModal";
import { CameraScannerModal } from "@/components/pos/CameraScannerModal";
import { ManagerOverrideModal } from "@/components/pos/ManagerOverrideModal";
import { HoldCartModal, HeldCart } from "@/components/pos/HoldCartModal";
import { CustomerMemberModal } from "@/components/pos/CustomerMemberModal";
import { EditQtyModal } from "@/components/pos/EditQtyModal";
import { DiscountModal, DiscountInfo } from "@/components/pos/DiscountModal";
import { ThermalPrinterModal } from "@/components/pos/ThermalPrinterModal";
import { sounds } from "@/lib/soundEffects";
import { transliterateThaiBarcode } from "@/lib/scannerListener";
import { queueSaleForSync, initBackgroundSync } from "@/client/offline/syncWorker";
import { OutboxSale } from "@/client/offline/db";
import {
  INITIAL_CART_ITEMS,
  CartItem,
  QuickPickItem,
  MOCK_STAFF,
  StaffMember,
  CustomerMember,
  MOCK_CUSTOMERS,
  MOCK_CATALOG_PRODUCTS,
} from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function PosPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("Hot Items");

  const [selectedQuickCash, setSelectedQuickCash] = useState<number>(500);
  const [searchInput, setSearchInput] = useState<string>("");
  const [isPromptPayOpen, setIsPromptPayOpen] = useState<boolean>(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Customer Loyalty by Phone State
  const [activeCustomer, setActiveCustomer] = useState<CustomerMember | null>(MOCK_CUSTOMERS[0]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);

  // Active Session and Multi-Tenant Info
  const [sessionInfo, setSessionInfo] = useState<{
    tenantId: string;
    branchId: string;
    terminalId: string;
  }>({
    tenantId: "demo-tenant-kipp",
    branchId: "branch-bkk-024",
    terminalId: "term-01",
  });

  // New POS Operations Modals State
  const [activeStaff, setActiveStaff] = useState<StaffMember>(MOCK_STAFF[0]);

  // Sync active staff and tenant session from /api/auth/me
  useEffect(() => {
    async function syncActiveStaff() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setActiveStaff({
              id: data.user.id,
              name: data.user.displayName,
              nameEn: data.user.displayName,
              role: data.user.role,
              pin: "",
              avatar:
                data.user.role === "OWNER"
                  ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  : data.user.role === "CASHIER"
                  ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80"
                  : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
              shiftActive: true,
            });
            if (data.user.tenantId) {
              setSessionInfo({
                tenantId: data.user.tenantId,
                branchId: data.user.branchId || "branch-bkk-024",
                terminalId: data.user.terminalId || "term-01",
              });
            }
            setShiftState((prev) => ({
              ...prev,
              openedBy: data.user.displayName,
            }));
          }
        }
      } catch (err) {
        console.warn("Could not sync active staff session:", err);
      }
    }
    syncActiveStaff();
  }, []);

  const [isLockScreenOpen, setIsLockScreenOpen] = useState<boolean>(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [shiftState, setShiftState] = useState<ShiftState>({
    status: "OPEN",
    shiftId: "SHIFT-20260614-01",
    openedAt: "08:00",
    openedBy: "สมชาย พ.",
    openingCash: 2000,
    cashSales: 8420,
    qrSales: 11840,
    creditSales: 3450,
    drawerExpenses: 150,
  });
  const [isScaleModalOpen, setIsScaleModalOpen] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState<boolean>(false);
  const [overrideActionTitle, setOverrideActionTitle] = useState<string>("");
  const [overrideCallback, setOverrideCallback] = useState<(() => void) | null>(null);

  // Held Carts (Design Doc 7.15) & Sound Effects (Design Doc 7.16)
  const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(sounds.getIsMuted());
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([
    {
      id: "HELD-001",
      heldAt: "16:20",
      heldDate: "2026-10-20",
      note: "ลูกค้ารอโอนเงิน / ขอเดินไปหยิบไข่ไก่เพิ่ม",
      items: [
        {
          id: "held-mock-1",
          name: "ไข่ไก่สด เบอร์ 2 (แผง 30 ฟอง)",
          sku: "EGG-02-30",
          barcode: "8850123456789",
          unitPrice: 135.0,
          qty: 1,
          lineTotal: 135.0,
          imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=120&h=120&q=80",
          stockCount: 18,
        },
        {
          id: "held-mock-2",
          name: "น้ำมันพืช มรกต ปาล์ม 1 ลิตร",
          sku: "OIL-MKT-1L",
          barcode: "8850987654321",
          unitPrice: 48.0,
          qty: 2,
          lineTotal: 96.0,
          imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=120&h=120&q=80",
          stockCount: 42,
        },
      ],
      totalAmount: 231.0,
      totalUnits: 3,
      cashierName: "สมชาย พ.",
    },
  ]);

  // 1, 2, 5, 6 States: Selection, Qty Modal, Discount, Printer & Drawer
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(
    INITIAL_CART_ITEMS[0]?.id || null
  );
  const [isQtyModalOpen, setIsQtyModalOpen] = useState<boolean>(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);
  const [activeDiscount, setActiveDiscount] = useState<DiscountInfo | null>(null);
  const [isThermalModalOpen, setIsThermalModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Monitor real-time online status
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cart calculations with Discount deduction
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const totalUnits = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalItemsCount = cartItems.length;

  const discountAmount = activeDiscount
    ? activeDiscount.type === "PERCENT"
      ? Number(((rawSubtotal * activeDiscount.value) / 100).toFixed(2))
      : Math.min(rawSubtotal, activeDiscount.value)
    : 0;

  const totalAmount = Math.max(0, Number((rawSubtotal - discountAmount).toFixed(2)));
  const vatExcl = totalAmount / 1.07;
  const vatAmount = totalAmount - vatExcl;
  const changeDue = Math.max(0, selectedQuickCash - totalAmount);

  // Currently selected item for F4 / Delete
  const selectedCartItem =
    cartItems.find((it) => it.id === selectedCartItemId) ||
    cartItems[0] ||
    null;

  // Handlers for cart
  const handleUpdateQty = (id: string, delta: number) => {
    if (delta > 0) {
      sounds.playScanBeep();
    }
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.qty + delta);
            return {
              ...item,
              qty: newQty,
              lineTotal: Number((newQty * item.unitPrice).toFixed(2)),
            };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // Feature 1: Edit Qty via F4 Modal
  const handleEditQty = (id: string, newQty: number) => {
    sounds.playScanBeep();
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            qty: newQty,
            lineTotal: Number((newQty * item.unitPrice).toFixed(2)),
          };
        }
        return item;
      })
    );
    setSuccessToast(isTh ? `ปรับจำนวนเป็น ${newQty} ชิ้นเรียบร้อย` : `Updated qty to ${newQty}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Feature 2: Void Selected Line via Del
  const handleVoidLine = () => {
    if (cartItems.length === 0) {
      setSuccessToast(isTh ? "ไม่มีรายการสินค้าในตะกร้า" : "Cart is empty");
      setTimeout(() => setSuccessToast(null), 2000);
      return;
    }

    const itemToVoid =
      cartItems.find((it) => it.id === selectedCartItemId) || cartItems[0];

    if (!itemToVoid) return;

    sounds.playErrorBuzzer();
    const remaining = cartItems.filter((it) => it.id !== itemToVoid.id);
    setCartItems(remaining);
    setSelectedCartItemId(remaining[0]?.id || null);

    setSuccessToast(
      isTh
        ? `ลบรายการ "${itemToVoid.name}" ออกจากบิลแล้ว [Del]`
        : `Voided line: ${itemToVoid.name} [Del]`
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Feature 6: Kick Cash Drawer
  const handleKickDrawer = () => {
    sounds.playCashDrawer();
    setIsDrawerOpen(true);
    setSuccessToast(isTh ? "เด้งเปิดลิ้นชักเก็บเงินแล้ว (Kick Drawer)" : "Cash drawer kicked open!");
    setTimeout(() => {
      setIsDrawerOpen(false);
      setSuccessToast(null);
    }, 3500);
  };

  const handleRemoveItem = (id: string) => {
    sounds.playErrorBuzzer();
    const remaining = cartItems.filter((item) => item.id !== id);
    setCartItems(remaining);
    if (selectedCartItemId === id) {
      setSelectedCartItemId(remaining[0]?.id || null);
    }
  };

  const handleClearCart = () => {
    // If cashier is not manager, require Manager Override
    if (activeStaff.role === "CASHIER" && cartItems.length > 0) {
      setOverrideActionTitle(isTh ? "ขอยกเลิกตะกร้าสินค้าทั้งหมด (Clear Cart)" : "Void Active Shopping Cart");
      setOverrideCallback(() => () => {
        sounds.playErrorBuzzer();
        setCartItems([]);
      });
      setIsOverrideModalOpen(true);
    } else {
      sounds.playErrorBuzzer();
      setCartItems([]);
    }
  };

  const handleResetCart = () => {
    sounds.playScanBeep();
    setCartItems(INITIAL_CART_ITEMS);
  };

  const handleAddQuickPick = (qp: QuickPickItem) => {
    sounds.playScanBeep();
    setCartItems((prev) => {
      const existing = prev.find((item) => item.name === qp.name);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                qty: item.qty + 1,
                lineTotal: Number(((item.qty + 1) * item.unitPrice).toFixed(2)),
              }
            : item
        );
      }
      const newItem: CartItem = {
        id: `qp-added-${Date.now()}`,
        name: qp.name,
        sku: `PLU-${qp.plu}`,
        barcode: `885${qp.plu}0001`,
        unitPrice: qp.price,
        qty: 1,
        lineTotal: qp.price,
        imageUrl: qp.imageUrl,
        categoryTag: qp.category,
        stockCount: 20,
      };
      return [...prev, newItem];
    });
  };

  // Add weight item from Scale Weight Modal
  const handleAddWeightItem = (item: {
    id: string;
    name: string;
    unitPrice: number;
    weightKg: number;
    totalAmount: number;
    barcode: string;
  }) => {
    sounds.playScanBeep();
    const newItem: CartItem = {
      id: item.id,
      name: item.name,
      sku: `SCALE-${item.barcode.slice(2, 7)}`,
      barcode: item.barcode,
      unitPrice: item.unitPrice,
      qty: item.weightKg,
      lineTotal: item.totalAmount,
      categoryTag: "Meat & Fresh",
      stockCount: 15,
      badge: "Weighed",
      imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=120&h=120&q=80",
    };
    setCartItems((prev) => [...prev, newItem]);
    setSuccessToast(isTh ? `เพิ่มสินค้าชั่งน้ำหนัก ${item.name} สำเร็จ` : `Added weighted item ${item.name}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Barcode scanned from camera
  const handleCameraScan = (barcode: string) => {
    handleBarcodeScanned(barcode);
  };

  // Held Cart Handlers (Design Doc 7.15)
  const handleHoldCurrentCart = (customNote?: string) => {
    if (cartItems.length === 0) {
      sounds.playErrorBuzzer();
      setSuccessToast(isTh ? "ตะกร้าว่างเปล่า ไม่สามารถพักบิลได้" : "Cart is empty, cannot park bill");
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const newHeld: HeldCart = {
      id: `HELD-${Date.now().toString().slice(-4)}`,
      heldAt: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      heldDate: new Date().toLocaleDateString("en-CA"),
      note: customNote || (isTh ? `ลูกค้าคิว #${heldCarts.length + 1}` : `Customer #${heldCarts.length + 1}`),
      items: [...cartItems],
      totalAmount,
      totalUnits,
      cashierName: isTh ? activeStaff.name : activeStaff.nameEn,
    };
    setHeldCarts((prev) => [newHeld, ...prev]);
    setCartItems([]);
    sounds.playHoldSound();
    setSuccessToast(isTh ? "พักบิลสำเร็จ [F6] — เปิดตะกร้าว่างสำหรับลูกค้ารายใหม่แล้ว" : "Cart parked successfully [F6]");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleRecallCart = (heldCart: HeldCart) => {
    if (cartItems.length > 0) {
      // Auto-park current cart before restoring
      const currentParked: HeldCart = {
        id: `HELD-${Date.now().toString().slice(-4)}`,
        heldAt: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        heldDate: new Date().toLocaleDateString("en-CA"),
        note: isTh ? "พักอัตโนมัติก่อนดึงบิลอื่น" : "Auto-parked before recall",
        items: [...cartItems],
        totalAmount,
        totalUnits,
        cashierName: isTh ? activeStaff.name : activeStaff.nameEn,
      };
      setHeldCarts((prev) => [currentParked, ...prev.filter((c) => c.id !== heldCart.id)]);
    } else {
      setHeldCarts((prev) => prev.filter((c) => c.id !== heldCart.id));
    }
    setCartItems(heldCart.items);
    sounds.playRecallSound();
    setSuccessToast(
      isTh
        ? `ดึงบิลกลับมาสำเร็จ (${heldCart.items.length} รายการ - ฿${heldCart.totalAmount.toFixed(2)})`
        : `Recalled parked cart (${heldCart.items.length} items)`
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDiscardHeldCart = (id: string) => {
    setHeldCarts((prev) => prev.filter((c) => c.id !== id));
    sounds.playErrorBuzzer();
    setSuccessToast(isTh ? "ยกเลิกบิลที่พักไว้เรียบร้อย" : "Held cart discarded");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleSoundMute = () => {
    const muted = sounds.toggleMute();
    setIsSoundMuted(muted);
    if (!muted) {
      sounds.playScanBeep();
    }
  };

  // Barcode Scanner Buffer & Timing Refs
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  // Core Barcode Scan Handler (supports Thai Kedmanee auto-transliteration & Scale barcodes)
  const handleBarcodeScanned = (rawBarcode: string) => {
    const cleanBarcode = transliterateThaiBarcode(rawBarcode).trim();
    if (!cleanBarcode || cleanBarcode.length < 3) return;

    sounds.playScanBeep();

    // 1. Check if matches existing item in active cart
    const foundInCart = cartItems.find(
      (it) => it.barcode === cleanBarcode || it.sku.toLowerCase() === cleanBarcode.toLowerCase()
    );
    if (foundInCart) {
      handleUpdateQty(foundInCart.id, 1);
      setSuccessToast(
        isTh
          ? `สแกนสำเร็จ: ${foundInCart.name} (+1 ชิ้น)`
          : `Scanned: ${foundInCart.name} (+1)`
      );
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    // 2. Check if matches Catalog Products
    const catalogMatch = MOCK_CATALOG_PRODUCTS.find(
      (it) =>
        it.barcode === cleanBarcode ||
        it.sku.toLowerCase() === cleanBarcode.toLowerCase() ||
        it.plu === cleanBarcode ||
        it.nameTh.toLowerCase() === cleanBarcode.toLowerCase() ||
        it.nameEn.toLowerCase() === cleanBarcode.toLowerCase()
    );
    if (catalogMatch) {
      setCartItems((prev) => [
        {
          id: `scanned-${Date.now()}`,
          name: isTh ? catalogMatch.nameTh : catalogMatch.nameEn,
          sku: catalogMatch.sku,
          barcode: catalogMatch.barcode,
          unitPrice: catalogMatch.price,
          qty: 1,
          lineTotal: catalogMatch.price,
          imageUrl: catalogMatch.imageUrl,
          categoryTag: catalogMatch.category,
          stockCount: catalogMatch.stockQty,
        },
        ...prev,
      ]);
      setSuccessToast(
        isTh
          ? `สแกนสำเร็จ: ${isTh ? catalogMatch.nameTh : catalogMatch.nameEn} (฿${catalogMatch.price.toFixed(2)})`
          : `Scanned: ${catalogMatch.nameEn} (฿${catalogMatch.price.toFixed(2)})`
      );
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    // 3. Check if matches initial items mock
    const mockMatch = INITIAL_CART_ITEMS.find(
      (it) => it.barcode === cleanBarcode || it.sku.toLowerCase() === cleanBarcode.toLowerCase()
    );
    if (mockMatch) {
      setCartItems((prev) => [
        {
          ...mockMatch,
          id: `scanned-${Date.now()}`,
          qty: 1,
          lineTotal: mockMatch.unitPrice,
        },
        ...prev,
      ]);
      setSuccessToast(
        isTh
          ? `สแกนสำเร็จ: ${mockMatch.name} (฿${mockMatch.unitPrice.toFixed(2)})`
          : `Scanned: ${mockMatch.name} (฿${mockMatch.unitPrice.toFixed(2)})`
      );
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    // 4. Scale Barcode embedded EAN-13 (Prefix 20-29) e.g., 2000105001256 (PLU 105, 1.250kg)
    if (
      cleanBarcode.length === 13 &&
      (cleanBarcode.startsWith("20") || cleanBarcode.startsWith("21") || cleanBarcode.startsWith("22"))
    ) {
      const plu = cleanBarcode.substring(2, 7);
      const weightGrams = parseInt(cleanBarcode.substring(7, 12), 10) || 1000;
      const weightKg = Number((weightGrams / 1000).toFixed(3));
      
      const pluMatch = MOCK_CATALOG_PRODUCTS.find((p) => p.plu === plu || p.plu === parseInt(plu, 10).toString());
      const productName = pluMatch ? (isTh ? pluMatch.nameTh : pluMatch.nameEn) : `สินค้าชั่งน้ำหนัก (PLU #${plu})`;
      const pricePerKg = pluMatch ? pluMatch.price : 180.0;
      const total = Number((weightKg * pricePerKg).toFixed(2));
      handleAddWeightItem({
        id: `scale-${Date.now()}`,
        name: productName,
        unitPrice: pricePerKg,
        weightKg,
        totalAmount: total,
        barcode: cleanBarcode,
      });
      return;
    }

    // 4. Generic scanned product
    const genericItem: CartItem = {
      id: `barcode-${Date.now()}`,
      name: isTh ? `สินค้าบาร์โค้ด [${cleanBarcode}]` : `Scanned Item [${cleanBarcode}]`,
      sku: cleanBarcode.slice(0, 10),
      barcode: cleanBarcode,
      unitPrice: 35.0,
      qty: 1,
      lineTotal: 35.0,
      categoryTag: "Scanned",
      stockCount: 50,
      imageUrl:
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=120&h=120&q=80",
    };
    setCartItems((prev) => [genericItem, ...prev]);
    setSuccessToast(
      isTh
        ? `ยิงบาร์โค้ด [${cleanBarcode}] สำเร็จ — เพิ่มลงตะกร้าแล้ว`
        : `Scanned barcode [${cleanBarcode}] added to cart`
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Keyboard hotkeys & Global Barcode Scanner Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept hotkeys if modal is open
      if (
        isPromptPayOpen ||
        isCashModalOpen ||
        isLockScreenOpen ||
        isShiftModalOpen ||
        isScaleModalOpen ||
        isCameraModalOpen ||
        isOverrideModalOpen ||
        isHoldModalOpen ||
        isCustomerModalOpen ||
        isQtyModalOpen ||
        isDiscountModalOpen ||
        isThermalModalOpen
      ) {
        return;
      }

      // If user is currently focused on an input element, let the input handle it
      const target = e.target as HTMLElement | null;
      const isInputFocused = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      // Check for Function Hotkeys
      if (e.key === "F10") {
        e.preventDefault();
        setIsPromptPayOpen(true);
        return;
      } else if (e.key === "F9") {
        e.preventDefault();
        setIsCashModalOpen(true);
        return;
      } else if (e.key === "F8") {
        e.preventDefault();
        setIsShiftModalOpen(true);
        return;
      } else if (e.key === "F7") {
        e.preventDefault();
        setIsCustomerModalOpen(true);
        return;
      } else if (e.key === "F6") {
        e.preventDefault();
        setIsHoldModalOpen(true);
        return;
      } else if (e.key === "F5") {
        e.preventDefault();
        setIsDiscountModalOpen(true);
        return;
      } else if (e.key === "F4") {
        e.preventDefault();
        if (cartItems.length > 0) {
          setIsQtyModalOpen(true);
        }
        return;
      } else if (e.key === "F2") {
        e.preventDefault();
        setIsScaleModalOpen(true);
        return;
      } else if (e.key === "F3") {
        e.preventDefault();
        setIsCameraModalOpen(true);
        return;
      } else if (e.key === "F12") {
        e.preventDefault();
        setIsLockScreenOpen(true);
        return;
      } else if (e.key === "Delete") {
        if (!isInputFocused) {
          e.preventDefault();
          handleVoidLine();
          return;
        }
      }

      // Global Barcode Scanner Fast-Buffer Detection (< 60ms between characters)
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (barcodeBufferRef.current.length >= 3) {
          e.preventDefault();
          const scannedCode = barcodeBufferRef.current;
          barcodeBufferRef.current = "";
          handleBarcodeScanned(scannedCode);
          return;
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // If keystrokes are spaced out (human typing without input focus), reset buffer
        if (timeDiff > 120 && barcodeBufferRef.current.length > 0) {
          barcodeBufferRef.current = "";
        }
        if (!isInputFocused) {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPromptPayOpen,
    isCashModalOpen,
    isLockScreenOpen,
    isShiftModalOpen,
    isScaleModalOpen,
    isCameraModalOpen,
    isOverrideModalOpen,
    isHoldModalOpen,
    isCustomerModalOpen,
    isQtyModalOpen,
    isDiscountModalOpen,
    isThermalModalOpen,
    selectedCartItemId,
    cartItems,
  ]);

  // Initialize Outbox Sync Worker (Design Doc 7.2)
  useEffect(() => {
    const cleanup = initBackgroundSync();
    return () => cleanup();
  }, []);

  const handlePaymentSuccess = (customTendered?: number, customChange?: number) => {
    sounds.playSuccessChime();
    setIsPromptPayOpen(false);
    setIsCashModalOpen(false);

    const cashReceivedVal = customTendered ?? selectedQuickCash;
    const changeVal = customChange ?? changeDue;

    // Queue Outbox Sale into IndexedDB Outbox (Design Doc 7.2)
    if (cartItems.length > 0) {
      const outboxItems = cartItems.map((item) => ({
        productId: item.id.replace("item-", "prod-").replace("scanned-", "prod-"),
        nameSnapshot: item.name,
        barcodeSnapshot: item.barcode,
        qty: item.qty.toString(),
        unitPrice: item.unitPrice.toString(),
        lineTotal: item.lineTotal.toString(),
      }));

      const outboxSale: OutboxSale = {
        id: `sale-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        tenantId: sessionInfo.tenantId,
        branchId: sessionInfo.branchId,
        terminalId: sessionInfo.terminalId,
        shiftId: shiftState.shiftId,
        cashierId: activeStaff.id,
        receiptNo: `#TRX-${Math.floor(1000 + Math.random() * 9000)}`,
        total: totalAmount.toString(),
        paymentMethod: isPromptPayOpen ? "PROMPTPAY" : "CASH",
        cashReceived: cashReceivedVal.toString(),
        change: changeVal.toString(),
        receiptToken: `rcpt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        soldAt: new Date().toISOString(),
        customerId: activeCustomer?.id,
        status: "pending",
        retryCount: 0,
        items: outboxItems,
      };

      queueSaleForSync(outboxSale).catch((err) =>
        console.warn("Could not queue outbox sale:", err)
      );
    }

    setCartItems([]);
    setActiveDiscount(null);
    setSelectedCartItemId(null);
    const pointsEarned = Math.max(1, Math.floor(totalAmount / 10));
    setSuccessToast(
      activeCustomer
        ? isTh
          ? `ชำระเงินสำเร็จ! สมาชิก ${activeCustomer.name} ได้รับ +${pointsEarned} แต้มสะสม (บันทึกลง Outbox พร้อมซิงก์)`
          : `Payment Settled! ${activeCustomer.name} earned +${pointsEarned} points (Queued in Outbox)`
        : isTh
        ? "ชำระเงินสำเร็จ! สลิปถูกบันทึกลง Outbox พร้อมซิงก์ขึ้นเซิร์ฟเวอร์"
        : "Payment Settled Successfully! Queued in Outbox & Syncing."
    );
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f3] text-slate-800 font-sans overflow-hidden select-none">
      {/* Top POS Header */}
      <PosHeader
        onCloseShift={() => {
          sounds.playCashDrawer();
          setIsShiftModalOpen(true);
        }}
        onLockScreen={() => setIsLockScreenOpen(true)}
        activeStaffName={isTh ? activeStaff.name : activeStaff.nameEn}
        activeStaffRole={activeStaff.role}
        heldCartsCount={heldCarts.length}
        onOpenHeldCarts={() => setIsHoldModalOpen(true)}
        isMuted={isSoundMuted}
        onToggleMute={handleToggleSoundMute}
      />

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center shadow-md animate-fade-in flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Barcode Search & Fast-Pick Categories Bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 shadow-2xs shrink-0 flex flex-col gap-2">
        {/* Row 1: Search Bar & Actions */}
        <div className="flex items-center gap-3">
          {/* Barcode Search Input */}
          <div className="flex-1 relative flex items-center">
            <ScanBarcode className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              id="pos-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchInput.trim()) {
                  e.preventDefault();
                  handleBarcodeScanned(searchInput.trim());
                  setSearchInput("");
                }
              }}
              placeholder={t("pos.searchPlaceholder")}
              className="w-full pl-10 pr-28 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono font-bold text-[10px]">
                F2
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {t("pos.usbReady")}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Camera Scan Button */}
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              title={isTh ? "สแกนด้วยกล้องมือถือ/แท็บเล็ต [F3]" : "Camera Scanner [F3]"}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-800 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5 text-cyan-600" />
              <span>{isTh ? "กล้อง [F3]" : "Camera [F3]"}</span>
            </button>

            {/* Weighing Scale Button */}
            <button
              type="button"
              onClick={() => setIsScaleModalOpen(true)}
              title={isTh ? "ชั่งน้ำหนักเนื้อสัตว์/ผักผลไม้ [F2]" : "Weighing Scale [F2]"}
              className="px-2.5 py-1.5 rounded-xl bg-lime-50 hover:bg-lime-100 border border-lime-300 text-lime-900 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <Scale className="h-3.5 w-3.5 text-lime-700" />
              <span>{isTh ? "ชั่งน้ำหนัก [F2]" : "Scale [F2]"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (cartItems.length > 0) {
                  setIsQtyModalOpen(true);
                } else {
                  setSuccessToast(isTh ? "กรุณาสแกนหรือเลือกสินค้าก่อนเปลี่ยนจำนวน [F4]" : "Please add an item first");
                  setTimeout(() => setSuccessToast(null), 2500);
                }
              }}
              title={isTh ? "เปลี่ยนจำนวนสินค้า [F4]" : "Edit Quantity [F4]"}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center"
            >
              <strong className="text-emerald-700 font-mono mr-1">F4</strong> {t("pos.editQty")}
            </button>
            <button
              type="button"
              onClick={() => setIsHoldModalOpen(true)}
              title={isTh ? "พักบิลและเรียกดูบิลที่พักไว้ [F6]" : "Hold & Recall Carts [F6]"}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                heldCarts.length > 0
                  ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
            >
              <strong className="text-amber-600 font-mono mr-1">F6</strong>
              <span>
                {isTh
                  ? `พักบิล ${heldCarts.length > 0 ? `(${heldCarts.length})` : ""}`
                  : `Hold ${heldCarts.length > 0 ? `(${heldCarts.length})` : ""}`}
              </span>
            </button>
            <button
              type="button"
              onClick={handleClearCart}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold transition"
            >
              <strong className="font-mono mr-1">F8</strong> {t("pos.clearCart")}
            </button>
            {cartItems.length === 0 && (
              <button
                type="button"
                onClick={handleResetCart}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold transition flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                {t("pos.restoreMock")}
              </button>
            )}
          </div>
        </div>

        {/* Row 2: FAST PICK Category Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mr-1">
            {t("pos.fastPick")}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory("Hot Items")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedCategory === "Hot Items"
                  ? "bg-[#061a12] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              {t("pos.hotItems")}
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("Bakery & Fresh")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedCategory === "Bakery & Fresh"
                  ? "bg-[#061a12] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Croissant className="h-3.5 w-3.5 text-amber-600" />
              {t("pos.bakeryFresh")}
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("Beverages")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedCategory === "Beverages"
                  ? "bg-[#061a12] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Coffee className="h-3.5 w-3.5 text-sky-600" />
              {t("pos.beverages")}
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("Snacks")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedCategory === "Snacks"
                  ? "bg-[#061a12] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Cookie className="h-3.5 w-3.5 text-orange-600" />
              {t("pos.snacks")}
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("Ready Meal")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedCategory === "Ready Meal"
                  ? "bg-[#061a12] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <UtensilsCrossed className="h-3.5 w-3.5 text-rose-500" />
              {t("pos.readyMeal")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Body: 2 Columns */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Cart Table (~65% width / 8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cart Header Row */}
          <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <span className="text-base font-black text-slate-900 font-mono">#TRX-9481</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#061a12] text-white text-xs font-bold font-mono">
                {totalItemsCount} {isTh ? "รายการ" : "Items"} ({totalUnits} {isTh ? "ชิ้น" : "Units"})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeCustomer ? (
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-3 py-1 rounded-full bg-emerald-50 border-2 border-emerald-500 text-xs font-bold text-emerald-900 flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-emerald-100 transition"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>👤 {activeCustomer.name}</span>
                  <span className="font-mono text-[11px] text-emerald-700">({activeCustomer.phone})</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-[10px] text-emerald-900 font-mono font-black">
                    {activeCustomer.pointsBalance} {isTh ? "แต้ม" : "pts"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-emerald-50/60 border border-slate-300 hover:border-emerald-500 text-xs font-semibold text-slate-700 hover:text-emerald-900 flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                >
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>{isTh ? "สมาชิกลูกค้าทั่วไป (กดใส่เบอร์)" : "Walk-in (Add Phone)"}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold px-1 rounded bg-slate-100">F7</span>
                </button>
              )}

              <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                <Tag className="h-3 w-3" />
                <span>
                  {activeCustomer
                    ? `+${Math.max(1, Math.floor(totalAmount / 10))} ${isTh ? "แต้มสะสม" : "pts"}`
                    : t("pos.tier1Earn")}
                </span>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 grid grid-cols-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-6">{t("pos.itemDescription")}</div>
            <div className="col-span-2 text-right">{t("pos.unitPrice")}</div>
            <div className="col-span-2 text-center">{t("pos.qty")}</div>
            <div className="col-span-2 text-right pr-2">{t("pos.lineTotal")}</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {cartItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedCartItemId(item.id)}
                className={`px-5 py-3 grid grid-cols-12 items-center hover:bg-slate-50 transition cursor-pointer ${
                  selectedCartItemId === item.id
                    ? "border-l-4 border-l-emerald-600 bg-emerald-50/40 shadow-2xs"
                    : idx === 0 && !selectedCartItemId
                    ? "border-l-4 border-l-emerald-500 bg-emerald-50/20"
                    : ""
                }`}
              >
                {/* Description & Barcode (6 cols) */}
                <div className="col-span-6 flex items-center gap-3 pr-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs leading-snug">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                            item.badge === "NEW"
                              ? "bg-lime-200 text-lime-900 border border-lime-300"
                              : item.badge === "Warmed Up"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                      <span>{item.barcode}</span>
                      {item.categoryTag && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">{item.categoryTag}</span>
                        </>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 text-[10px] font-semibold">
                        {t("pos.inStock")}: {item.stockCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Unit Price (2 cols) */}
                <div className="col-span-2 text-right font-black font-mono text-slate-900 text-sm">
                  ฿{item.unitPrice.toFixed(2)}
                </div>

                {/* Qty Stepper (2 cols) */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="px-2.5 py-1 hover:bg-slate-100 text-slate-600 transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 font-mono font-black text-slate-900 text-xs">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="px-2.5 py-1 hover:bg-slate-100 text-slate-600 transition"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Line Total & Delete (2 cols) */}
                <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                  <span className="font-black font-mono text-slate-950 text-sm">
                    ฿{item.lineTotal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <ScanBarcode className="h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-600">{t("pos.cartEmpty")}</p>
                <p>{t("pos.cartEmptyDesc")}</p>
              </div>
            )}
          </div>

          {/* Cart Bottom Actions Row */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (cartItems.length > 0) {
                    setIsQtyModalOpen(true);
                  } else {
                    setSuccessToast(isTh ? "กรุณาสแกนหรือเลือกสินค้าก่อนเปลี่ยนจำนวน [F4]" : "Please add an item first");
                    setTimeout(() => setSuccessToast(null), 2500);
                  }
                }}
                title={isTh ? "เปลี่ยนจำนวนสินค้า [F4]" : "Change Quantity [F4]"}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center"
              >
                <strong className="text-emerald-700 font-mono mr-1">F4</strong> {t("pos.changeQty")}
              </button>
              <button
                type="button"
                onClick={handleVoidLine}
                title={isTh ? "ลบรายการที่เลือก [Del]" : "Void Selected Line [Del]"}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 text-red-600 text-xs font-semibold transition cursor-pointer flex items-center"
              >
                <strong className="text-red-600 font-mono mr-1">Del</strong> {t("pos.voidLine")}
              </button>
              <button
                type="button"
                onClick={() => setIsHoldModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-300 hover:border-amber-300 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <strong className="text-amber-600 font-mono mr-1">F6</strong>
                <span>{isTh ? `พักบิล (${heldCarts.length})` : `Hold (${heldCarts.length})`}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-[#061a12] text-xs font-black shadow-sm transition cursor-pointer flex items-center gap-1"
              >
                <strong className="font-mono mr-1">F7</strong>
                <span>
                  {activeCustomer
                    ? `สมาชิก: ${activeCustomer.name}`
                    : (isTh ? "สมาชิกสะสมแต้ม [F7]" : "Loyalty Member [F7]")}
                </span>
              </button>
              <button
                type="button"
                onClick={handleClearCart}
                className="px-3.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition"
              >
                <strong className="font-mono mr-1">F8</strong> {t("pos.voidTrans")}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout & Tender Summary (~35% width / 4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 overflow-y-auto">
          {/* Card 1: Total Amount Due */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t("pos.totalAmountDue")}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono">
                {t("pos.currencyThb")}
              </span>
            </div>

            <div className="mt-2 text-4xl font-black text-slate-950 font-mono tracking-tight flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-500">฿</span>
              {totalAmount.toFixed(2)}
            </div>

            {/* Breakdown */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>{t("pos.subtotalExclVat")}</span>
                <span className="font-mono text-slate-800">฿{vatExcl.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("pos.vat7")}</span>
                <span className="font-mono text-slate-800">฿{vatAmount.toFixed(2)}</span>
              </div>
              <div
                onClick={() => setIsDiscountModalOpen(true)}
                className="flex justify-between items-center text-emerald-700 cursor-pointer p-1 -mx-1 rounded-lg hover:bg-emerald-50/80 transition group"
                title={isTh ? "คลิกเพื่อใส่ส่วนลดหรือคูปอง [F5]" : "Click to apply discount [F5]"}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-emerald-600" />
                  <span className="font-semibold">{t("pos.memberDiscount")}</span>
                  {activeDiscount ? (
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded border border-emerald-300">
                      {activeDiscount.label}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono group-hover:text-emerald-700">
                      [F5]
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold">
                    {discountAmount > 0 ? `-฿${discountAmount.toFixed(2)}` : "-฿0.00"}
                  </span>
                  {activeDiscount && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDiscount(null);
                        setSuccessToast(isTh ? "ยกเลิกส่วนลดแล้ว" : "Discount removed");
                        setTimeout(() => setSuccessToast(null), 2500);
                      }}
                      className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>{t("pos.grandTotalNet")}</span>
                <span className="font-mono text-sm">฿{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cash Tendered & Quick Keys */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t("pos.cashTendered")}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{t("pos.quickCashKey")}</span>
            </div>

            {/* 4 Quick Cash Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[totalAmount, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelectedQuickCash(val)}
                  className={`py-2 rounded-xl text-xs font-black font-mono transition shadow-2xs ${
                    selectedQuickCash === val
                      ? "bg-[#061a12] text-white ring-2 ring-emerald-500/50"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  ฿{val.toFixed(0)}
                </button>
              ))}
            </div>

            {/* Received Row */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs font-semibold text-slate-600">{t("pos.received")}</span>
              <span className="text-xl font-black text-slate-950 font-mono">
                ฿{selectedQuickCash.toFixed(2)}
              </span>
            </div>

            {/* Change Due Green Banner */}
            <div className="p-3.5 rounded-2xl bg-[#a3e635] text-[#061a12] border border-[#84cc16] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#143d2c]">
                    {t("pos.changeDue")}
                  </div>
                  <div className="text-[11px] font-medium text-[#0f3424]">{t("pos.returnToCustomer")}</div>
                </div>
                <div className="text-3xl font-black font-mono tracking-tight text-[#061a12]">
                  ฿{changeDue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            {/* 1. Cash Tender [F9] */}
            <button
              type="button"
              onClick={() => {
                sounds.playCashDrawer();
                setIsCashModalOpen(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black text-sm shadow-md transition flex items-center justify-between px-5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-[#061a12]" />
                <span className="text-base tracking-tight">{t("pos.cashTenderBtn")}</span>
                <span className="font-mono text-xs opacity-80">฿{totalAmount.toFixed(2)}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-black/15 text-xs font-mono font-bold">
                [F9]
              </span>
            </button>

            {/* 2. Thai PromptPay QR [F10] */}
            <button
              type="button"
              onClick={() => {
                sounds.playScanBeep();
                setIsPromptPayOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-[#061a12] hover:bg-[#0b291d] text-white font-bold text-sm shadow-md transition flex items-center justify-between px-5 cursor-pointer border border-[#143d2c]"
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="h-4 w-4 text-emerald-400" />
                <span>{t("pos.promptpayQrBtn")}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono font-bold text-slate-300">
                [F10]
              </span>
            </button>

            {/* 3. Credit Card & TrueMoney */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-slate-600" />
                  <span>{t("pos.creditCardBtn")}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">[F11]</span>
              </button>

              <button
                type="button"
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-slate-600" />
                  <span>{t("pos.trueMoneyBtn")}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">[F12]</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar & Hotkeys */}
      <PosFooter
        isDrawerOpen={isDrawerOpen}
        onKickDrawer={handleKickDrawer}
        onTestPrint={() => setIsThermalModalOpen(true)}
        onSyncOutbox={() => {
          sounds.playScanBeep();
          setSuccessToast(isTh ? "สถานะการเชื่อมต่อ: ซิงก์ข้อมูลสด (Live Cloud Ready)" : "Cloud Sync Live 100%");
          setTimeout(() => setSuccessToast(null), 2500);
        }}
        isOnline={isOnline}
        outboxPendingCount={0}
      />

      {/* Thai PromptPay QR Flow Modal (Screenshot 1) */}
      <PromptPayModal
        isOpen={isPromptPayOpen}
        onClose={() => setIsPromptPayOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={totalAmount}
        trxId="#TRX-9481"
      />

      {/* Cash Tender & Quick-Pick Drawer Modal (Screenshot 5) */}
      <CashTenderModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        onCompleteSale={handlePaymentSuccess}
        onOpenPromptPay={() => {
          setIsCashModalOpen(false);
          setIsPromptPayOpen(true);
        }}
        onAddQuickPickItem={handleAddQuickPick}
        totalAmount={totalAmount}
        trxId="#TRX-9481"
      />

      {/* Lock Screen PIN Modal (Design Doc 5.2/5.3) */}
      <LockScreenModal
        isOpen={isLockScreenOpen}
        onUnlock={(staff) => {
          setActiveStaff(staff);
          setIsLockScreenOpen(false);
          setSuccessToast(isTh ? `ยินดีต้อนรับ ${staff.name}` : `Welcome back ${staff.nameEn}`);
          setTimeout(() => setSuccessToast(null), 3000);
        }}
      />

      {/* Shift & Cash Drawer Modal (Design Doc 7.10) */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftState={shiftState}
        onUpdateShift={(updated) => setShiftState(updated)}
      />

      {/* Weighing Scale Modal (Design Doc 7.11) */}
      <ScaleWeightModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        onAddWeightItem={handleAddWeightItem}
      />

      {/* Camera Barcode Scanner Modal (Design Doc 7.12) */}
      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onScanSuccess={handleCameraScan}
      />

      {/* Manager Override Modal (Design Doc 5.4/7.5) */}
      <ManagerOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        actionTitle={overrideActionTitle}
        onApproved={() => {
          if (overrideCallback) {
            overrideCallback();
          }
          sounds.playSuccessChime();
          setSuccessToast(isTh ? "ผู้จัดการอนุมัติสำเร็จ (Manager Override Approved)" : "Manager Override Approved");
          setTimeout(() => setSuccessToast(null), 3000);
        }}
      />

      {/* Hold Cart Modal (Design Doc 7.15 [F6]) */}
      <HoldCartModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        heldCarts={heldCarts}
        activeCartItems={cartItems}
        activeCartTotal={totalAmount}
        onHoldCurrentCart={handleHoldCurrentCart}
        onRecallCart={handleRecallCart}
        onDiscardHeldCart={handleDiscardHeldCart}
      />

      {/* Customer Loyalty Member Modal (Phone Loyalty [F7]) */}
      <CustomerMemberModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        activeCustomer={activeCustomer}
        onSelectCustomer={(cust) => {
          setActiveCustomer(cust);
          if (cust) {
            setSuccessToast(isTh ? `ผูกสมาชิกลูกค้า ${cust.name} (${cust.phone}) สำเร็จ` : `Attached member ${cust.name}`);
          } else {
            setSuccessToast(isTh ? "เปลี่ยนเป็นลูกค้ารายย่อยทั่วไปแล้ว" : "Switched to walk-in customer");
          }
          setTimeout(() => setSuccessToast(null), 3000);
        }}
        cartTotal={totalAmount}
      />

      {/* Feature 1: Change Quantity Modal [F4] */}
      <EditQtyModal
        isOpen={isQtyModalOpen}
        onClose={() => setIsQtyModalOpen(false)}
        targetItem={selectedCartItem}
        onConfirmQty={handleEditQty}
      />

      {/* Feature 5: Member Discount & Promo Coupon Modal [F5] */}
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={rawSubtotal}
        activeDiscount={activeDiscount}
        onApplyDiscount={(disc) => {
          setActiveDiscount(disc);
          sounds.playSuccessChime();
          setSuccessToast(isTh ? `ใช้ส่วนลด "${disc.label}" สำเร็จ` : `Applied: ${disc.label}`);
          setTimeout(() => setSuccessToast(null), 3000);
        }}
        onClearDiscount={() => {
          setActiveDiscount(null);
          setSuccessToast(isTh ? "ยกเลิกส่วนลดเรียบร้อยแล้ว" : "Discount removed");
          setTimeout(() => setSuccessToast(null), 2500);
        }}
      />

      {/* Feature 6: Thermal Slip Printer Test & Preview Modal */}
      <ThermalPrinterModal
        isOpen={isThermalModalOpen}
        onClose={() => setIsThermalModalOpen(false)}
        terminalCode={sessionInfo.terminalId}
      />
    </div>
  );
}
