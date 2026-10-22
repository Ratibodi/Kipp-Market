import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verifyPosToken } from "@/lib/auth/jwt";
import { PromptPayType } from "@prisma/client";

const DEFAULT_CONFIG = {
  promptpayType: "PHONE" as PromptPayType,
  promptpayId: "0819998841",
  accountName: "กิ๊ป มินิมาร์ท",
  promptpayEnabled: true,
  cashEnabled: true,
};

// In-memory cache for fast access & offline resilience
let cachedPaymentSetting = { ...DEFAULT_CONFIG };

export async function GET(req: NextRequest) {
  try {
    let tenantId = req.headers.get("x-tenant-id");

    if (!tenantId) {
      const token = req.cookies.get("kipp_session")?.value;
      if (token) {
        const session = await verifyPosToken(token);
        if (session) tenantId = session.tenantId;
      }
    }

    let tenant = null;
    let setting = null;

    try {
      if (tenantId) {
        setting = await db.paymentSetting.findFirst({
          where: { tenantId },
          include: { tenant: true },
        });
        tenant = setting?.tenant;
      } else {
        // Fallback to first tenant
        setting = await db.paymentSetting.findFirst({
          include: { tenant: true },
        });
        tenant = setting?.tenant;
      }
    } catch (dbErr) {
      console.warn("DB payment setting read fallback:", dbErr);
    }

    if (setting) {
      cachedPaymentSetting = {
        promptpayType: setting.promptpayType,
        promptpayId: setting.promptpayId || DEFAULT_CONFIG.promptpayId,
        accountName: setting.accountName || tenant?.name || DEFAULT_CONFIG.accountName,
        promptpayEnabled: setting.promptpayEnabled,
        cashEnabled: setting.cashEnabled,
      };
    }

    return NextResponse.json({
      success: true,
      settings: cachedPaymentSetting,
    });
  } catch (error: unknown) {
    console.error("GET Payment Setting Error:", error);
    return NextResponse.json({
      success: true,
      settings: cachedPaymentSetting,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptpayType, promptpayId, accountName, promptpayEnabled = true, cashEnabled = true } = body;

    if (!promptpayId) {
      return NextResponse.json(
        { error: "กรุณาระบุหมายเลข PromptPay (เบอร์โทร หรือเลขประจำตัวผู้เสียภาษี)" },
        { status: 400 }
      );
    }

    const cleanId = String(promptpayId).replace(/[^0-9]/g, "");
    const cleanType: PromptPayType = (promptpayType as PromptPayType) || "PHONE";
    const cleanAccountName = accountName?.trim() || "KIPP MARKET";

    // Update in-memory cache immediately
    cachedPaymentSetting = {
      promptpayType: cleanType,
      promptpayId: cleanId,
      accountName: cleanAccountName,
      promptpayEnabled: !!promptpayEnabled,
      cashEnabled: !!cashEnabled,
    };

    let tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) {
      const token = req.cookies.get("kipp_session")?.value;
      if (token) {
        const session = await verifyPosToken(token);
        if (session) tenantId = session.tenantId;
      }
    }

    try {
      if (!tenantId) {
        const firstTenant = await db.tenant.findFirst();
        if (firstTenant) tenantId = firstTenant.id;
      }

      if (tenantId) {
        const existing = await db.paymentSetting.findFirst({
          where: { tenantId },
        });

        if (existing) {
          await db.paymentSetting.update({
            where: { id: existing.id },
            data: {
              promptpayType: cleanType,
              promptpayId: cleanId,
              accountName: cleanAccountName,
              promptpayEnabled: !!promptpayEnabled,
              cashEnabled: !!cashEnabled,
            },
          });
        } else {
          await db.paymentSetting.create({
            data: {
              tenantId,
              promptpayType: cleanType,
              promptpayId: cleanId,
              accountName: cleanAccountName,
              promptpayEnabled: !!promptpayEnabled,
              cashEnabled: !!cashEnabled,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB payment setting write warning (using cache):", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกการตั้งค่า PromptPay สำเร็จ พร้อมใช้งานที่เครื่องคิดเงิน POS ทันที",
      settings: cachedPaymentSetting,
    });
  } catch (error: unknown) {
    console.error("POST Payment Setting Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า" },
      { status: 500 }
    );
  }
}
