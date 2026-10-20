import { Prisma } from "@prisma/client";

/**
 * Money and Decimal calculation utilities for Kipp Market.
 * Never use raw JS IEEE-754 floating point numbers for currency calculations.
 */

export function toDecimal(value: string | number | Prisma.Decimal): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export function formatMoney(value: string | number | Prisma.Decimal): string {
  const dec = new Prisma.Decimal(value);
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dec.toNumber());
}

export function formatNumber(value: string | number | Prisma.Decimal, decimals = 2): string {
  const dec = new Prisma.Decimal(value);
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(dec.toNumber());
}

export function roundToTwo(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function roundToThree(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(3, Prisma.Decimal.ROUND_HALF_UP);
}
