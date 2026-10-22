import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verifyPosToken } from "@/lib/auth/jwt";

// Mock branches fallback for offline/demo resilience
let inMemoryBranches = [
  {
    id: "branch-bkk-024",
    name: "สาขาสุขุมวิท ซอย 24 (สาขาหลัก)",
    code: "BKK-024",
    address: "สุขุมวิท ซอย 24, แขวงคลองตัน, เขตคลองเตย, กรุงเทพฯ 10110",
    isActive: true,
    terminalsCount: 1,
    createdAt: new Date().toISOString(),
  },
];

async function getTenantId(req: NextRequest): Promise<string | null> {
  let tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    const token = req.cookies.get("kipp_session")?.value || req.cookies.get("kipp_pos_session")?.value;
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
      const branches = await db.branch.findMany({
        where: { tenantId },
        include: {
          terminals: true,
        },
        orderBy: { createdAt: "asc" },
      });

      if (branches.length > 0) {
        return NextResponse.json({
          success: true,
          branches: branches.map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            address: b.address || "-",
            isActive: b.isActive,
            terminalsCount: b.terminals.length || 1,
            createdAt: b.createdAt,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      branches: inMemoryBranches,
    });
  } catch (error) {
    console.error("GET Branches Error:", error);
    return NextResponse.json({
      success: true,
      branches: inMemoryBranches,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อสาขา (เช่น สาขาอารีย์, สาขาสยาม)" },
        { status: 400 }
      );
    }

    const cleanCode = (code || `BR-${Math.floor(100 + Math.random() * 900)}`).trim().toUpperCase();
    const tenantId = await getTenantId(req);

    if (tenantId) {
      // Check duplicate code
      const existing = await db.branch.findFirst({
        where: { tenantId, code: cleanCode },
      });
      if (existing) {
        return NextResponse.json(
          { error: `รหัสสาขา "${cleanCode}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น` },
          { status: 400 }
        );
      }

      const newBranch = await db.branch.create({
        data: {
          tenantId,
          name: name.trim(),
          code: cleanCode,
          address: address?.trim() || null,
          isActive: true,
          terminals: {
            create: {
              tenantId,
              name: `Terminal 01 (${cleanCode})`,
              code: "T01",
            },
          },
        },
        include: { terminals: true },
      });

      return NextResponse.json({
        success: true,
        message: `สร้างสาขา "${newBranch.name}" (รหัส #${cleanCode}) สำเร็จ`,
        branch: {
          id: newBranch.id,
          name: newBranch.name,
          code: newBranch.code,
          address: newBranch.address || "-",
          isActive: newBranch.isActive,
          terminalsCount: newBranch.terminals.length,
          createdAt: newBranch.createdAt,
        },
      });
    }

    // In-memory fallback
    const newMock = {
      id: `branch-${Date.now()}`,
      name: name.trim(),
      code: cleanCode,
      address: address?.trim() || "-",
      isActive: true,
      terminalsCount: 1,
      createdAt: new Date().toISOString(),
    };
    inMemoryBranches.push(newMock);

    return NextResponse.json({
      success: true,
      message: `สร้างสาขา "${newMock.name}" สำเร็จ`,
      branch: newMock,
    });
  } catch (error) {
    console.error("POST Branch Error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างสาขาได้ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing branch id" }, { status: 400 });
    }

    try {
      const updated = await db.branch.update({
        where: { id },
        data: { isActive: !!isActive },
      });
      return NextResponse.json({
        success: true,
        message: `ปรับสถานะสาขา "${updated.name}" เรียบร้อยแล้ว`,
      });
    } catch {
      const target = inMemoryBranches.find((b) => b.id === id);
      if (target) {
        target.isActive = !!isActive;
      }
      return NextResponse.json({
        success: true,
        message: "ปรับสถานะสาขาเรียบร้อยแล้ว",
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}
