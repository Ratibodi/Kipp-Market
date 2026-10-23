import { describe, it, expect } from "vitest";
import { calculateMonthBoundary } from "../src/lib/services/monthlyCloseService";

describe("Monthly Close Date Helper", () => {
  it("correctly calculates previous month date bounds for YYYY-MM", () => {
    // Reference date: 2026-10-01 (October 1st)
    const { start, end, yearMonth } = calculateMonthBoundary(new Date(2026, 9, 1));
    expect(yearMonth).toBe("2026-09");
    expect(start.getMonth()).toBe(8); // September (0-indexed)
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(8);
    expect(end.getDate()).toBe(30);
  });
});
