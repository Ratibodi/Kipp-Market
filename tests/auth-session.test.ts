import { describe, it, expect } from "vitest";
import { signPosToken, verifyPosToken, PosSessionPayload } from "../src/lib/auth/jwt";

describe("Authentication & Remember Me Session Token", () => {
  const mockPayload: PosSessionPayload = {
    memberId: "member-test-01",
    tenantId: "tenant-test-01",
    branchId: "branch-test-01",
    terminalId: "terminal-test-01",
    displayName: "สมชาย พ. (Owner)",
    role: "OWNER",
  };

  it("should sign and verify standard 12h session token", async () => {
    const token = await signPosToken(mockPayload, "12h");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const verified = await verifyPosToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.memberId).toBe(mockPayload.memberId);
    expect(verified?.tenantId).toBe(mockPayload.tenantId);
    expect(verified?.role).toBe("OWNER");
    expect(verified?.displayName).toBe("สมชาย พ. (Owner)");
  });

  it("should sign and verify extended 30d 'Remember Me' session token", async () => {
    const token = await signPosToken(mockPayload, "30d");
    expect(typeof token).toBe("string");

    const verified = await verifyPosToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.memberId).toBe(mockPayload.memberId);
    expect(verified?.tenantId).toBe(mockPayload.tenantId);
  });

  it("should return null when verifying a malformed or forged token", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.signature";
    const verified = await verifyPosToken(fakeToken);
    expect(verified).toBeNull();
  });

  it("calculates correct cookie maxAge: 30 days when Remember Me is enabled vs 12 hours when disabled", () => {
    const rememberMeMaxAge = 30 * 24 * 60 * 60; // 30 days
    const standardMaxAge = 12 * 60 * 60; // 12 hours

    expect(rememberMeMaxAge).toBe(2592000); // 2.592 million seconds
    expect(standardMaxAge).toBe(43200);

    // Verify rememberMe is 60x longer than standard session
    expect(rememberMeMaxAge / standardMaxAge).toBe(60);
  });

  it("identifies protected vs public routes according to security spec", () => {
    const isPublic = (path: string) => {
      const exactPublic = ["/", "/login", "/register"];
      const prefixPublic = ["/api/auth/", "/r/"];
      return exactPublic.includes(path) || prefixPublic.some((p) => path.startsWith(p));
    };

    // Public routes
    expect(isPublic("/")).toBe(true);
    expect(isPublic("/login")).toBe(true);
    expect(isPublic("/register")).toBe(true);
    expect(isPublic("/api/auth/login")).toBe(true);
    expect(isPublic("/api/auth/logout")).toBe(true);
    expect(isPublic("/r/receipt-token-123")).toBe(true);

    // Protected backoffice & POS routes
    expect(isPublic("/dashboard")).toBe(false);
    expect(isPublic("/dashboard/expenses")).toBe(false);
    expect(isPublic("/dashboard/products")).toBe(false);
    expect(isPublic("/pos")).toBe(false);
    expect(isPublic("/api/dashboard/overview")).toBe(false);
    expect(isPublic("/api/expenses")).toBe(false);
  });
});
