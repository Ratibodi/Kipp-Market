import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { executeMonthlyCloseAndPurge } from "@/lib/services/monthlyCloseService";

// GET /api/admin/monthly-close -> List archives
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let tenantId = searchParams.get("tenantId") || request.headers.get("x-tenant-id") || undefined;

    if (!tenantId) {
      const token =
        request.cookies.get("kipp_session")?.value ||
        request.cookies.get("kipp_pos_session")?.value;
      if (token) {
        const { verifyPosToken } = await import("@/lib/auth/jwt");
        const session = await verifyPosToken(token);
        if (session) tenantId = session.tenantId;
      }
    }

    if (!tenantId) {
      const firstTenant = await db.tenant.findFirst({ select: { id: true } });
      tenantId = firstTenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ archives: [] });
    }

    const archives = await db.monthlyArchive.findMany({
      where: { tenantId },
      orderBy: { yearMonth: "desc" },
    });

    return NextResponse.json({ archives });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/monthly-close -> Trigger close & purge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let tenantId = body.tenantId || request.headers.get("x-tenant-id") || undefined;
    let closedBy = "OWNER_MANUAL";

    if (!tenantId) {
      const token =
        request.cookies.get("kipp_session")?.value ||
        request.cookies.get("kipp_pos_session")?.value;
      if (token) {
        const { verifyPosToken } = await import("@/lib/auth/jwt");
        const session = await verifyPosToken(token);
        if (session) {
          tenantId = session.tenantId;
          closedBy = session.memberId || session.displayName || "OWNER";
        }
      }
    }

    if (!tenantId) {
      const firstTenant = await db.tenant.findFirst({ select: { id: true } });
      tenantId = firstTenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 400 });
    }

    const result = await executeMonthlyCloseAndPurge({
      tenantId,
      closedBy,
      targetYearMonth: body.yearMonth,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
