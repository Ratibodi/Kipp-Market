import { describe, it, expect } from "vitest";
import {
  createPromptPayPayload,
  createPromptPayQrDataUrl,
  formatPromptPayDisplay,
} from "../src/lib/promptpay";

describe("PromptPay Thai QR Payment (Bank of Thailand EMVCo Standard)", () => {
  it("generates authentic EMVCo payload for 10-digit mobile phone number", () => {
    const phone = "081-999-8841";
    const amount = 196.0;

    const payload = createPromptPayPayload(phone, amount);

    // BOT EMVCo standard requirements
    expect(payload).toContain("000201"); // Tag 00: Format Indicator
    expect(payload).toContain("010212"); // Tag 01: Point of Initiation (12 = Dynamic QR with amount)
    expect(payload).toContain("A000000677010111"); // AID for Thai PromptPay National Switch
    expect(payload).toContain("0066819998841"); // Mobile number formatted with Thai country code
    expect(payload).toContain("5303764"); // Currency 764 = THB
    expect(payload).toContain("5406196.00"); // Amount 196.00 THB
    expect(payload).toContain("5802TH"); // Country code TH
    expect(payload).toMatch(/6304[A-F0-9]{4}$/); // CRC16 checksum
  });

  it("generates authentic EMVCo payload for 13-digit Tax ID / National ID", () => {
    const taxId = "0105558194821";
    const amount = 50.0;

    const payload = createPromptPayPayload(taxId, amount);

    expect(payload).toContain("000201");
    expect(payload).toContain("02130105558194821"); // Subtag 02: 13-digit National/Tax ID
    expect(payload).toContain("5303764"); // THB
    expect(payload).toContain("540550.00"); // 50.00 THB
  });

  it("creates high-resolution scannable QR Code Data URL", async () => {
    const { payload, qrDataUrl } = await createPromptPayQrDataUrl("0819998841", 196.0);

    expect(payload.length).toBeGreaterThan(50);
    expect(qrDataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(qrDataUrl.length).toBeGreaterThan(500);
  });

  it("formats PromptPay identifiers for clear cashier and customer display", () => {
    expect(formatPromptPayDisplay("0819998841", "PHONE")).toBe("081-999-8841");
    expect(formatPromptPayDisplay("081-999-8841", "PHONE")).toBe("081-999-8841");
    expect(formatPromptPayDisplay("0105558194821", "TAX_ID")).toBe("0-1055-58194-82-1");
  });
});
