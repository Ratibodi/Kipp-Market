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

  // 1. Sheet: สรุปภาพรวมรายเดือน (Summary)
  const sheetSummary = workbook.addWorksheet("สรุปภาพรวมรายเดือน", {
    views: [{ showGridLines: true }],
  });

  sheetSummary.columns = [
    { header: "รายการ (Metric)", key: "metric", width: 32 },
    { header: "มูลค่า (Value)", key: "value", width: 28 },
  ];

  // Header style
  sheetSummary.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheetSummary.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF061A12" }, // Emerald Dark
  };

  sheetSummary.addRow({ metric: "ชื่อร้านค้า", value: payload.tenantName });
  sheetSummary.addRow({ metric: "สาขา", value: payload.branchName });
  sheetSummary.addRow({ metric: "รอบเดือนที่ปิด", value: payload.yearMonth });
  sheetSummary.addRow({
    metric: "ยอดขายรวม (Gross Sales)",
    value: `฿${payload.summary.totalSales.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
  });
  sheetSummary.addRow({
    metric: "ต้นทุนขาย (Cost of Goods)",
    value: `฿${payload.summary.totalCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
  });
  sheetSummary.addRow({
    metric: "กำไรสุทธิ (Net Profit)",
    value: `฿${payload.summary.netProfit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
  });
  sheetSummary.addRow({
    metric: "จำนวนบิลทั้งหมด (Receipts)",
    value: `${payload.summary.receiptsCount} ใบ`,
  });

  // 2. Sheet: รายการบิลขายทั้งหมด (Sales Slips)
  const sheetSales = workbook.addWorksheet("รายการบิลขายทั้งหมด");
  sheetSales.columns = [
    { header: "เลขที่ใบเสร็จ", key: "receiptNo", width: 18 },
    { header: "วันที่เวลา", key: "soldAt", width: 22 },
    { header: "แคชเชียร์", key: "cashierName", width: 18 },
    { header: "วิธีชำระ", key: "paymentMethod", width: 16 },
    { header: "ยอดรวม (฿)", key: "total", width: 16 },
  ];
  sheetSales.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheetSales.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF061A12" },
  };

  for (const s of payload.sales) {
    sheetSales.addRow({
      receiptNo: s.receiptNo,
      soldAt: new Date(s.soldAt).toLocaleString("th-TH"),
      cashierName: s.cashierName,
      paymentMethod: s.paymentMethod,
      total: s.total,
    });
  }

  // 3. Sheet: สินค้าที่ขาย (Items Sold)
  const sheetItems = workbook.addWorksheet("สินค้าที่ขาย");
  sheetItems.columns = [
    { header: "เลขที่ใบเสร็จ", key: "receiptNo", width: 18 },
    { header: "ชื่อสินค้า", key: "productName", width: 28 },
    { header: "บาร์โค้ด", key: "barcode", width: 18 },
    { header: "จำนวน (ชิ้น)", key: "qty", width: 14 },
    { header: "ราคา/หน่วย (฿)", key: "unitPrice", width: 16 },
    { header: "ยอดรวม (฿)", key: "lineTotal", width: 16 },
  ];
  sheetItems.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheetItems.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF061A12" },
  };

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

  // 4. Sheet: สต็อกคงเหลือยกยอด (Inventory Rollover)
  const sheetInv = workbook.addWorksheet("สต็อกคงเหลือยกยอด");
  sheetInv.columns = [
    { header: "ชื่อสินค้า", key: "productName", width: 28 },
    { header: "บาร์โค้ด", key: "barcode", width: 18 },
    { header: "สต็อกคงเหลือ (ชิ้น)", key: "endingQty", width: 20 },
    { header: "ต้นทุนเฉลี่ย/ชิ้น (฿)", key: "unitCost", width: 20 },
    { header: "มูลค่าสต็อกคงเหลือ (฿)", key: "stockValue", width: 24 },
  ];
  sheetInv.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheetInv.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF061A12" },
  };

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
