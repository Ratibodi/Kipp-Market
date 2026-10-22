import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export interface PromptPayConfig {
  promptpayType: "PHONE" | "TAX_ID" | "NATIONAL_ID" | "EWALLET";
  promptpayId: string;
  accountName: string;
  promptpayEnabled?: boolean;
}

export const DEFAULT_PROMPTPAY_CONFIG: PromptPayConfig = {
  promptpayType: "PHONE",
  promptpayId: "0819998841",
  accountName: "กิ๊ป มินิมาร์ท (KIPP MARKET)",
  promptpayEnabled: true,
};

/**
 * Format a PromptPay ID for clean display (e.g. 081-999-8841 or 0-1055-58194-82-1)
 */
export function formatPromptPayDisplay(id: string, type: string = "PHONE"): string {
  const digits = id.replace(/[^0-9]/g, "");
  if (type === "PHONE" || (digits.length === 10 && digits.startsWith("0"))) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (type === "TAX_ID" || type === "NATIONAL_ID" || digits.length === 13) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
  }
  return id;
}

/**
 * Generate standard Bank of Thailand EMVCo Thai QR Payment payload
 */
export function createPromptPayPayload(targetId: string, amount?: number): string {
  const cleanId = targetId.replace(/[^0-9]/g, "");
  if (!cleanId) {
    throw new Error("หมายเลข PromptPay ไม่ถูกต้อง กรุณาระบุเป็นตัวเลข");
  }

  // promptpay-qr generates valid EMVCo string with CRC16
  return generatePayload(cleanId, {
    amount: amount !== undefined && amount > 0 ? Number(amount.toFixed(2)) : undefined,
  });
}

/**
 * Generate a scannable QR Code Data URL (PNG image/png;base64)
 */
export async function createPromptPayQrDataUrl(
  targetId: string,
  amount?: number
): Promise<{ payload: string; qrDataUrl: string }> {
  const payload = createPromptPayPayload(targetId, amount);

  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return { payload, qrDataUrl };
}
