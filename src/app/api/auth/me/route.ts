import { NextRequest, NextResponse } from "next/server";
import { verifyPosToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get("kipp_session")?.value ||
      req.cookies.get("kipp_pos_session")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, user: null, message: "No active session" },
        { status: 401 }
      );
    }

    const session = await verifyPosToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, user: null, message: "Invalid or expired session" },
        { status: 401 }
      );
    }

    let branchName = "สาขาสุขุมวิท ซอย 24";
    let branchCode = "BKK-024";

    if (session.branchId) {
      try {
        const { db } = await import("@/server/db");
        const branch = await db.branch.findUnique({
          where: { id: session.branchId },
          select: { name: true, code: true },
        });
        if (branch) {
          branchName = branch.name;
          branchCode = branch.code;
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.memberId,
        displayName: session.displayName,
        role: session.role,
        tenantId: session.tenantId,
        branchId: session.branchId,
        branchName,
        branchCode,
        terminalId: session.terminalId,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, user: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
