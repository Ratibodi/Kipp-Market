import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { hashPin } from "@/lib/auth/posSession";
import { verifyPosToken } from "@/lib/auth/jwt";
import { Role } from "@prisma/client";

// Mock staff fallback for offline/demo resilience
let inMemoryStaff = [
  {
    id: "staff-owner",
    displayName: "เจ้าของร้าน (Owner)",
    phone: "0819998841",
    role: "OWNER" as Role,
    isActive: true,
    hasPin: true,
    branchId: "branch-bkk-024",
    branchName: "สาขาสุขุมวิท ซอย 24 (สาขาหลัก)",
    branchCode: "BKK-024",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-mgr-1",
    displayName: "สมชาย พาณิชย์",
    phone: "0891112233",
    role: "MANAGER" as Role,
    isActive: true,
    hasPin: true,
    branchId: "branch-bkk-024",
    branchName: "สาขาสุขุมวิท ซอย 24 (สาขาหลัก)",
    branchCode: "BKK-024",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-csh-1",
    displayName: "ณัฐพร กิตติสาร",
    phone: "0823334455",
    role: "CASHIER" as Role,
    isActive: true,
    hasPin: true,
    branchId: "branch-bkk-024",
    branchName: "สาขาสุขุมวิท ซอย 24 (สาขาหลัก)",
    branchCode: "BKK-024",
    createdAt: new Date().toISOString(),
  },
];

async function getTenantId(req: NextRequest): Promise<string | null> {
  let tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    const token = req.cookies.get("kipp_session")?.value;
    if (token) {
      const session = await verifyPosToken(token);
      if (session) tenantId = session.tenantId;
    }
  }
  if (!tenantId) {
    const firstTenant = await db.tenant.findFirst();
    if (firstTenant) tenantId = firstTenant.id;
  }
  return tenantId;
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantId(req);

    if (tenantId) {
      const [members, tenant] = await Promise.all([
        db.member.findMany({
          where: { tenantId },
          orderBy: [{ role: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            displayName: true,
            phone: true,
            role: true,
            isActive: true,
            failedPinCount: true,
            lockedUntil: true,
            createdAt: true,
            pinHash: true,
            memberBranches: {
              include: {
                branch: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        }),
        db.tenant.findUnique({
          where: { id: tenantId },
          select: { name: true, slug: true },
        }),
      ]);

      if (members.length > 0) {
        return NextResponse.json({
          success: true,
          storeName: tenant?.name || "Kipp Market (สาขาหลัก)",
          staff: members.map((m) => {
            const primaryBranch = m.memberBranches?.[0]?.branch;
            return {
              id: m.id,
              displayName: m.displayName,
              phone: m.phone || "-",
              role: m.role,
              isActive: m.isActive,
              isLocked: !!(m.lockedUntil && m.lockedUntil > new Date()),
              hasPin: !!m.pinHash,
              branchId: primaryBranch?.id || null,
              branchName: primaryBranch?.name || "สาขาหลัก",
              branchCode: primaryBranch?.code || "MAIN",
              createdAt: m.createdAt,
            };
          }),
        });
      }
    }

    return NextResponse.json({
      success: true,
      storeName: "Kipp Market Demo",
      staff: inMemoryStaff,
    });
  } catch (error: unknown) {
    console.error("GET Staff Error:", error);
    return NextResponse.json({
      success: true,
      staff: inMemoryStaff,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { displayName, phone, role = "CASHIER", pin = "1234", branchId } = body;

    if (!displayName || !displayName.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อ-นามสกุลของพนักงาน" },
        { status: 400 }
      );
    }

    const cleanPin = String(pin).replace(/[^0-9]/g, "");
    if (cleanPin.length < 4 || cleanPin.length > 6) {
      return NextResponse.json(
        { error: "รหัส PIN ต้องเป็นตัวเลข 4 - 6 หลักสำหรับกดเข้าเครื่อง POS" },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, "") : null;
    const pinHash = await hashPin(cleanPin);
    const tenantId = await getTenantId(req);

    if (tenantId) {
      let branch = null;
      if (branchId) {
        branch = await db.branch.findFirst({ where: { id: branchId, tenantId } });
      }
      if (!branch) {
        branch = await db.branch.findFirst({ where: { tenantId } });
      }

      const newMember = await db.member.create({
        data: {
          tenantId,
          displayName: displayName.trim(),
          phone: cleanPhone,
          role: role as Role,
          pinHash,
          isActive: true,
          memberBranches: branch
            ? {
                create: {
                  tenantId,
                  branchId: branch.id,
                },
              }
            : undefined,
        },
        select: {
          id: true,
          displayName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `เพิ่มพนักงาน "${newMember.displayName}" เรียบร้อยแล้ว (สังกัด: ${branch?.name || "สาขาหลัก"}, PIN: ${cleanPin})`,
        staff: {
          ...newMember,
          branchId: branch?.id || null,
          branchName: branch?.name || "สาขาหลัก",
          branchCode: branch?.code || "MAIN",
          hasPin: true,
          isLocked: false,
        },
      });
    }

    // Fallback: update inMemoryStaff
    const mockCreated = {
      id: `staff-${Date.now()}`,
      displayName: displayName.trim(),
      phone: cleanPhone || "-",
      role: role as Role,
      isActive: true,
      hasPin: true,
      branchId: branchId || "branch-bkk-024",
      branchName: "สาขาสุขุมวิท ซอย 24 (สาขาหลัก)",
      branchCode: "BKK-024",
      createdAt: new Date().toISOString(),
    };
    inMemoryStaff.push(mockCreated);

    return NextResponse.json({
      success: true,
      message: `เพิ่มพนักงาน "${mockCreated.displayName}" เรียบร้อยแล้ว (Demo Mode)`,
      staff: mockCreated,
    });
  } catch (error: unknown) {
    console.error("POST Staff Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มพนักงาน กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, displayName, phone, role, isActive, pin, branchId } = body;

    if (!id) {
      return NextResponse.json({ error: "ไม่พบรหัสพนักงาน" }, { status: 400 });
    }

    const tenantId = await getTenantId(req);

    let updateData: Record<string, unknown> = {};
    if (displayName) updateData.displayName = displayName.trim();
    if (phone !== undefined) updateData.phone = phone ? String(phone).replace(/[^0-9]/g, "") : null;
    if (role) updateData.role = role as Role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    if (pin) {
      const cleanPin = String(pin).replace(/[^0-9]/g, "");
      if (cleanPin.length < 4 || cleanPin.length > 6) {
        return NextResponse.json(
          { error: "รหัส PIN ต้องเป็นตัวเลข 4 - 6 หลัก" },
          { status: 400 }
        );
      }
      updateData.pinHash = await hashPin(cleanPin);
      updateData.failedPinCount = 0;
      updateData.lockedUntil = null;
    }

    try {
      const updated = await db.member.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          displayName: true,
          phone: true,
          role: true,
          isActive: true,
          tenantId: true,
        },
      });

      if (branchId) {
        const resolvedTenantId = tenantId || updated.tenantId;
        const targetBranch = await db.branch.findFirst({
          where: { id: branchId, tenantId: resolvedTenantId },
        });
        if (targetBranch) {
          await db.memberBranch.deleteMany({ where: { memberId: id } });
          await db.memberBranch.create({
            data: {
              tenantId: resolvedTenantId,
              memberId: id,
              branchId: targetBranch.id,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: pin
          ? `รีเซ็ตรหัส PIN ของ ${updated.displayName} เป็น ${pin} สำเร็จ`
          : `อัปเดตข้อมูล ${updated.displayName} เรียบร้อยแล้ว`,
        staff: updated,
      });
    } catch {
      // In-memory update fallback
      const staffIdx = inMemoryStaff.findIndex((s) => s.id === id);
      if (staffIdx !== -1) {
        inMemoryStaff[staffIdx] = {
          ...inMemoryStaff[staffIdx],
          ...updateData,
          displayName: (updateData.displayName as string) || inMemoryStaff[staffIdx].displayName,
          phone: (updateData.phone as string) || inMemoryStaff[staffIdx].phone,
          role: (updateData.role as Role) || inMemoryStaff[staffIdx].role,
          isActive: updateData.isActive !== undefined ? (updateData.isActive as boolean) : inMemoryStaff[staffIdx].isActive,
          branchId: branchId || inMemoryStaff[staffIdx].branchId,
        };
      }
      return NextResponse.json({
        success: true,
        message: "อัปเดตข้อมูลพนักงานสำเร็จ",
      });
    }
  } catch (error: unknown) {
    console.error("PUT Staff Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน" },
      { status: 500 }
    );
  }
}
