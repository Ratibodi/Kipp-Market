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

  it("calculates product line item profit contribution and markup", () => {
    const qty = 5;
    const sellingPrice = 45;
    const unitCost = 28;
    const lineRevenue = qty * sellingPrice;
    const lineCost = qty * unitCost;
    const lineProfit = lineRevenue - lineCost;
    const margin = Number(((lineProfit / lineRevenue) * 100).toFixed(1));

    expect(lineProfit).toBe(85);
    expect(margin).toBe(37.8);
  });
});
