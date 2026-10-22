# Design Specification: External Inflow & Capital Injection Cash Management
**Date:** 2026-10-22  
**Status:** Approved by User  
**Target Module:** Store Cash Movements & Net Profit (`/dashboard/expenses`)

---

## 1. Problem Statement & User Intent
In Thai retail minimarts, community grocery stores, and modern franchise branches, financial movements are not limited to sales revenue and operating expenses:
- Store owners frequently inject funds into the store from secondary ventures (e.g. side businesses, personal working capital injections) to finance stock expansion or operational cash flow.
- Stores earn non-POS miscellaneous revenue (e.g. subleasing storefront space to food stalls, commissions from top-up machines, recycling carton/crate sales).
- Cashiers receive cash floats into the shift drawer midway through operations.

Currently, the `/dashboard/expenses` page only provides functionality to record outgoing costs (`-฿Expense`), leading to a gap where external cash inflows cannot be documented, tracked, or factored into store liquidity and surplus calculations.

---

## 2. Goals & Success Criteria
1. **Dual Financial Inflow/Outflow Tracking:** Expand `/dashboard/expenses` into a unified Financial Movements hub allowing store managers to record both **Store Expenses (เงินจ่ายออก)** and **External Inflows (เงินนอกเข้าร้าน)**.
2. **Side-Business & Working Capital Categorization:** Provide tailored Thai retail categories for incoming funds (e.g. *เงินทุนจากธุรกิจเสริม*, *เงินเติมทุนหมุนเวียน*, *รายได้ค่าเช่าหน้าร้าน/คอมมิชชั่น*, *เงินทอนสำรอง*).
3. **Drawer vs. Bank Destination:** Support tagging whether money is received as physical cash in the POS drawer (affecting shift cash reconciliations) or deposited directly into the store bank account.
4. **Enhanced Waterfall Metric Strip:** Update the top calculation row to display:
   $$\text{Net Operating Surplus} = \text{Revenue} - \text{COGS} - \text{Expenses} + \text{External Inflows}$$
5. **Interactive Filtering:** Allow filtering records by `All`, `Inflows Only (เงินนอกเข้า)`, and `Expenses Only (ค่าใช้จ่าย)`.
6. **Bilingual Support:** Complete Thai and English dictionary keys in `LanguageContext.tsx`.

---

## 3. Data Architecture & Types

### 3.1 Extended Model Definition
In `src/data/mockData.ts` and Prisma schema equivalents:

```typescript
export type MovementType = "EXPENSE" | "INFLOW";

export type InflowCategory =
  | "Side Business"           // เงินทุนจากธุรกิจเสริม
  | "Owner Working Capital"   // เงินเติมทุนหมุนเวียนเจ้าของ
  | "Storefront Rental"       // รายได้ค่าเช่าพื้นที่หน้าร้าน/ป้าย
  | "Vending Commission"      // ค่าคอมมิชชันตู้เติมเงิน/บริการ
  | "Rebate & Scrap Sales"    // เงินคืนซัพพลายเออร์ / ขายเศษลัง
  | "Shift Cash Float"        // เงินทอนสำรองเข้าลิ้นชัก
  | "Miscellaneous Inflow";   // เงินนอกเข้าอื่นๆ

export interface FinancialMovementRecord {
  id: string;
  docNo: string; // EXP-YYYYMM-XXX or INF-YYYYMM-XXX
  type: MovementType;
  category: string;
  categoryTh: string;
  amount: number;
  date: string;
  destinationOrSource: "DRAWER" | "BANK";
  shiftId?: string;
  recordedBy: string;
  note: string;
}
```

---

## 4. UI & Component Specifications

### 4.1 Header Dual Action Buttons
Replace the single `+ บันทึกค่าใช้จ่าย` button with a complementary button pair:
- **Button 1 (Left):** `+ บันทึกค่าใช้จ่าย` (`bg-slate-900 hover:bg-slate-800 text-white`, icon: `ArrowDownRight`)
- **Button 2 (Right - Highlighted):** `+ รับเงินนอกเข้า` (`bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black`, icon: `ArrowUpRight`)

### 4.2 Waterfall KPI Equation Strip
Update the 4-card metric strip into a 5-card responsive waterfall layout with dark emerald aesthetics (`bg-[#061911]`):
1. **ยอดขายรวม (Total Revenue):** `฿24,850.00`
2. **ต้นทุนขาย (COGS):** `-฿17,941.70`
3. **ค่าใช้จ่ายร้าน (Expenses):** `-฿5,130.00` (amber text)
4. **เงินนอกเข้าร้าน (External Inflows):** `+฿15,000.00` (emerald/lime green text with badge)
5. **สภาพคล่องคงเหลือสุทธิ (Net Operating Surplus):** `฿16,778.30` (`text-[#bef264]` with bold font)

### 4.3 "รับเงินนอกเข้า" Modal (Receive External Funds)
- **Title:** รับเงินนอกเข้า / ทุนหมุนเวียนเสริม (Receive External Inflow)
- **Quick-fill Chips:** `+฿500`, `+฿1,000`, `+฿2,000`, `+฿5,000`, `+฿10,000` for rapid touch entry
- **Inflow Category Selector:**
  - 💼 เงินทุนจากธุรกิจเสริม (Side Business Income)
  - 🏦 เงินเติมทุนหมุนเวียนเจ้าของ (Owner Working Capital)
  - 🏪 รายได้ค่าเช่าหน้าร้าน / ค่าป้ายโฆษณา (Storefront Rental)
  - 📱 ค่าคอมมิชชันตู้เติมเงิน / ตู้ซักผ้า / ตู้กดน้ำ (Vending / Service Commission)
  - 📦 ขายเศษกล่อง ลัง และขวดเปล่า (Scrap & Waste Sales)
  - 🪙 เงินทอนสำรองเติมเข้าลิ้นชัก (Shift Cash Float)
  - 🌟 เงินนอกเข้าอื่นๆ (Miscellaneous Inflow)
- **Destination Toggle:**
  - 💵 เข้าลิ้นชักหน้าร้าน (เงินสด) — *เพิ่มเงินสดในกะสำหรับตรวจนับตอนปิดกะ*
  - 🏦 โอนเข้าบัญชีธนาคารร้าน — *เงินเข้าบัญชี ไม่กระทบเงินสดหน้าเคาน์เตอร์*
- **Memo / Reason Input:** Textarea/Input for reference (e.g. "กำไรจากร้านกาแฟนำมาเติมซื้อสินค้าเข้าร้าน")
- **Action Buttons:** Cancel and "บันทึกเงินนอกเข้า"

### 4.4 Data Table with Filter Tabs
Above the transaction table:
- Filter pill:
  - **ทั้งหมด (All)**
  - **เงินนอกเข้า (Inflows)** with green badge
  - **ค่าใช้จ่าย (Expenses)** with amber badge
- Table Columns:
  1. เลขที่เอกสาร (Doc No: `INF-...` or `EXP-...`)
  2. ประเภท & หมวดหมู่ (Type badge: `🟢 เงินนอกเข้า` vs `🔻 ค่าใช้จ่าย` + Category name)
  3. วันที่บันทึก (Date & Time)
  4. ช่องทาง (ลิ้นชักกะ vs บัญชีธนาคาร)
  5. รายละเอียด / หมายเหตุ (Memo)
  6. จำนวนเงิน (Amount: `+฿X,XXX.00` in bold green vs `-฿X,XXX.00` in slate)

---

## 5. Implementation Plan Overview
1. **Mock Data & Type Extensions:** Update `src/data/mockData.ts` with initial realistic inflow entries (e.g. ฿15,000 from side business).
2. **Page Logic & UI Overhaul:** Refactor `src/app/dashboard/expenses/page.tsx` to handle both modals, filtering tabs, dynamic waterfall calculations, and status indicators.
3. **Language Context:** Add bilingual translation keys in `src/context/LanguageContext.tsx`.
4. **Verification & Testing:** Verify rendering in browser with screenshot captures, type check with `tsc --noEmit`, and ensure zero regressions.
