import { describe, it, expect } from "vitest";

describe("Staff Management & Role-Based Permissions (RBAC)", () => {
  type Role = "OWNER" | "MANAGER" | "CASHIER";

  interface PermissionSpec {
    canOperatePos: boolean;
    canHoldCart: boolean;
    canOpenCloseShift: boolean;
    canApproveVoid: boolean;
    canViewProfitNetMargin: boolean;
    canManageStaff: boolean;
  }

  const getRolePermissions = (role: Role): PermissionSpec => {
    switch (role) {
      case "OWNER":
        return {
          canOperatePos: true,
          canHoldCart: true,
          canOpenCloseShift: true,
          canApproveVoid: true,
          canViewProfitNetMargin: true,
          canManageStaff: true,
        };
      case "MANAGER":
        return {
          canOperatePos: true,
          canHoldCart: true,
          canOpenCloseShift: true,
          canApproveVoid: true,
          canViewProfitNetMargin: false, // Managers only see branch sales, not net margin
          canManageStaff: false, // Only owner manages staff credentials
        };
      case "CASHIER":
        return {
          canOperatePos: true,
          canHoldCart: true,
          canOpenCloseShift: true,
          canApproveVoid: false, // Must request manager override
          canViewProfitNetMargin: false,
          canManageStaff: false,
        };
    }
  };

  it("enforces strict duty segregation between Cashier and Manager", () => {
    const cashierPerms = getRolePermissions("CASHIER");
    const managerPerms = getRolePermissions("MANAGER");

    // Both can operate POS and manage their shift
    expect(cashierPerms.canOperatePos).toBe(true);
    expect(managerPerms.canOperatePos).toBe(true);
    expect(cashierPerms.canHoldCart).toBe(true);

    // Cashier CANNOT approve void or refund
    expect(cashierPerms.canApproveVoid).toBe(false);
    // Manager CAN approve void or refund
    expect(managerPerms.canApproveVoid).toBe(true);
  });

  it("grants full financial visibility and team management only to OWNER", () => {
    const ownerPerms = getRolePermissions("OWNER");
    const managerPerms = getRolePermissions("MANAGER");
    const cashierPerms = getRolePermissions("CASHIER");

    expect(ownerPerms.canViewProfitNetMargin).toBe(true);
    expect(ownerPerms.canManageStaff).toBe(true);

    expect(managerPerms.canViewProfitNetMargin).toBe(false);
    expect(cashierPerms.canViewProfitNetMargin).toBe(false);

    expect(managerPerms.canManageStaff).toBe(false);
    expect(cashierPerms.canManageStaff).toBe(false);
  });

  it("validates 4-6 digit numeric PIN format for POS terminal quick unlock", () => {
    const isValidPin = (pin: string) => {
      const clean = pin.replace(/[^0-9]/g, "");
      return clean.length >= 4 && clean.length <= 6 && clean === pin;
    };

    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("999999")).toBe(true);
    expect(isValidPin("123")).toBe(false); // Too short
    expect(isValidPin("1234567")).toBe(false); // Too long
    expect(isValidPin("12a4")).toBe(false); // Non-numeric
  });

  it("filters out suspended staff from POS keypad login and blocks authentication", () => {
    const staffRoster = [
      { id: "s1", displayName: "เจ้าของร้าน", role: "OWNER", isActive: true },
      { id: "s2", displayName: "สมชาย พ. (ผจก.)", role: "MANAGER", isActive: true },
      { id: "s3", displayName: "ณัฐพร ก. (แคชเชียร์)", role: "CASHIER", isActive: false }, // Suspended
    ];

    // Only active staff are presented as clickable PIN chips on the POS login screen
    const availableForPosLogin = staffRoster.filter((s) => s.isActive);
    expect(availableForPosLogin.length).toBe(2);
    expect(availableForPosLogin.some((s) => s.displayName.includes("ณัฐพร"))).toBe(false);

    // Authentication check for suspended account
    const authenticateStaff = (member: { isActive: boolean }) => {
      if (!member.isActive) {
        return { allowed: false, error: "พนักงานท่านนี้ถูกระงับสิทธิ์การใช้งานในระบบแล้ว ไม่สามารถเข้าสู่ระบบได้" };
      }
      return { allowed: true };
    };

    const suspendedResult = authenticateStaff(staffRoster[2]);
    expect(suspendedResult.allowed).toBe(false);
    expect(suspendedResult.error).toContain("ระงับสิทธิ์");

    const activeResult = authenticateStaff(staffRoster[0]);
    expect(activeResult.allowed).toBe(true);
  });
});
