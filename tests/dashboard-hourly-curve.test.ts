import { describe, it, expect } from "vitest";
import { generateHourlyCurvePaths, HourlySalesPoint } from "../src/lib/hourlyCurve";

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
    expect(result.nowCoordinate.y).toBeGreaterThanOrEqual(30);
    expect(result.nowCoordinate.y).toBeLessThanOrEqual(190);
  });

  it("should handle empty or zero sales gracefully within bounds", () => {
    const zeroPoints: HourlySalesPoint[] = [
      { hour: 6, label: "06:00", actualRevenue: 0, yesterdayRevenue: 0 },
      { hour: 14, label: "14:00", actualRevenue: 0, yesterdayRevenue: 0 },
      { hour: 22, label: "22:00", actualRevenue: null, projectedRevenue: 0, yesterdayRevenue: 0 },
    ];
    const result = generateHourlyCurvePaths(zeroPoints, 10);
    expect(result.todayActualPath).not.toContain("NaN");
    expect(result.nowCoordinate.y).toBe(190); // baseline
  });
});
