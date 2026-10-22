import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verifyPin, signPosToken } from "@/lib/auth/posSession";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password, rememberMe = true } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");

    // Find member by phone
    let member = null;
    try {
      member = await db.member.findFirst({
        where: {
          phone: cleanPhone,
        },
        include: {
          tenant: true,
          memberBranches: {
            include: {
              branch: {
                include: {
                  terminals: true,
                },
              },
            },
          },
        },
      });

      if (member && !member.isActive) {
        return NextResponse.json(
          { error: "บัญชีนี้ถูกระงับสิทธิ์การใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบร้านค้า" },
          { status: 403 }
        );
      }
    } catch (dbErr) {
      console.warn("DB find member exception, checking demo credentials:", dbErr);
    }

    if (!member || !member.pinHash) {
      // Demo store owner fallback for 081-999-8841 / kipp1234
      if (cleanPhone === "0819998841" && password === "kipp1234") {
        const expiresIn = rememberMe ? "30d" : "12h";
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 12 * 60 * 60;

        const token = await signPosToken(
          {
            memberId: "demo-owner-8841",
            tenantId: "demo-tenant-kipp",
            branchId: "demo-branch-01",
            terminalId: "demo-term-01",
            displayName: "สมชาย พ. (เจ้าของร้าน)",
            role: "OWNER",
          },
          expiresIn
        );

        const cookieStore = await cookies();
        cookieStore.set("kipp_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge,
          path: "/",
        });

        return NextResponse.json({
          success: true,
          message: "ยินดีต้อนรับ สมชาย พ. (เจ้าของร้าน)",
          rememberMe: !!rememberMe,
          data: {
            memberId: "demo-owner-8841",
            displayName: "สมชาย พ. (เจ้าของร้าน)",
            role: "OWNER",
            tenantId: "demo-tenant-kipp",
            storeName: "Kipp Market - Sukhumvit Soi 24",
            branchId: "demo-branch-01",
            terminalId: "demo-term-01",
          },
        });
      }

      return NextResponse.json(
        { error: "ไม่พบบัญชีผู้ใช้งานด้วยเบอร์โทรศัพท์นี้ หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Check account lockout
    if (member.lockedUntil && member.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil(
        (member.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `บัญชีถูกระงับชั่วคราวเนื่องจากใส่รหัสผิดเกิน 5 ครั้ง กรุณารออีก ${waitMinutes} นาที`,
        },
        { status: 429 }
      );
    }

    // Verify password / PIN
    const isValid = await verifyPin(password, member.pinHash);
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
              ? "ใส่รหัสผิดเกิน 5 ครั้ง บัญชีถูกล็อค 5 นาที"
              : `รหัสผ่านไม่ถูกต้อง (ผิดครั้งที่ ${nextFailCount}/5)`,
        },
        { status: 401 }
      );
    }

    // Reset failed count on success
    await db.member.update({
      where: { id: member.id },
      data: {
        failedPinCount: 0,
        lockedUntil: null,
      },
    });

    const defaultBranch = member.memberBranches[0]?.branch;
    const defaultTerminal = defaultBranch?.terminals[0];

    const expiresIn = rememberMe ? "30d" : "12h";
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 12 * 60 * 60;

    // Sign session token
    const token = await signPosToken(
      {
        memberId: member.id,
        tenantId: member.tenantId,
        branchId: defaultBranch?.id || "",
        terminalId: defaultTerminal?.id || "",
        displayName: member.displayName,
        role: member.role,
      },
      expiresIn
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("kipp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: `ยินดีต้อนรับ ${member.displayName}`,
      rememberMe: !!rememberMe,
      data: {
        memberId: member.id,
        displayName: member.displayName,
        role: member.role,
        tenantId: member.tenantId,
        storeName: member.tenant.name,
        branchId: defaultBranch?.id,
        terminalId: defaultTerminal?.id,
      },
    });
  } catch (error: unknown) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
