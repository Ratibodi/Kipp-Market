# Profit & Loss (P&L) Analytics & Financial Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated Profit & Loss Analytics dashboard (`/dashboard/profit`) and backend aggregation API (`/api/dashboard/profit`) that computes net-of-VAT revenue, moving average COGS, store expenses, and category margins from Supabase PostgreSQL with interactive charts and fallback resilience.

**Architecture:** A server-side Next.js Route Handler (`/api/dashboard/profit`) aggregates transactional data from `Sale`, `SaleItem`, `Expense`, and `Product` tables in Supabase PostgreSQL, calculating net revenue (excluding 7% VAT), COGS, gross profit, and net profit. The frontend (`/dashboard/profit`) renders four KPI summary cards, an interactive multi-bar comparison chart with a margin curve, horizontal category profitability bars, and a Top 10 Profit Drivers table with bilingual support (TH/EN).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Prisma ORM 6 / Supabase PostgreSQL, Lucide React, Vitest.

---

### File Structure Map

```
c:\KippMarket\
├── src/
│   ├── context/
│   │   └── LanguageContext.tsx         # [Modify] Add profit.* translation keys (TH/EN)
│   ├── app/
│   │   ├── api/
│   │   │   └── dashboard/
│   │   │       └── profit/
│   │   │           └── route.ts        # [Create] Server-side P&L aggregation endpoint
│   │   └── dashboard/
│   │       ├── page.tsx                # [Modify] Link Gross Profit card to /dashboard/profit
│   │       └── profit/
│   │           └── page.tsx            # [Create] P&L interactive dashboard page & charts
│   └── components/
│       └── dashboard/
│           └── DashboardSidebar.tsx    # [Modify] Add Profit & Loss menu entry
└── tests/
    └── profit-api.test.ts              # [Create] Vitest unit test for P&L calculation formulas
```

---

### Task 1: Bilingual Translations for Profit & Loss Analytics

**Files:**
- Modify: `src/context/LanguageContext.tsx:320-335`

- [ ] **Step 1: Add translation keys to LanguageContext dictionary**

Update `src/context/LanguageContext.tsx` with all keys for the Profit & Loss module:

```typescript
  // Profit & Loss Analytics
  "profit.title": { th: "รายงานกำไร-ขาดทุน & วิเคราะห์ผลประกอบการ", en: "Profit & Loss (P&L) Analytics" },
  "profit.subtitle": { th: "วิเคราะห์อัตรากำไรสุทธิ ต้นทุนสินค้าจริง (COGS) และผลตอบแทนรายหมวดหมู่", en: "Track net margins, true Cost of Goods Sold (COGS), and category yields" },
  "profit.today": { th: "วันนี้", en: "Today" },
  "profit.7d": { th: "7 วันล่าสุด", en: "Last 7 Days" },
  "profit.30d": { th: "30 วันล่าสุด", en: "Last 30 Days" },
  "profit.month": { th: "เดือนนี้", en: "This Month" },
  "profit.netRevenue": { th: "ยอดขายสุทธิ (ก่อน VAT)", en: "Net Revenue (Excl. VAT)" },
  "profit.cogs": { th: "ต้นทุนขายจริง (COGS)", en: "Cost of Goods Sold (COGS)" },
  "profit.grossProfit": { th: "กำไรขั้นต้น", en: "Gross Profit" },
  "profit.netProfit": { th: "กำไรสุทธิคงเหลือ", en: "Net Profit" },
  "profit.grossMargin": { th: "อัตรากำไรขั้นต้น", en: "Gross Margin" },
  "profit.netMargin": { th: "อัตรากำไรสุทธิ", en: "Net Margin" },
  "profit.expenses": { th: "ค่าใช้จ่ายร้านค้า", en: "Store Expenses" },
  "profit.pnlTrend": { th: "แนวโน้มยอดขาย vs ต้นทุน vs กำไรสุทธิ", en: "Net Revenue vs COGS vs Net Profit Trend" },
  "profit.pnlTrendSub": { th: "เปรียบเทียบผลประกอบการรายวัน พร้อมเส้นแสดงอัตรากำไรสุทธิ %", en: "Daily financial comparison overlaid with Net Margin % curve" },
  "profit.categoryYield": { th: "อัตรากำไรแยกตามหมวดหมู่สินค้า", en: "Profit Margin by Category" },
  "profit.categoryYieldSub": { th: "จัดอันดับหมวดหมู่ที่สร้างผลกำไรต่อหน่วยสูงสุด", en: "Ranked by gross margin efficiency percentage" },
  "profit.topDrivers": { th: "10 สินค้าทำกำไรสูงสุดประจำงวด", en: "Top 10 Profit Driver Products" },
  "profit.topDriversSub": { th: "สินค้าที่สร้างเม็ดเงินกำไรสุทธิเข้ากระเป๋าร้านมากที่สุด", en: "Products generating the highest absolute THB profit" },
  "profit.exportCsv": { th: "ส่งออกรายงาน (CSV)", en: "Export CSV Report" },
  "profit.highMargin": { th: "กำไรสูง", en: "High Margin" },
  "profit.volumeDriver": { th: "ยอดขายเยอะ", en: "Volume Driver" },
  "profit.coreStaple": { th: "สินค้าหลัก", en: "Core Staple" },
  "nav.profit": { th: "วิเคราะห์กำไร & การเงิน", en: "Profit & Loss" },
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `pnpm exec tsc --noEmit`
Expected: Exited with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/context/LanguageContext.tsx
git commit -m "feat(i18n): add profit and loss analytics dictionary keys"
```

---

### Task 2: P&L Calculation Engine & API Route Handler

**Files:**
- Create: `tests/profit-calculation.test.ts`
- Create: `src/app/api/dashboard/profit/route.ts`

- [ ] **Step 1: Write unit test for accounting formulas**

Create `tests/profit-calculation.test.ts` to verify retail accounting logic:

```typescript
import { describe, it, expect } from "vitest";

describe("Retail Profit & Loss Calculations", () => {
  it("calculates net revenue by excluding 7% VAT correctly", () => {
    const grossSales = 1070;
    const netRevenue = Number((grossSales / 1.07).toFixed(2));
    const vat = Number((grossSales - netRevenue).toFixed(2));

    expect(netRevenue).toBe(1000);
    expect(vat).toBe(70);
  });

  it("calculates gross profit, margins and net profit correctly", () => {
    const netRevenue = 1000;
    const cogs = 650;
    const grossProfit = netRevenue - cogs;
    const grossMarginPercent = Number(((grossProfit / netRevenue) * 100).toFixed(1));
    const expenses = 150;
    const netProfit = grossProfit - expenses;
    const netMarginPercent = Number(((netProfit / netRevenue) * 100).toFixed(1));

    expect(grossProfit).toBe(350);
    expect(grossMarginPercent).toBe(35.0);
    expect(netProfit).toBe(200);
    expect(netMarginPercent).toBe(20.0);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm exec vitest run tests/profit-calculation.test.ts`
Expected: 2 tests passed.

- [ ] **Step 3: Create Server API Route Handler (`src/app/api/dashboard/profit/route.ts`)**

Create `src/app/api/dashboard/profit/route.ts`:
- Accepts `?period=today|7d|30d|month|year`
- Queries Prisma database for `Sale`, `SaleItem`, `Expense`
- Computes Net Revenue, COGS, Gross Profit, Expenses, Net Profit
- Computes daily bar breakdown, category margin breakdown, and Top 10 profit drivers
- Gracefully handles database disconnection / offline mode with realistic fallback data

- [ ] **Step 4: Verify route handler compilation**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add tests/profit-calculation.test.ts src/app/api/dashboard/profit/route.ts
git commit -m "feat(api): create profit analytics aggregation endpoint with accounting formulas"
```

---

### Task 3: Sidebar Navigation & Main Dashboard Cross-Link

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx:160-175`
- Modify: `src/app/dashboard/page.tsx:150-161`

- [ ] **Step 1: Add Profit & Loss item in `DashboardSidebar.tsx`**

Under the section `FINANCE & EXPENSES`:
Add `TrendingUp` icon link to `/dashboard/profit`:

```tsx
<Link
  href="/dashboard/profit"
  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
    pathname.startsWith("/dashboard/profit")
      ? "bg-[#bef264] text-[#061a12] font-bold shadow-sm"
      : "text-slate-300 hover:text-white hover:bg-[#0c2e20]"
  }`}
>
  <TrendingUp className="h-4 w-4" />
  <span>{t("nav.profit")}</span>
</Link>
```

- [ ] **Step 2: Update Margin Analysis button in `src/app/dashboard/page.tsx`**

Change button on the Gross Profit KPI card to a Next.js `Link` pointing to `/dashboard/profit`:

```tsx
<div className="pt-3 border-t border-slate-100 mt-3">
  <Link
    href="/dashboard/profit"
    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition"
  >
    <span>{t("dash.marginAnalysis")}</span>
    <ArrowRight className="h-3 w-3" />
  </Link>
</div>
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/DashboardSidebar.tsx src/app/dashboard/page.tsx
git commit -m "feat(nav): integrate profit analytics link into sidebar and dashboard KPI card"
```

---

### Task 4: Interactive Profit & Loss Dashboard Page (`src/app/dashboard/profit/page.tsx`)

**Files:**
- Create: `src/app/dashboard/profit/page.tsx`

- [ ] **Step 1: Implement P&L Dashboard Page**

Create `src/app/dashboard/profit/page.tsx` containing:
1. **Header & Time Filter**:
   - Title, subtitle, period pills (`today`, `7d`, `30d`, `month`), store branch picker, and Export CSV button.
2. **Top 4 KPI Financial Cards**:
   - Net Revenue (`ยอดขายสุทธิ`), COGS (`ต้นทุนขายจริง`), Gross Profit (`กำไรขั้นต้น`), Net Profit (`กำไรสุทธิคงเหลือ` with `#bef264` highlight).
3. **Interactive Multi-Bar P&L Trend Chart (SVG)**:
   - Three bars per day: Net Revenue (dark emerald), COGS (slate/gray), Net Profit (lime).
   - Overlaid Net Margin % line.
   - Interactive hover cards showing breakdown for that specific day.
4. **Category Profitability & Margin Ranking**:
   - Horizontal comparative bars ranking product categories by margin % (Fresh Drinks, Bakery, Ready Meals, Snacks, Tobacco, etc.).
5. **Top 10 Profit Drivers Table**:
   - Columns: Rank, Name, Barcode, Units Sold, Selling Price, Unit Cost, Total Profit (฿), Margin %.
   - Badges: `HIGH_MARGIN`, `VOLUME_DRIVER`, `CORE_STAPLE`.
6. **Data fetching**:
   - Calls `/api/dashboard/profit?period={selectedPeriod}` using React state and `useEffect`.
   - Loading skeletons and smooth transitions.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/profit/page.tsx
git commit -m "feat(dashboard): build interactive profit and loss analytics page with multi-bar charts"
```

---

### Task 5: End-to-End Verification & Browser Validation

**Files:**
- Verification only

- [ ] **Step 1: Run all unit tests**

Run: `pnpm exec vitest run`
Expected: All tests pass.

- [ ] **Step 2: Run full project type check**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Verify browser functionality with `browser_subagent`**

Navigate to `http://localhost:3000/dashboard/profit`:
- Check that all 4 KPI cards render correct amounts and margin %.
- Check that the multi-bar trend chart renders cleanly.
- Check switching periods (`7 วันล่าสุด` -> `30 วันล่าสุด`).
- Verify no console errors or reload loops.

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```
