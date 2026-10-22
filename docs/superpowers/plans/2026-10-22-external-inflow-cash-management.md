# External Inflow & Capital Injection Cash Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the `/dashboard/expenses` page into a unified financial movements hub that allows recording external cash inflows (side business revenue, owner capital injections, storefront stall rent, drawer cash floats) alongside store expenses, updating the waterfall equation and records list.

**Architecture:** Extend the transaction model in `src/data/mockData.ts` with `FinancialMovementRecord` supporting both `"EXPENSE"` and `"INFLOW"`. Add bilingual dictionary keys to `LanguageContext.tsx`. Overhaul `src/app/dashboard/expenses/page.tsx` with a dual-button header, 5-card dark emerald waterfall equation strip, a dedicated "Receive External Inflow" modal with quick-fill amount chips, and interactive table filtering tabs.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React, Vitest.

---

### Task 1: Data Model & Calculation Unit Tests

**Files:**
- Modify: `src/data/mockData.ts`
- Create: `tests/financial-movement.test.ts`

- [ ] **Step 1: Write the failing unit tests for financial movements**

Create `tests/financial-movement.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  FinancialMovementRecord,
  calculateFinancialSummary,
} from "../src/data/mockData";

describe("Financial Movement Calculations", () => {
  const sampleRecords: FinancialMovementRecord[] = [
    {
      id: "exp-1",
      docNo: "EXP-202610-001",
      type: "EXPENSE",
      category: "Store Supplies",
      categoryTh: "ถุงหูหิ้วและกระดาษสลิป",
      amount: 480,
      date: "2026-10-22 10:00",
      destinationOrSource: "DRAWER",
      recordedBy: "สมชาย พ.",
      note: "กระดาษความร้อน",
    },
    {
      id: "inf-1",
      docNo: "INF-202610-001",
      type: "INFLOW",
      category: "Side Business",
      categoryTh: "เงินทุนจากธุรกิจเสริม",
      amount: 15000,
      date: "2026-10-22 11:30",
      destinationOrSource: "BANK",
      recordedBy: "สมชาย พ.",
      note: "กำไรจากร้านกาแฟนำมาเติมซื้อสต็อก",
    },
    {
      id: "inf-2",
      docNo: "INF-202610-002",
      type: "INFLOW",
      category: "Shift Cash Float",
      categoryTh: "เงินทอนสำรองเข้าลิ้นชัก",
      amount: 2000,
      date: "2026-10-22 12:00",
      destinationOrSource: "DRAWER",
      recordedBy: "สมชาย พ.",
      note: "เติมเงินทอนรอบบ่าย",
    },
  ];

  it("calculates total expenses and total inflows accurately", () => {
    const summary = calculateFinancialSummary(24850, 17941.7, sampleRecords);
    expect(summary.totalExpenses).toBe(480);
    expect(summary.totalInflows).toBe(17000);
    expect(summary.drawerInflows).toBe(2000);
    expect(summary.drawerExpenses).toBe(480);
  });

  it("calculates net operating surplus including external inflows", () => {
    const grossSales = 24850;
    const cogs = 17941.7;
    const summary = calculateFinancialSummary(grossSales, cogs, sampleRecords);
    // Net Surplus = (Revenue - COGS - Expenses) + Inflows
    // (24850 - 17941.7 - 480) + 17000 = 6428.3 + 17000 = 23428.3
    expect(Number(summary.netSurplus.toFixed(2))).toBe(23428.3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/financial-movement.test.ts`
Expected: FAIL with missing exports `calculateFinancialSummary` or `FinancialMovementRecord`.

- [ ] **Step 3: Update `src/data/mockData.ts`**

Export the new types, mock records, and calculation helper in `src/data/mockData.ts`:

```typescript
export type MovementType = "EXPENSE" | "INFLOW";

export interface FinancialMovementRecord {
  id: string;
  docNo: string;
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

export function calculateFinancialSummary(
  grossSales: number,
  cogs: number,
  records: FinancialMovementRecord[]
) {
  const totalExpenses = records
    .filter((r) => r.type === "EXPENSE")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalInflows = records
    .filter((r) => r.type === "INFLOW")
    .reduce((sum, r) => sum + r.amount, 0);

  const drawerExpenses = records
    .filter((r) => r.type === "EXPENSE" && r.destinationOrSource === "DRAWER")
    .reduce((sum, r) => sum + r.amount, 0);

  const drawerInflows = records
    .filter((r) => r.type === "INFLOW" && r.destinationOrSource === "DRAWER")
    .reduce((sum, r) => sum + r.amount, 0);

  const grossProfit = grossSales - cogs;
  const netProfit = grossProfit - totalExpenses;
  const netSurplus = netProfit + totalInflows;

  return {
    grossSales,
    cogs,
    grossProfit,
    totalExpenses,
    totalInflows,
    drawerExpenses,
    drawerInflows,
    netProfit,
    netSurplus,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/financial-movement.test.ts`
Expected: PASS 2/2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/mockData.ts tests/financial-movement.test.ts
git commit -m "feat(financial): add financial movement types, mock data and summary calculations"
```

---

### Task 2: Language Dictionary Keys

**Files:**
- Modify: `src/context/LanguageContext.tsx`

- [ ] **Step 1: Add Thai and English translation keys**

Add the `financial.*` dictionary keys:
- `financial.title`: "บันทึกค่าใช้จ่าย & เงินรับเข้าร้าน" / "Store Expenses & External Inflows"
- `financial.subtitle`: "บันทึกค่าใช้จ่ายจิปาถะ และรับเงินทุนเสริม/ธุรกิจเสริมเพื่อคำนวณสภาพคล่องสุทธิ"
- `financial.recordExpense`: "+ บันทึกค่าใช้จ่าย" / "+ Record Expense"
- `financial.receiveInflow`: "+ รับเงินนอกเข้า" / "+ Receive External Inflow"
- `financial.allMovements`: "ทั้งหมด" / "All"
- `financial.onlyInflows`: "เงินนอกเข้า" / "Inflows"
- `financial.onlyExpenses`: "ค่าใช้จ่าย" / "Expenses"
- `financial.inflowModalTitle`: "บันทึกเงินนอกเข้า / ทุนเสริม" / "Receive External Inflow"
- `financial.destinationDrawer`: "เข้าลิ้นชักหน้าร้าน (เงินสด)" / "Cash Drawer"
- `financial.destinationBank`: "โอนเข้าบัญชีธนาคารร้าน" / "Store Bank Account"
- `financial.netSurplus`: "สภาพคล่องสุทธิ (Net Surplus)" / "Net Operating Surplus"

- [ ] **Step 2: Type check dictionary updates**

Run: `pnpm exec tsc --noEmit`
Expected: Exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/context/LanguageContext.tsx
git commit -m "feat(i18n): add financial inflow and movements localization keys"
```

---

### Task 3: Overhaul `/dashboard/expenses` Page

**Files:**
- Modify: `src/app/dashboard/expenses/page.tsx`

- [ ] **Step 1: Implement dual modals, 5-card equation strip, and filter tabs**

Refactor `src/app/dashboard/expenses/page.tsx`:
1. Header button pair:
   - `+ บันทึกค่าใช้จ่าย`
   - `+ รับเงินนอกเข้า` (lime accent `#84cc16`)
2. 5-card dark emerald calculation strip:
   - Total Revenue
   - COGS
   - Total Expenses (`-฿...`)
   - External Inflows (`+฿...` with emerald badge)
   - Net Surplus (`฿...`)
3. Receive Inflow Modal:
   - Preset quick chips: `+฿500`, `+฿1,000`, `+฿2,000`, `+฿5,000`, `+฿10,000`
   - Category selector:
     - 💼 เงินทุนจากธุรกิจเสริม (Side Business Income)
     - 🏦 เงินเติมทุนหมุนเวียนเจ้าของ (Owner Working Capital)
     - 🏪 รายได้ค่าเช่าหน้าร้าน / ค่าป้าย (Storefront Rental)
     - 📱 ค่าคอมมิชชันตู้เติมเงิน / บริการ (Commission)
     - 📦 ขายเศษกล่อง ลัง และขวด (Scrap Sales)
     - 🪙 เงินทอนสำรองเข้าลิ้นชัก (Cash Float)
     - 🌟 เงินนอกเข้าอื่นๆ (Miscellaneous)
   - Destination: `DRAWER` vs `BANK`
   - Memo notes input
4. Movement Table:
   - Filter pill buttons: `ทั้งหมด` | `🟢 เงินนอกเข้า` | `🔻 ค่าใช้จ่าย`
   - Visual row distinction:
     - Green badge `+ เงินนอกเข้า` and `+฿X,XXX.00`
     - Slate badge `🔻 ค่าใช้จ่าย` and `-฿X,XXX.00`

- [ ] **Step 2: Verify type check passes**

Run: `pnpm exec tsc --noEmit`
Expected: Exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/expenses/page.tsx
git commit -m "feat(dashboard): implement unified financial movements and external inflow modal"
```

---

### Task 4: Browser E2E Verification

**Files:**
- Browser subagent on `http://localhost:3000/dashboard/expenses`

- [ ] **Step 1: Open `/dashboard/expenses` and verify 5-card waterfall strip**
- [ ] **Step 2: Click `+ รับเงินนอกเข้า` and submit a new inflow record**
  - Amount: ฿5,000
  - Category: เงินทุนจากธุรกิจเสริม
  - Destination: เข้าลิ้นชักหน้าร้าน
  - Memo: กำไรจากธุรกิจเสริมนำมาต่อยอดร้าน
- [ ] **Step 3: Verify metrics update immediately**
  - External Inflows increases by ฿5,000
  - Net Surplus increases by ฿5,000
- [ ] **Step 4: Test filter tabs**
  - Click `🟢 เงินนอกเข้า` -> only inflow records visible
  - Click `🔻 ค่าใช้จ่าย` -> only expense records visible
  - Click `ทั้งหมด` -> all records visible
- [ ] **Step 5: Capture verification screenshot**

---

### Task 5: Push to GitHub & Final Handoff

- [ ] **Step 1: Run full test suite**

Run: `pnpm exec vitest run`
Expected: All tests passing.

- [ ] **Step 2: Push commit to `origin main`**

```bash
git push origin main
```
