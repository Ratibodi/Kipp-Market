import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { hashPin } from "@/lib/auth/posSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ownerPhone, storeName, storeSlug, password, firstBranch } = body;

    if (!ownerPhone || !storeName || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกเบอร์โทรศัพท์ ชื่อร้าน และรหัสผ่านให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const cleanPhone = ownerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      return NextResponse.json(
        { error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นเบอร์มือถือ 9-10 หลัก)" },
        { status: 400 }
      );
    }

    const slug =
      storeSlug ||
      storeName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-") ||
      `store-${Date.now()}`;

    // Check if slug or phone is already taken
    const existingTenant = await db.tenant.findFirst({
      where: {
        OR: [{ slug }, { ownerPhone: cleanPhone }],
      },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: "เบอร์โทรศัพท์นี้หรือชื่อร้าน (Slug) นี้ถูกลงทะเบียนไว้แล้วในระบบ" },
        { status: 409 }
      );
    }

    // Hash password / PIN using Argon2
    const passwordHash = await hashPin(password);

    // Create Tenant + Default Branch + Default Terminal + Owner Member in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: storeName,
          slug,
          ownerPhone: cleanPhone,
          status: "ACTIVE", // Auto-approved during beta
        },
      });

      // 2. Create Default Branch (Branch 01)
      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: firstBranch || "สาขาหลัก (Main Branch)",
          code: "BKK01",
        },
      });

      // 3. Create Default Terminal (POS 01)
      const terminal = await tx.terminal.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          name: "เครื่องแคชเชียร์ 01",
          code: "T01",
        },
      });

      // 4. Create Owner Member
      const member = await tx.member.create({
        data: {
          tenantId: tenant.id,
          displayName: "เจ้าของร้าน (Owner)",
          phone: cleanPhone,
          role: "OWNER",
          pinHash: passwordHash,
          isActive: true,
        },
      });

      // 5. Assign Member to Branch
      await tx.memberBranch.create({
        data: {
          tenantId: tenant.id,
          memberId: member.id,
          branchId: branch.id,
        },
      });

      // 6. Create default payment settings (PromptPay & Cash)
      await tx.paymentSetting.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          cashEnabled: true,
          promptpayEnabled: true,
          promptpayType: "PHONE",
          promptpayId: cleanPhone,
          accountName: storeName,
        },
      });

      return { tenant, branch, terminal, member };
    });

    return NextResponse.json({
      success: true,
      message: "ลงทะเบียนร้านค้าสำเร็จ พร้อมเริ่มใช้งานระบบทันที",
      data: {
        tenantId: result.tenant.id,
        storeName: result.tenant.name,
        slug: result.tenant.slug,
        ownerPhone: result.tenant.ownerPhone,
        branchId: result.branch.id,
        terminalId: result.terminal.id,
        memberId: result.member.id,
      },
    });
  } catch (error: unknown) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
