import Dexie, { type Table } from "dexie";

export interface CachedProduct {
  productId: string;
  tenantId: string;
  branchId: string;
  barcode?: string;
  plu?: string;
  name: string;
  saleType: "UNIT" | "WEIGHT";
  unit: string;
  price: string; // Decimal string to avoid float precision loss
  imageUrl?: string;
  isQuickKey: boolean;
  isActive: boolean;
  stockCount: number;
  updatedAt: string;
}

export interface OutboxSaleItem {
  productId: string;
  nameSnapshot: string;
  barcodeSnapshot?: string;
  qty: string;
  unitPrice: string;
  lineTotal: string;
}

export interface OutboxSale {
  id: string; // UUID v7
  tenantId: string;
  branchId: string;
  terminalId: string;
  shiftId: string;
  cashierId: string;
  receiptNo: string;
  total: string;
  paymentMethod: "CASH" | "PROMPTPAY";
  cashReceived?: string;
  change?: string;
  receiptToken: string;
  soldAt: string;
  customerId?: string;
  status: "pending" | "syncing" | "failed";
  retryCount: number;
  lastError?: string;
  items: OutboxSaleItem[];
}

export interface CachedHeldCart {
  id: string;
  heldAt: string;
  heldDate: string;
  note: string;
  items: Array<{
    id: string;
    name: string;
    sku: string;
    barcode: string;
    unitPrice: number;
    qty: number;
    lineTotal: number;
    imageUrl?: string;
    stockCount: number;
  }>;
  totalAmount: number;
  totalUnits: number;
  cashierName: string;
}

export interface CachedCustomer {
  id: string;
  phone: string;
  name: string;
  tier: "BRONZE" | "SILVER" | "GOLD";
  pointsBalance: number;
  joinedAt: string;
}

export class KippPosDatabase extends Dexie {
  cachedProducts!: Table<CachedProduct, string>;
  outboxSales!: Table<OutboxSale, string>;
  heldCarts!: Table<CachedHeldCart, string>;
  cachedCustomers!: Table<CachedCustomer, string>;

  constructor() {
    super("KippPosDB");
    this.version(1).stores({
      cachedProducts: "productId, [tenantId+branchId], barcode, plu, name, isQuickKey",
      outboxSales: "id, status, receiptNo, soldAt",
    });
    this.version(2).stores({
      cachedProducts: "productId, [tenantId+branchId], barcode, plu, name, isQuickKey",
      outboxSales: "id, status, receiptNo, soldAt, customerId",
      heldCarts: "id, heldAt, heldDate",
      cachedCustomers: "id, phone, name",
    });
  }
}

export const localDb = new KippPosDatabase();
