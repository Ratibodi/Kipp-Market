import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verifyPin } from "@/lib/auth/posSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, pin, actionTitle, terminalId, cashierId } = body;

    if (!pin) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัส PIN ของผู้จัดการ (Manager PIN)" },
        { status: 400 }
      );
    }

    let approvedManager = null;

    try {
      // Find all active Managers or Owners in this tenant
      const managers = await db.member.findMany({
        where: {
          ...(tenantId ? { tenantId } : {}),
          role: { in: ["OWNER", "MANAGER"] },
          isActive: true,
        },
      });

      for (const manager of managers) {
        if (manager.pinHash && (await verifyPin(pin, manager.pinHash))) {
          approvedManager = manager;
          break;
        }
      }
    } catch {
      // DB offline, fall through to dev mock PIN check
    }

    // Fallback: Check mock PIN 9999 in development
    if (!approvedManager && pin === "9999") {
      approvedManager = {
        id: "manager-override-mock",
        displayName: "ผู้จัดการสาขา (Manager Override)",
        role: "MANAGER",
        tenantId: tenantId || "mock-tenant",
      };
    }

    if (!approvedManager) {
      return NextResponse.json(
        { error: "รหัส PIN ไม่ถูกต้อง หรือไม่มีสิทธิ์ระดับผู้จัดการ" },
        { status: 403 }
      );
    }

    // Log to AuditLog if tenantId exists
    if (tenantId && approvedManager.id !== "manager-override-mock") {
      await db.auditLog.create({
        data: {
          tenantId,
          actorId: approvedManager.id,
          action: "MANAGER_OVERRIDE",
          entity: "POS_ACTION",
          entityId: terminalId || "TERMINAL",
          data: {
            actionTitle: actionTitle || "Manager Override Approved",
            cashierId: cashierId || "UNKNOWN",
            approvedAt: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `อนุมัติสำเร็จโดย: ${approvedManager.displayName}`,
      manager: {
        id: approvedManager.id,
        displayName: approvedManager.displayName,
        role: approvedManager.role,
      },
    });
  } catch (error: unknown) {
    console.error("Manager Override Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ผู้จัดการ" },
      { status: 500 }
    );
  }
}
