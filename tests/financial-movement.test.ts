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
