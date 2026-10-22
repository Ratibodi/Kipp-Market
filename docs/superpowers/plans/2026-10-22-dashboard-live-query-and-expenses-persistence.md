# Dashboard Live Database Query & Expenses Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Main Manager Dashboard (`/dashboard`) to dynamic database sales queries with dynamic SVG hourly curves, and persist Expenses & External Inflows (`/dashboard/expenses`) to PostgreSQL via dedicated REST API endpoints.

**Architecture:** Create Next.js API route `/api/dashboard/overview` that aggregates live `db.sale` data by hour (with intelligent demo seed fallback), convert hourly points to smooth cubic Bézier curves dynamically on the client, and create `/api/expenses` for persisting expenses and external inflows to Prisma `db.expense`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma ORM, PostgreSQL (Supabase), Vitest, Tailwind CSS, Lucide Icons.

---

### File Structure Map
- **Backend APIs:**
  - Create: `src/app/api/dashboard/overview/route.ts` — aggregates today/yesterday hourly sales, KPIs, payment breakdown, and recent transactions.
  - Create: `src/app/api/expenses/route.ts` — handles `GET` (list movements) and `POST` (create expense or external inflow).
- **Frontend Pages:**
  - Modify: `src/app/dashboard/page.tsx` — fetch `/api/dashboard/overview`, compute dynamic SVG curves and KPIs with graceful fallback.
  - Modify: `src/app/dashboard/expenses/page.tsx` — fetch `/api/expenses` on mount, persist new expenses & inflows on submission.
- **Unit Tests:**
  - Create: `tests/dashboard-hourly-curve.test.ts` — verify dynamic hourly Bézier coordinate calculations and boundary safety.
  - Create: `tests/expenses-api-validation.test.ts` — verify payload parsing, financial movement classification, and balance equations.

---

### Task 1: Unit Test & Mathematical Calculation for Dynamic Hourly Curve

**Files:**
- Create: `tests/dashboard-hourly-curve.test.ts`
- Create: `src/lib/hourlyCurve.ts`

- [ ] **Step 1: Write test for hourly curve coordinate generator**

```typescript
// tests/dashboard-hourly-curve.test.ts
import { describe, it, expect } from "vitest";
import { generateHourlyCurvePaths, HourlySalesPoint } from "@/lib/hourlyCurve";

describe("generateHourlyCurvePaths", () => {
  const samplePoints: HourlySalesPoint[] = [
    { hour: 6, label: "06:00", actualRevenue: 2400, yesterdayRevenue: 2200 },
    { hour: 8, label: "08:00", actualRevenue: 3000, yesterdayRevenue: 2800 },
    { hour: 10, label: "10:00", actualRevenue: 4200, yesterdayRevenue: 3800 },
    { hour: 12, label: "12:00", actualRevenue: 7400, yesterdayRevenue: 6200 },
    { hour: 14, label: "14:00", actualRevenue: 4000, yesterdayRevenue: 3400 },
    { hour: 16, label: "16:00", actualRevenue: null, projectedRevenue: 4100, yesterdayRevenue: 3500 },
    { hour: 18, label: "18:00", actualRevenue: null, projectedRevenue: 7200, yesterdayRevenue: 6800 },
    { hour: 20, label: "20:00", actualRevenue: null, projectedRevenue: 4500, yesterdayRevenue: 3800 },
    { hour: 22, label: "22:00", actualRevenue: null, projectedRevenue: 2500, yesterdayRevenue: 2200 },
  ];

  it("should generate valid SVG path strings without NaN or infinity", () => {
    const result = generateHourlyCurvePaths(samplePoints, 14.5);
    expect(result.todayActualPath).toContain("M 50");
    expect(result.todayActualPath).not.toContain("NaN");
    expect(result.todayAreaPath).toContain("Z");
    expect(result.yesterdayPath).toContain("M 50");
    expect(result.projectedPath).toContain("M");
    expect(result.nowCoordinate.x).toBeGreaterThan(50);
    expect(result.nowCoordinate.x).toBeLessThan(570);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/dashboard-hourly-curve.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/lib/hourlyCurve.ts`**

Implement `generateHourlyCurvePaths` that maps hourly values (0–8,000 THB) into the SVG frame (`x: 50–570`, `y: 190–30`) using clean cubic Bézier segments with guaranteed boundaries ($30 \le y \le 190$).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/dashboard-hourly-curve.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/hourlyCurve.ts tests/dashboard-hourly-curve.test.ts
git commit -m "feat(dashboard): add dynamic SVG hourly curve calculation utility with unit tests"
```

---

### Task 2: Backend API `/api/dashboard/overview`

**Files:**
- Create: `src/app/api/dashboard/overview/route.ts`

- [ ] **Step 1: Implement the overview route with Prisma aggregation and intelligent seed fallback**

The endpoint:
1. Queries `db.sale` for `soldAt >= startOfToday` and `soldAt >= startOfYesterday && soldAt < startOfToday`.
2. Groups sales by hour (06:00 to 22:00).
3. If no live sales exist yet (e.g. fresh database), returns calibrated retail demo data so the page always renders cleanly.
4. Returns:
   - `summary`: `{ grossSales, yesterdayGrossSales, growthPercent, grossProfit, profitMarginPercent, totalTransactions, avgBasketSize }`
   - `hourlyPoints`: array of hourly sales
   - `paymentDistribution`: `{ cashAmount, promptpayAmount, creditAmount, trueMoneyAmount }`
   - `topCategories`: array of category revenue percentages
   - `recentSales`: latest 5 transactions

- [ ] **Step 2: Test endpoint with curl**

Run: `curl.exe -s http://localhost:3000/api/dashboard/overview`
Expected: HTTP 200 with JSON payload containing summary, hourlyPoints, and recentSales.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/overview/route.ts
git commit -m "feat(api): add /api/dashboard/overview endpoint with live aggregation and fallback"
```

---

### Task 3: Wire `/dashboard` to Live Overview Data

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add `useEffect` and state for live overview data**
- [ ] **Step 2: Bind KPI cards to `overview.summary`**
- [ ] **Step 3: Bind the Hourly Sales SVG graph to `overview.hourlyPoints` using `generateHourlyCurvePaths`**
- [ ] **Step 4: Bind Recent Transactions table to `overview.recentSales`**
- [ ] **Step 5: Verify visually via browser subagent on `http://localhost:3000/dashboard`**
- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat(dashboard): wire executive overview, hourly curve, and transactions to live API"
```

---

### Task 4: Backend API `/api/expenses` for Expenses & External Inflows

**Files:**
- Create: `src/app/api/expenses/route.ts`
- Create: `tests/expenses-api-validation.test.ts`

- [ ] **Step 1: Write unit test for financial movement validation**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `GET` and `POST` in `src/app/api/expenses/route.ts`**
  - `GET`: Returns stored `Expense` records, formatting them into `FinancialMovementRecord` with `type: "EXPENSE" | "INFLOW"`.
  - `POST`: Validates `amount > 0`, `type`, `category`, and creates record in `db.expense` (with fallback to memory cache if DB is offline).
- [ ] **Step 4: Run unit tests**
Run: `pnpm exec vitest run tests/expenses-api-validation.test.ts`
Expected: PASS
- [ ] **Step 5: Commit**

```bash
git add src/app/api/expenses/route.ts tests/expenses-api-validation.test.ts
git commit -m "feat(api): add /api/expenses endpoint for persisting expenses and external inflows"
```

---

### Task 5: Wire `/dashboard/expenses` to `/api/expenses`

**Files:**
- Modify: `src/app/dashboard/expenses/page.tsx`

- [ ] **Step 1: Add `useEffect` to fetch movements from `/api/expenses` on page load**
- [ ] **Step 2: Update `handleAddExpense` and `handleAddInflow` to POST to `/api/expenses`**
- [ ] **Step 3: Verify optimistic update and persistence on page refresh**
- [ ] **Step 4: Test in browser using browser subagent at `http://localhost:3000/dashboard/expenses`**
- [ ] **Step 5: Run full TypeScript and test suite**
- [ ] **Step 6: Commit and Push**

```bash
git add src/app/dashboard/expenses/page.tsx
git commit -m "feat(expenses): persist expenses and external inflows to database"
git push origin main
```
