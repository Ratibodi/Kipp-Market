import { describe, it, expect } from "vitest";
import { generateMonthlyReportBuffer } from "../src/lib/reports/monthlyExcelGenerator";

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
