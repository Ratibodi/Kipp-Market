import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { MOCK_CUSTOMERS } from "@/data/mockData";

// GET /api/customers?phone=0812345678&tenantId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const tenantId = searchParams.get("tenantId");

    if (!phone) {
      return NextResponse.json(
        { error: "กรุณาระบุหมายเลขโทรศัพท์" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");

    let customer = null;
    try {
      customer = await db.customer.findFirst({
        where: {
          phone: cleanPhone,
          ...(tenantId ? { tenantId } : {}),
        },
      });
    } catch {
      // Fallback to MOCK_CUSTOMERS in development/offline mode
      const mock = MOCK_CUSTOMERS.find(
        (c) => c.phone.replace(/[^0-9]/g, "") === cleanPhone
      );
      if (mock) {
        return NextResponse.json({
          found: true,
          customer: {
            id: mock.id,
            phone: mock.phone,
            name: mock.name,
            tier: mock.tier,
            pointsBalance: mock.pointsBalance,
            joinedAt: mock.joinedDate,
          },
        });
      }
    }

    if (!customer) {
      // Check MOCK_CUSTOMERS as second chance
      const mock = MOCK_CUSTOMERS.find(
        (c) => c.phone.replace(/[^0-9]/g, "") === cleanPhone
      );
      if (mock) {
        return NextResponse.json({
          found: true,
          customer: {
            id: mock.id,
            phone: mock.phone,
            name: mock.name,
            tier: mock.tier,
            pointsBalance: mock.pointsBalance,
            joinedAt: mock.joinedDate,
          },
        });
      }

      return NextResponse.json(
        { found: false, message: "ไม่พบข้อมูลสมาชิกด้วยเบอร์โทรศัพท์นี้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      found: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
        joinedAt: customer.joinedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Search Customer Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการค้นหาสมาชิก" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Register loyalty member by phone
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, phone, name, birthDate } = body;

    if (!phone || !name) {
      return NextResponse.json(
        { error: "กรุณากรอกเบอร์โทรศัพท์และชื่อ-นามสกุลสมาชิก" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      return NextResponse.json(
        { error: "หมายเลขโทรศัพท์ต้องมี 9-10 หลัก" },
        { status: 400 }
      );
    }

    // Get tenant or default tenant
    let targetTenantId = tenantId;
    if (!targetTenantId) {
      const firstTenant = await db.tenant.findFirst({ select: { id: true } });
      targetTenantId = firstTenant?.id;
    }

    if (!targetTenantId) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลร้านค้า (tenantId)" },
        { status: 400 }
      );
    }

    // Check if customer phone already registered
    const existing = await db.customer.findFirst({
      where: {
        tenantId: targetTenantId,
        phone: cleanPhone,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `เบอร์โทรศัพท์ ${cleanPhone} เป็นสมาชิกอยู่แล้ว (${existing.name})` },
        { status: 409 }
      );
    }

    // Create new customer with 50 welcome points
    const customer = await db.customer.create({
      data: {
        tenantId: targetTenantId,
        phone: cleanPhone,
        name,
        tier: "BRONZE",
        pointsBalance: 50, // Welcome points bonus
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `ลงทะเบียนสมาชิก ${customer.name} สำเร็จ! ได้รับแต้มต้อนรับ 50 แต้ม`,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
        joinedAt: customer.joinedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Register Customer Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลงทะเบียนสมาชิก" },
      { status: 500 }
    );
  }
}
