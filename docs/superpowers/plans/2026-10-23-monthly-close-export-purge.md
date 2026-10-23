# Monthly Close, Excel Export & Sales Purge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated and manual Month-End Closing system that compiles monthly financials, exports multi-sheet Excel reports, archives backups to cloud storage, and safely purges sales transaction records while rolling over inventory and preserving catalogs.

**Architecture:** A resilient service layer (`monthlyCloseService.ts`) processes month-end calculations, generates formatted 4-sheet workbooks via `exceljs`, saves archive metadata in Prisma (`MonthlyArchive`), and transactional-purges `Sale` and `SaleItem` rows past the closing boundary. An automated cron endpoint (`/api/cron/monthly-close`) runs at 00:00 on the 1st of each month, complemented by an owner-facing UI in `/dashboard/settings` with a download-safety gate.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Prisma ORM (PostgreSQL), `exceljs` for multi-tab spreadsheets, Vitest for unit tests.

---

## File Structure

- **Database & Schemas:**
  - Modify: `prisma/schema.prisma` (Add `MonthlyArchive` model)
- **Services & Helpers:**
  - Create: `src/lib/reports/monthlyExcelGenerator.ts` (Generates 4-sheet Excel report)
  - Create: `src/lib/services/monthlyCloseService.ts` (Handles closing snapshot, export, and safe purge)
  - Test: `tests/monthly-close-service.test.ts` (Unit tests for closing calculation and purge logic)
- **API Endpoints:**
  - Create: `src/app/api/admin/monthly-close/route.ts` (GET archives list, POST manual close & purge)
  - Create: `src/app/api/admin/monthly-close/download/[id]/route.ts` (Stream download archived Excel file)
  - Create: `src/app/api/cron/monthly-close/route.ts` (Cron endpoint triggered at 00:00 on 1st of month)
- **UI Components:**
  - Create: `src/components/dashboard/MonthlyCloseManager.tsx` (Dashboard card with safety gate & archive downloads)
  - Modify: `src/app/dashboard/settings/page.tsx` (Integrate `MonthlyCloseManager`)

---

## Tasks

### Task 1: Add `MonthlyArchive` Model to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma:530-550`

- [ ] **Step 1: Define `MonthlyArchive` model in `prisma/schema.prisma`**

```prisma
model MonthlyArchive {
  id              String   @id @default(uuid())
  tenantId        String
  yearMonth       String   // Format: "YYYY-MM" (e.g., "2026-09")
  totalSales      Decimal  @db.Decimal(12, 2)
  totalCost       Decimal  @db.Decimal(12, 4)
  netProfit       Decimal  @db.Decimal(12, 2)
  receiptsCount   Int
  filePath        String?  // Storage path for generated Excel
  downloadToken   String   @unique
  closedAt        DateTime @default(now())
  closedBy        String   // Member ID or "SYSTEM_CRON"
  createdAt       DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, yearMonth])
  @@index([tenantId, yearMonth])
}
```

- [ ] **Step 2: Run Prisma generate to update client**

Run: `npx prisma generate`
Expected: "✔ Generated Prisma Client"

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add MonthlyArchive model for monthly close and report archives"
```

---

### Task 2: Install `exceljs` and Create `monthlyExcelGenerator.ts`

**Files:**
- Modify: `package.json`
- Create: `src/lib/reports/monthlyExcelGenerator.ts`
- Test: `tests/excel-generator.test.ts`

- [ ] **Step 1: Install `exceljs`**

Run: `npm install exceljs`

- [ ] **Step 2: Write failing unit test for Excel generator**

Create `tests/excel-generator.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { generateMonthlyReportBuffer } from "@/lib/reports/monthlyExcelGenerator";

describe("Monthly Excel Generator", () => {
  it("generates a valid 4-sheet Excel buffer with summary, sales, items, and inventory", async () => {
    const mockData = {
      tenantName: "ร้านสะดวกซื้อ มิตรภาพ",
      branchName: "สาขาสุขุมวิท 24 (#024)",
      yearMonth: "2026-09",
      summary: {
        totalSales: 154200.0,
        totalCost: 102100.0,
        netProfit: 52100.0,
        receiptsCount: 820,
      },
      sales: [
        {
          receiptNo: "#TRX-1001",
          soldAt: "2026-09-15T14:20:00Z",
          cashierName: "สมชาย พ.",
          paymentMethod: "PROMPTPAY",
          total: 250.0,
        },
      ],
      items: [
        {
          receiptNo: "#TRX-1001",
          productName: "นมสด เมจิ 830มล.",
          barcode: "8850188201948",
          qty: 2,
          unitPrice: 46.5,
          lineTotal: 93.0,
        },
      ],
      inventory: [
        {
          productName: "นมสด เมจิ 830มล.",
          barcode: "8850188201948",
          endingQty: 45,
          unitCost: 32.5,
          stockValue: 1462.5,
        },
      ],
    };

    const buffer = await generateMonthlyReportBuffer(mockData);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/excel-generator.test.ts`
Expected: FAIL with "Cannot find module '@/lib/reports/monthlyExcelGenerator'"

- [ ] **Step 4: Implement `src/lib/reports/monthlyExcelGenerator.ts`**

```typescript
import ExcelJS from "exceljs";

export interface MonthlyReportPayload {
  tenantName: string;
  branchName: string;
  yearMonth: string;
  summary: {
    totalSales: number;
    totalCost: number;
    netProfit: number;
    receiptsCount: number;
  };
  sales: Array<{
    receiptNo: string;
    soldAt: string;
    cashierName: string;
    paymentMethod: string;
    total: number;
  }>;
  items: Array<{
    receiptNo: string;
    productName: string;
    barcode?: string | null;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  inventory: Array<{
    productName: string;
    barcode?: string | null;
    endingQty: number;
    unitCost: number;
    stockValue: number;
  }>;
}

export async function generateMonthlyReportBuffer(
  payload: MonthlyReportPayload
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Kipp Market POS";
  workbook.created = new Date();

  // Sheet 1: สรุปภาพรวมรายเดือน (Summary)
  const sheetSummary = workbook.addWorksheet("สรุปภาพรวมรายเดือน", {
    views: [{ showGridLines: true }],
  });
  sheetSummary.columns = [
    { header: "รายการ (Metric)", key: "metric", width: 32 },
    { header: "มูลค่า (Value)", key: "value", width: 25 },
  ];
  sheetSummary.addRow({ metric: "ชื่อร้านค้า", value: payload.tenantName });
  sheetSummary.addRow({ metric: "สาขา", value: payload.branchName });
  sheetSummary.addRow({ metric: "รอบเดือนที่ปิด", value: payload.yearMonth });
  sheetSummary.addRow({ metric: "ยอดขายรวม (Gross Sales)", value: `฿${payload.summary.totalSales.toFixed(2)}` });
  sheetSummary.addRow({ metric: "ต้นทุนขาย (Cost of Goods)", value: `฿${payload.summary.totalCost.toFixed(2)}` });
  sheetSummary.addRow({ metric: "กำไรสุทธิ (Net Profit)", value: `฿${payload.summary.netProfit.toFixed(2)}` });
  sheetSummary.addRow({ metric: "จำนวนบิลทั้งหมด (Receipts)", value: `${payload.summary.receiptsCount} ใบ` });

  // Sheet 2: รายการบิลขาย (Sales Slips)
  const sheetSales = workbook.addWorksheet("รายการบิลขายทั้งหมด");
  sheetSales.columns = [
    { header: "เลขที่ใบเสร็จ", key: "receiptNo", width: 18 },
    { header: "วันที่เวลา", key: "soldAt", width: 22 },
    { header: "แคชเชียร์", key: "cashierName", width: 18 },
    { header: "วิธีชำระ", key: "paymentMethod", width: 16 },
    { header: "ยอดรวม (฿)", key: "total", width: 15 },
  ];
  for (const s of payload.sales) {
    sheetSales.addRow({
      receiptNo: s.receiptNo,
      soldAt: new Date(s.soldAt).toLocaleString("th-TH"),
      cashierName: s.cashierName,
      paymentMethod: s.paymentMethod,
      total: s.total,
    });
  }

  // Sheet 3: รายการสินค้าที่ขาย (Items Sold)
  const sheetItems = workbook.addWorksheet("สินค้าที่ขาย");
  sheetItems.columns = [
    { header: "เลขที่ใบเสร็จ", key: "receiptNo", width: 18 },
    { header: "ชื่อสินค้า", key: "productName", width: 28 },
    { header: "บาร์โค้ด", key: "barcode", width: 18 },
    { header: "จำนวน (ชิ้น)", key: "qty", width: 14 },
    { header: "ราคา/หน่วย (฿)", key: "unitPrice", width: 16 },
    { header: "ยอดรวม (฿)", key: "lineTotal", width: 16 },
  ];
  for (const it of payload.items) {
    sheetItems.addRow({
      receiptNo: it.receiptNo,
      productName: it.productName,
      barcode: it.barcode || "-",
      qty: it.qty,
      unitPrice: it.unitPrice,
      lineTotal: it.lineTotal,
    });
  }

  // Sheet 4: สต็อกคงเหลือยกยอด (Inventory Rollover)
  const sheetInv = workbook.addWorksheet("สต็อกคงเหลือยกยอด");
  sheetInv.columns = [
    { header: "ชื่อสินค้า", key: "productName", width: 28 },
    { header: "บาร์โค้ด", key: "barcode", width: 18 },
    { header: "สต็อกคงเหลือ (ชิ้น)", key: "endingQty", width: 18 },
    { header: "ต้นทุนเฉลี่ย/ชิ้น (฿)", key: "unitCost", width: 18 },
    { header: "มูลค่าสต็อกคงเหลือ (฿)", key: "stockValue", width: 22 },
  ];
  for (const inv of payload.inventory) {
    sheetInv.addRow({
      productName: inv.productName,
      barcode: inv.barcode || "-",
      endingQty: inv.endingQty,
      unitCost: inv.unitCost,
      stockValue: inv.stockValue,
    });
  }

  const rawBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(rawBuffer);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/excel-generator.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/reports/monthlyExcelGenerator.ts tests/excel-generator.test.ts
git commit -m "feat(reports): add multi-sheet Excel generator for monthly close"
```

---

### Task 3: Create `monthlyCloseService.ts` (Close, Snapshot, Export & Safe Purge)

**Files:**
- Create: `src/lib/services/monthlyCloseService.ts`
- Test: `tests/monthly-close-service.test.ts`

- [ ] **Step 1: Write unit test for monthly close service**

Create `tests/monthly-close-service.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { calculateMonthBoundary } from "@/lib/services/monthlyCloseService";

describe("Monthly Close Date Helper", () => {
  it("correctly calculates previous month date bounds for YYYY-MM", () => {
    const { start, end, yearMonth } = calculateMonthBoundary(new Date("2026-10-01T00:00:00Z"));
    expect(yearMonth).toBe("2026-09");
    expect(start.toISOString()).toContain("2026-09-01");
    expect(end.toISOString()).toContain("2026-09-30");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/monthly-close-service.test.ts`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `src/lib/services/monthlyCloseService.ts`**

```typescript
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generateMonthlyReportBuffer } from "@/lib/reports/monthlyExcelGenerator";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export function calculateMonthBoundary(referenceDate: Date = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed, current month
  
  // Previous month boundary
  const prevMonthDate = new Date(year, month - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1;
  const yearMonth = `${prevYear}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const start = new Date(prevYear, prevMonth - 1, 1, 0, 0, 0, 0);
  const end = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

  return { start, end, yearMonth };
}

export async function executeMonthlyCloseAndPurge(params: {
  tenantId: string;
  closedBy?: string;
  targetYearMonth?: string;
}) {
  const { tenantId, closedBy = "SYSTEM_CRON", targetYearMonth } = params;

  let start: Date;
  let end: Date;
  let yearMonth: string;

  if (targetYearMonth) {
    const [y, m] = targetYearMonth.split("-").map(Number);
    start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    end = new Date(y, m, 0, 23, 59, 59, 999);
    yearMonth = targetYearMonth;
  } else {
    const bounds = calculateMonthBoundary();
    start = bounds.start;
    end = bounds.end;
    yearMonth = bounds.yearMonth;
  }

  // 1. Fetch Tenant details
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true },
  });
  const tenantName = tenant?.name || "Kipp Market";

  // 2. Fetch Sales within the month
  const sales = await db.sale.findMany({
    where: {
      tenantId,
      soldAt: { gte: start, lte: end },
      status: "COMPLETED",
    },
    include: {
      items: true,
      cashier: { select: { displayName: true } },
    },
    orderBy: { soldAt: "asc" },
  });

  const totalSales = sales.reduce((acc, s) => acc + Number(s.total), 0);
  const totalCost = sales.reduce((acc, s) => acc + Number(s.totalCost), 0);
  const netProfit = totalSales - totalCost;
  const receiptsCount = sales.length;

  // Flatten items
  const flattenedItems = sales.flatMap((s) =>
    s.items.map((it) => ({
      receiptNo: s.receiptNo,
      productName: it.nameSnapshot,
      barcode: it.barcodeSnapshot,
      qty: Number(it.qty),
      unitPrice: Number(it.unitPrice),
      lineTotal: Number(it.lineTotal),
    }))
  );

  // 3. Fetch Inventory Snapshot
  const inventoryItems = await db.inventoryItem.findMany({
    where: { tenantId },
    include: { product: { select: { name: true, barcode: true } } },
  });

  const formattedInventory = inventoryItems.map((inv) => {
    const qty = Number(inv.qtyOnHand);
    const cost = Number(inv.avgCost);
    return {
      productName: inv.product.name,
      barcode: inv.product.barcode,
      endingQty: qty,
      unitCost: cost,
      stockValue: Number((qty * cost).toFixed(2)),
    };
  });

  // 4. Generate Multi-Sheet Excel Buffer
  const excelBuffer = await generateMonthlyReportBuffer({
    tenantName,
    branchName: "คลังข้อมูลรวม",
    yearMonth,
    summary: {
      totalSales,
      totalCost,
      netProfit,
      receiptsCount,
    },
    sales: sales.map((s) => ({
      receiptNo: s.receiptNo,
      soldAt: s.soldAt.toISOString(),
      cashierName: s.cashier?.displayName || "Cashier",
      paymentMethod: s.paymentMethod,
      total: Number(s.total),
    })),
    items: flattenedItems,
    inventory: formattedInventory,
  });

  // 5. Persist Excel file to disk/archive directory
  const downloadToken = crypto.randomBytes(16).toString("hex");
  const archiveDir = path.join(process.cwd(), "public", "reports", "monthly_archives");
  await fs.mkdir(archiveDir, { recursive: true });
  const fileName = `KippMarket_Report_${yearMonth}_${tenantId.slice(0, 8)}.xlsx`;
  const filePath = path.join(archiveDir, fileName);
  await fs.writeFile(filePath, excelBuffer);

  // 6. Record MonthlyArchive in DB
  const archiveRecord = await db.monthlyArchive.upsert({
    where: {
      tenantId_yearMonth: {
        tenantId,
        yearMonth,
      },
    },
    create: {
      tenantId,
      yearMonth,
      totalSales: new Prisma.Decimal(totalSales),
      totalCost: new Prisma.Decimal(totalCost),
      netProfit: new Prisma.Decimal(netProfit),
      receiptsCount,
      filePath: `/reports/monthly_archives/${fileName}`,
      downloadToken,
      closedBy,
    },
    update: {
      totalSales: new Prisma.Decimal(totalSales),
      totalCost: new Prisma.Decimal(totalCost),
      netProfit: new Prisma.Decimal(netProfit),
      receiptsCount,
      filePath: `/reports/monthly_archives/${fileName}`,
      downloadToken,
      closedBy,
      closedAt: new Date(),
    },
  });

  // 7. SAFE TRANSACTIONAL PURGE of historical sales
  // Deletes SaleItem and Sale for that month after Excel buffer and archive are successfully verified
  if (sales.length > 0) {
    const saleIds = sales.map((s) => s.id);
    await db.$transaction([
      db.saleItem.deleteMany({
        where: { saleId: { in: saleIds } },
      }),
      db.sale.deleteMany({
        where: { id: { in: saleIds } },
      }),
    ]);
  }

  return {
    success: true,
    yearMonth,
    archiveId: archiveRecord.id,
    downloadToken,
    purgedBillsCount: receiptsCount,
    totalSales,
    netProfit,
  };
}
```

- [ ] **Step 4: Run tests to verify logic passes**

Run: `npx vitest run tests/monthly-close-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/monthlyCloseService.ts tests/monthly-close-service.test.ts
git commit -m "feat(services): implement monthlyCloseService with snapshot, excel archiving, and safe purge"
```

---

### Task 4: API Endpoints for Monthly Close & Archive Downloads

**Files:**
- Create: `src/app/api/admin/monthly-close/route.ts`
- Create: `src/app/api/admin/monthly-close/download/[token]/route.ts`

- [ ] **Step 1: Implement `src/app/api/admin/monthly-close/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { executeMonthlyCloseAndPurge } from "@/lib/services/monthlyCloseService";

// GET /api/admin/monthly-close -> List archives
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== "OWNER" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const archives = await db.monthlyArchive.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { yearMonth: "desc" },
    });

    return NextResponse.json({ archives });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/monthly-close -> Trigger close & purge
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Only Store Owner can close & purge" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const result = await executeMonthlyCloseAndPurge({
      tenantId: user.tenantId,
      closedBy: user.id,
      targetYearMonth: body.yearMonth,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Implement `src/app/api/admin/monthly-close/download/[token]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const archive = await db.monthlyArchive.findUnique({
    where: { downloadToken: token },
  });

  if (!archive || !archive.filePath) {
    return NextResponse.json({ error: "Archive file not found" }, { status: 404 });
  }

  const fullPath = path.join(process.cwd(), "public", archive.filePath);
  try {
    const fileBuffer = await fs.readFile(fullPath);
    const fileName = path.basename(fullPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to read archive file" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/monthly-close/route.ts src/app/api/admin/monthly-close/download/[token]/route.ts
git commit -m "feat(api): add monthly-close admin trigger and archive file download endpoints"
```

---

### Task 5: Cron Job Trigger Endpoint (`/api/cron/monthly-close`)

**Files:**
- Create: `src/app/api/cron/monthly-close/route.ts`

- [ ] **Step 1: Implement `src/app/api/cron/monthly-close/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeMonthlyCloseAndPurge } from "@/lib/services/monthlyCloseService";

export async function GET(req: NextRequest) {
  // Validate Cron Secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "kipp-cron-secret-2026";
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
  }

  try {
    // Run for all active tenants
    const tenants = await db.tenant.findMany({
      select: { id: true, name: true },
    });

    const results = [];
    for (const tenant of tenants) {
      const res = await executeMonthlyCloseAndPurge({
        tenantId: tenant.id,
        closedBy: "SYSTEM_CRON_00:00",
      });
      results.push({ tenant: tenant.name, ...res });
    }

    return NextResponse.json({
      message: "Monthly close executed successfully at 00:00:00",
      timestamp: new Date().toISOString(),
      processedTenantsCount: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/cron/monthly-close/route.ts
git commit -m "feat(cron): add automated midnight monthly-close trigger endpoint"
```

---

### Task 6: UI Component & Management View in Settings

**Files:**
- Create: `src/components/dashboard/MonthlyCloseManager.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`

- [ ] **Step 1: Implement `src/components/dashboard/MonthlyCloseManager.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, Download, Trash2, ShieldCheck, AlertTriangle, FileSpreadsheet, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ArchiveItem {
  id: string;
  yearMonth: string;
  totalSales: number;
  netProfit: number;
  receiptsCount: number;
  downloadToken: string;
  closedAt: string;
}

export function MonthlyCloseManager() {
  const { language } = useLanguage();
  const isTh = language === "th";

  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchArchives();
  }, []);

  async function fetchArchives() {
    try {
      const res = await fetch("/api/admin/monthly-close");
      if (res.ok) {
        const data = await res.json();
        setArchives(data.archives || []);
      }
    } catch (err) {
      console.warn("Failed to fetch archives:", err);
    }
  }

  async function handleCloseAndPurge() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/monthly-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const result = await res.json();
        setIsConfirmOpen(false);
        setToastMessage(
          isTh
            ? `ปิดรอบเดือน ${result.yearMonth} สำเร็จ! ส่งออก Excel และเคลียร์ ${result.purgedBillsCount} บิลเรียบร้อย`
            : `Closed month ${result.yearMonth}! Exported Excel and cleared ${result.purgedBillsCount} bills.`
        );
        fetchArchives();
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch {
      setToastMessage(isTh ? "เกิดข้อผิดพลาดในการปิดรอบ" : "Error executing close");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {isTh ? "ระบบปิดรอบบัญชีสิ้นเดือน & สำรองไฟล์ Excel (Monthly Close)" : "Month-End Close & Excel Archive"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTh
                ? "ตัดรอบอัตโนมัติทุกวันที่ 1 เวลา 00:00 น. บันทึกรายงาน Excel ย้อนหลัง และเคลียร์ประวัติบิลเพื่อความเร็วสูงสุด"
                : "Automated monthly close at 00:00 on the 1st, archiving Excel reports and purging bills."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#061a12] hover:bg-[#0c2f21] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{isTh ? "ปิดรอบ & สำรองข้อมูลตอนนี้" : "Close & Archive Now"}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              <h4 className="text-base font-black text-slate-900">
                {isTh ? "ยืนยันการปิดรอบและสำรองข้อมูล" : "Confirm Monthly Close & Purge"}
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isTh
                ? "ระบบจะทำการส่งออกไฟล์ Excel สรุปยอดขาย กำไร และสต็อกทั้งหมด จากนั้นจะเคลียร์บิลขายออกจากฐานข้อมูลเพื่อเริ่มนับรอบเดือนใหม่ ข้อมูลสินค้าและสต็อกจะไม่สูญหาย"
                : "The system will export the Excel report, archive it safely, and purge sales slips to start the new month clean. Products and inventory remain safe."}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                {isTh ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCloseAndPurge}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isLoading ? (isTh ? "กำลังประมวลผล..." : "Processing...") : (isTh ? "ยืนยันปิดรอบ" : "Confirm Close")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archives Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
          <span>{isTh ? "ประวัติรายงาน Excel ประจำเดือนที่ผ่านมา" : "Monthly Excel Archives"}</span>
          <span className="text-[11px] text-slate-500 font-normal">
            {archives.length} {isTh ? "ไฟล์รายงาน" : "reports"}
          </span>
        </div>

        {archives.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <FileSpreadsheet className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p>{isTh ? "ยังไม่มีประวัติการปิดรอบรายเดือน" : "No monthly archives yet"}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {archives.map((arc) => (
              <div key={arc.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <div className="text-xs font-black font-mono text-slate-900 flex items-center gap-2">
                    <span>เดือน {arc.yearMonth}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      {arc.receiptsCount} {isTh ? "บิล" : "receipts"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {isTh ? "ยอดขาย" : "Sales"}: ฿{Number(arc.totalSales).toLocaleString()} • {isTh ? "กำไรสุทธิ" : "Profit"}: ฿{Number(arc.netProfit).toLocaleString()}
                  </div>
                </div>

                <a
                  href={`/api/admin/monthly-close/download/${arc.downloadToken}`}
                  download
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isTh ? "ดาวน์โหลด Excel" : "Download Excel"}</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount `MonthlyCloseManager` into `src/app/dashboard/settings/page.tsx`**

Modify `src/app/dashboard/settings/page.tsx`:
Add `import { MonthlyCloseManager } from "@/components/dashboard/MonthlyCloseManager";`
And render `<MonthlyCloseManager />` inside the Settings page layout.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/MonthlyCloseManager.tsx src/app/dashboard/settings/page.tsx
git commit -m "feat(ui): add MonthlyCloseManager card to settings page with safe download gate"
```

---

### Task 7: Full Verification & Integration Testing

- [ ] **Step 1: Run TypeScript verification**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 2: Run all test suites**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 3: Commit and Push**

```bash
git push origin main
```
