export interface HourlySalesPoint {
  hour: number; // 6 to 22
  label: string; // e.g. "06:00", "12:00"
  actualRevenue: number | null; // null if future hour
  projectedRevenue?: number; // target projection
  yesterdayRevenue: number;
}

export interface GeneratedCurveResult {
  todayActualPath: string;
  todayAreaPath: string;
  yesterdayPath: string;
  projectedPath: string;
  projectedAreaPath: string;
  nowCoordinate: { x: number; y: number };
  lunchPeak: { x: number; y: number; value: number };
  dinnerPeak: { x: number; y: number; value: number };
}

/**
 * Maps hour (6 to 22) to SVG X coordinate in 600px viewBox.
 */
export function mapHourToX(hour: number): number {
  const clampedHour = Math.max(6, Math.min(22, hour));
  return 50 + ((clampedHour - 6) / 16) * 520;
}

/**
 * Maps revenue (0 to 8,000 THB) to SVG Y coordinate in 220px viewBox.
 * Baseline Y = 190, Max Y = 30.
 */
export function mapRevenueToY(revenue: number | null | undefined): number {
  if (revenue == null || isNaN(revenue) || revenue <= 0) return 190;
  const clamped = Math.min(8000, Math.max(0, revenue));
  return 190 - (clamped / 8000) * 160;
}

/**
 * Creates smooth cubic Bézier SVG path from a series of 2D points with overshoot clamping.
 */
function buildSmoothSpline(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bézier conversion factor (1/6 tension)
    let cp1x = p1.x + (p2.x - p0.x) / 6;
    let cp1y = p1.y + (p2.y - p0.y) / 6;

    let cp2x = p2.x - (p3.x - p1.x) / 6;
    let cp2y = p2.y - (p3.y - p1.y) / 6;

    // Strict boundary clamping to prevent spline overshoot
    cp1y = Math.max(30, Math.min(190, cp1y));
    cp2y = Math.max(30, Math.min(190, cp2y));

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

export function generateHourlyCurvePaths(
  points: HourlySalesPoint[],
  currentHourDecimal: number = 14.6
): GeneratedCurveResult {
  const sortedPoints = [...points].sort((a, b) => a.hour - b.hour);

  // 1. Calculate Yesterday Points (full day 06:00 to 22:00)
  const yesterday2D = sortedPoints.map((p) => ({
    x: mapHourToX(p.hour),
    y: mapRevenueToY(p.yesterdayRevenue),
  }));
  const yesterdayPath = buildSmoothSpline(yesterday2D);

  // 2. Separate Today Actual vs Projected Points
  const todayActualPoints = sortedPoints.filter(
    (p) => p.actualRevenue !== null && p.hour <= Math.ceil(currentHourDecimal)
  );

  let nowCoord = {
    x: mapHourToX(currentHourDecimal),
    y: 190,
  };

  if (todayActualPoints.length > 0) {
    const lastActual = todayActualPoints[todayActualPoints.length - 1];
    nowCoord.y = mapRevenueToY(lastActual.actualRevenue);
  }

  const todayActual2D = todayActualPoints.map((p) => ({
    x: mapHourToX(p.hour),
    y: mapRevenueToY(p.actualRevenue),
  }));

  // Ensure current time point is included at the end of actual path
  if (
    todayActual2D.length === 0 ||
    Math.abs(todayActual2D[todayActual2D.length - 1].x - nowCoord.x) > 5
  ) {
    todayActual2D.push(nowCoord);
  } else {
    todayActual2D[todayActual2D.length - 1] = nowCoord;
  }

  const todayActualPath = buildSmoothSpline(todayActual2D);
  const todayAreaPath = `${todayActualPath} L ${nowCoord.x.toFixed(1)} 190 L 50 190 Z`;

  // 3. Today Projected Points (from NOW to 22:00)
  const futurePoints = sortedPoints.filter((p) => p.hour >= Math.floor(currentHourDecimal));
  const projected2D: Array<{ x: number; y: number }> = [nowCoord];

  for (const p of futurePoints) {
    const rev = p.projectedRevenue ?? p.yesterdayRevenue ?? 3000;
    projected2D.push({
      x: mapHourToX(p.hour),
      y: mapRevenueToY(rev),
    });
  }

  const projectedPath = buildSmoothSpline(projected2D);
  const lastProj = projected2D[projected2D.length - 1] || { x: 570, y: 190 };
  const projectedAreaPath = `${projectedPath} L ${lastProj.x.toFixed(1)} 190 L ${nowCoord.x.toFixed(1)} 190 Z`;

  // 4. Find Lunch Peak (~12:00-13:30) and Dinner Peak (~17:30-19:30)
  let lunchPeak = { x: 265, y: 45, value: 7400 };
  let dinnerPeak = { x: 455, y: 48, value: 7200 };

  for (const p of sortedPoints) {
    if (p.hour >= 11 && p.hour <= 13 && p.actualRevenue && p.actualRevenue > (lunchPeak.value || 0)) {
      lunchPeak = {
        x: mapHourToX(p.hour),
        y: mapRevenueToY(p.actualRevenue),
        value: p.actualRevenue,
      };
    }
    const eveningRev = p.projectedRevenue ?? p.yesterdayRevenue ?? 0;
    if (p.hour >= 17 && p.hour <= 20 && eveningRev > (dinnerPeak.value || 0)) {
      dinnerPeak = {
        x: mapHourToX(p.hour),
        y: mapRevenueToY(eveningRev),
        value: eveningRev,
      };
    }
  }

  return {
    todayActualPath,
    todayAreaPath,
    yesterdayPath,
    projectedPath,
    projectedAreaPath,
    nowCoordinate: nowCoord,
    lunchPeak,
    dinnerPeak,
  };
}
