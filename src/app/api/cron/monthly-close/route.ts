import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { executeMonthlyCloseAndPurge } from "@/lib/services/monthlyCloseService";

export async function GET(req: NextRequest) {
  // Validate Cron Secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "kipp-cron-secret-2026";
  if (authHeader !== `Bearer ${cronSecret}`) {
    // If running in development or query token provided
    const tokenQuery = req.nextUrl.searchParams.get("secret");
    if (tokenQuery !== cronSecret && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }
  }

  try {
    // Run for all active tenants
    const tenants = await db.tenant.findMany({
      select: { id: true, name: true },
    });

    const results = [];
    for (const tenant of tenants) {
      try {
        const res = await executeMonthlyCloseAndPurge({
          tenantId: tenant.id,
          closedBy: "SYSTEM_CRON_00:00",
        });
        results.push({ tenant: tenant.name, status: "SUCCESS", ...res });
      } catch (tenantErr: any) {
        results.push({
          tenant: tenant.name,
          status: "FAILED",
          error: tenantErr.message,
        });
      }
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
