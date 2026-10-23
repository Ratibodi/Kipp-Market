import { db } from "@/server/db";
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
  const yearMonth = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

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
