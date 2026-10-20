import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export interface PromptPayOptions {
  promptpayId: string; // Phone number (10 digits), National ID (13 digits), or Tax ID
  amount?: number;     // Optional fixed amount
}

/**
 * Generate PromptPay EMVCo payload string.
 * Works completely offline in the browser without network requests.
 */
export function createPromptPayPayload(options: PromptPayOptions): string {
  const { promptpayId, amount } = options;
  const cleanId = promptpayId.replace(/[^0-9]/g, "");
  return generatePayload(cleanId, { amount });
}

/**
 * Generate QR code as Data URL (Base64 SVG or PNG).
 * Suitable for rendering in an <img> tag.
 */
export async function createPromptPayQrDataUrl(
  options: PromptPayOptions
): Promise<string> {
  const payload = createPromptPayPayload(options);
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
