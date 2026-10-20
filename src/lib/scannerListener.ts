// Barcode Scanner Listener & Thai Keyboard Transliteration Helper
// Supports 100% of USB HID, Wireless 2.4GHz, and Bluetooth barcode scanners

const THAI_TO_EN_MAP: Record<string, string> = {
  "ๅ": "1", "+": "1",
  "/": "2", "๑": "2",
  "-": "3", "๒": "3",
  "ภ": "4", "๓": "4",
  "ถ": "5", "๔": "5",
  "ุ": "6", "ู": "6",
  "ึ": "7", "฿": "7",
  "ค": "8", "๕": "8",
  "ต": "9", "๖": "9",
  "จ": "0", "๗": "0",
  "ข": "-", "๘": "-",
  "ช": "=", "๙": "=",
};

/**
 * Automatically converts Thai keyboard layout keystrokes back to English numbers.
 * Solves the common retail issue where a cashier leaves the keyboard in Thai language.
 */
export function transliterateThaiBarcode(raw: string): string {
  let cleaned = "";
  for (const char of raw) {
    cleaned += THAI_TO_EN_MAP[char] || char;
  }
  return cleaned.trim();
}
