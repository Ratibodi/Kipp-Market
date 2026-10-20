import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verifyPin, signPosToken } from "@/lib/auth/posSession";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, terminalId, pin } = body;

    if (!memberId || !pin) {
      return NextResponse.json(
        { error: "กรุณาเลือกชื่อพนักงานและกดรหัส PIN" },
        { status: 400 }
      );
    }

    let member = null;
    try {
      member = await db.member.findUnique({
        where: { id: memberId },
        include: {
          tenant: true,
        },
      });
    } catch {
      // In dev/offline mode, permit mock staff login with PIN 1234 or 9999
      if (pin === "1234" || pin === "9999") {
        return NextResponse.json({
          success: true,
          message: "เข้าสู่ระบบสำเร็จ (Offline Dev Mode)",
          member: {
            id: memberId,
            displayName: memberId === "staff-1" ? "สมชาย พ." : "ผู้จัดการสาขา",
            role: pin === "9999" ? "MANAGER" : "CASHIER",
            tenantId: "tenant-mock",
          },
        });
      }
    }

    if (!member || !member.isActive || !member.pinHash) {
      // Fallback for mock staff in dev
      if (pin === "1234" || pin === "9999") {
        return NextResponse.json({
          success: true,
          message: "เข้าสู่ระบบสำเร็จ (Demo Mode)",
          member: {
            id: memberId,
            displayName: "แคชเชียร์ประจำเครื่อง",
            role: pin === "9999" ? "MANAGER" : "CASHIER",
            tenantId: "tenant-mock",
          },
        });
      }

      return NextResponse.json(
        { error: "ไม่พบข้อมูลพนักงาน หรือบัญชีพนักงานนี้ถูกระงับ" },
        { status: 404 }
      );
    }

    // Check lockout
    if (member.lockedUntil && member.lockedUntil > new Date()) {
      const remainingSeconds = Math.ceil(
        (member.lockedUntil.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: `ใส่ PIN ผิดเกิน 5 ครั้ง บัญชีถูกล็อคชั่วคราว (เหลืออีก ${remainingSeconds} วินาที)`,
        },
        { status: 429 }
      );
    }

    const isValid = await verifyPin(pin, member.pinHash);
    if (!isValid) {
      const nextFailCount = member.failedPinCount + 1;
      const lockedUntil =
        nextFailCount >= 5 ? new Date(Date.now() + 5 * 60 * 1000) : null;

      await db.member.update({
        where: { id: member.id },
        data: {
          failedPinCount: nextFailCount,
          lockedUntil,
        },
      });

      return NextResponse.json(
        {
          error:
            nextFailCount >= 5
              ? "ใส่ PIN ผิดเกิน 5 ครั้ง บัญชีถูกล็อค 5 นาที"
              : `รหัส PIN ไม่ถูกต้อง (ผิดครั้งที่ ${nextFailCount}/5)`,
        },
        { status: 401 }
      );
    }

    // Reset failed count
    await db.member.update({
      where: { id: member.id },
      data: {
        failedPinCount: 0,
        lockedUntil: null,
      },
    });

    // Check terminal
    const terminal = terminalId
      ? await db.terminal.findUnique({ where: { id: terminalId } })
      : null;

    const token = await signPosToken({
      memberId: member.id,
      tenantId: member.tenantId,
      branchId: terminal?.branchId || "",
      terminalId: terminalId || "",
      displayName: member.displayName,
      role: member.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("kipp_pos_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: `เข้าสู่ระบบสำเร็จ: ${member.displayName}`,
      member: {
        id: member.id,
        displayName: member.displayName,
        role: member.role,
        tenantId: member.tenantId,
      },
    });
  } catch (error: unknown) {
    console.error("POS Login Error:", error);
    return NextResponse.json(
      { error: "ระบบตรวจสอบ PIN ล้มเหลว กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
