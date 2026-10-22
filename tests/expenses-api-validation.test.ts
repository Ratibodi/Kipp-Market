import { describe, it, expect } from "vitest";

export interface ExpenseValidationInput {
  type: "EXPENSE" | "INFLOW";
  category: string;
  amount: number;
}

export function validateExpenseInput(input: Partial<ExpenseValidationInput>): { valid: boolean; error?: string } {
  if (!input.type || (input.type !== "EXPENSE" && input.type !== "INFLOW")) {
    return { valid: false, error: "Invalid movement type: must be EXPENSE or INFLOW" };
  }
  if (!input.category || typeof input.category !== "string" || input.category.trim() === "") {
    return { valid: false, error: "Category is required" };
  }
  if (input.amount == null || typeof input.amount !== "number" || isNaN(input.amount) || input.amount <= 0) {
    return { valid: false, error: "Amount must be a positive number greater than 0" };
  }
  return { valid: true };
}

describe("Expense API Payload Validation", () => {
  it("accepts valid EXPENSE payload", () => {
    const result = validateExpenseInput({
      type: "EXPENSE",
      category: "Store Utilities",
      amount: 1500,
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("accepts valid INFLOW payload", () => {
    const result = validateExpenseInput({
      type: "INFLOW",
      category: "Side Business",
      amount: 5000,
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects invalid movement type", () => {
    const result = validateExpenseInput({
      type: "INVALID" as any,
      category: "Side Business",
      amount: 5000,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid movement type");
  });

  it("rejects zero or negative amount", () => {
    expect(validateExpenseInput({ type: "EXPENSE", category: "Test", amount: 0 }).valid).toBe(false);
    expect(validateExpenseInput({ type: "EXPENSE", category: "Test", amount: -500 }).valid).toBe(false);
  });

  it("rejects empty category", () => {
    expect(validateExpenseInput({ type: "INFLOW", category: "", amount: 1000 }).valid).toBe(false);
  });
});
