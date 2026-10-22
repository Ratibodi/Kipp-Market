export interface CartItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  imageUrl?: string;
  badge?: string;
  categoryTag?: string;
  stockCount: number;
}

export interface QuickPickItem {
  id: string;
  plu: string;
  name: string;
  price: number;
  category: "Bakery" | "Dim Sum" | "Fresh Fruit" | "Beverages";
  imageUrl: string;
}

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "item-1",
    name: "Meiji Pasteurized Fresh Milk 830ml",
    sku: "8850329144",
    barcode: "8850188201948",
    unitPrice: 46.5,
    qty: 2,
    lineTotal: 93.0,
    badge: "NEW",
    categoryTag: "Dairy / Cold",
    stockCount: 18,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    id: "item-2",
    name: "CP Roasted Teriyaki Chicken Rice Bowl 230g",
    sku: "8850123991",
    barcode: "8851351402910",
    unitPrice: 49.0,
    qty: 1,
    lineTotal: 49.0,
    badge: "Warmed Up",
    categoryTag: "Ready Meal",
    stockCount: 9,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    id: "item-3",
    name: "Singha Soda Water 325ml",
    sku: "8850999120",
    barcode: "8850999001201",
    unitPrice: 16.0,
    qty: 2,
    lineTotal: 32.0,
    badge: undefined,
    categoryTag: "Beverage",
    stockCount: 42,
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    id: "item-4",
    name: "Lay's Rock Potato Chips Nori Seaweed 48g",
    sku: "8851442019",
    barcode: "8850718804918",
    unitPrice: 22.0,
    qty: 1,
    lineTotal: 22.0,
    badge: "Snack Promotion",
    categoryTag: "Snacks",
    stockCount: 24,
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=120&h=120&q=80",
  },
];

export const QUICK_PICK_ITEMS: QuickPickItem[] = [
  {
    id: "qp-1",
    plu: "2041",
    name: "Custard Bun",
    price: 25.0,
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=260&h=160&q=80",
  },
  {
    id: "qp-2",
    plu: "1104",
    name: "Pork Steamed Bao",
    price: 18.0,
    category: "Dim Sum",
    imageUrl: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=260&h=160&q=80",
  },
  {
    id: "qp-3",
    plu: "4089",
    name: "Thai Tea Cold 22oz",
    price: 35.0,
    category: "Beverages",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=260&h=160&q=80",
  },
  {
    id: "qp-4",
    plu: "5002",
    name: "Cavendish Banana",
    price: 9.0,
    category: "Fresh Fruit",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=260&h=160&q=80",
  },
  {
    id: "qp-5",
    plu: "4012",
    name: "Iced Espresso 22oz",
    price: 40.0,
    category: "Beverages",
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=260&h=160&q=80",
  },
  {
    id: "qp-6",
    plu: "2099",
    name: "Glutinous Rice Taro",
    price: 15.0,
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=260&h=160&q=80",
  },
];

export interface TransactionRecord {
  id: string;
  trxId: string;
  time: string;
  cashier: string;
  lane: string;
  itemsSummary: string;
  itemCount: number;
  vat7: number;
  total: number;
  payment: "PromptPay" | "Cash" | "Credit" | "TrueMoney";
  status: "Settled" | "Partially Refunded" | "Voided";
  timestampIso: string;
}

export const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "t-1",
    trxId: "#TRX-9481",
    time: "14:28:12",
    cashier: "Somchai P.",
    lane: "Lane 01",
    itemsSummary: "4/6 pcs",
    itemCount: 6,
    vat7: 12.82,
    total: 196.0,
    payment: "PromptPay",
    status: "Settled",
    timestampIso: "2026-06-14T14:28:12+07:00",
  },
  {
    id: "t-2",
    trxId: "#TRX-9480",
    time: "14:25:44",
    cashier: "Noon R.",
    lane: "Lane 02",
    itemsSummary: "1/1 pcs",
    itemCount: 1,
    vat7: 2.29,
    total: 35.0,
    payment: "Cash",
    status: "Settled",
    timestampIso: "2026-06-14T14:25:44+07:00",
  },
  {
    id: "t-3",
    trxId: "#TRX-9479",
    time: "14:21:05",
    cashier: "Somchai P.",
    lane: "Lane 01",
    itemsSummary: "8/12 pcs",
    itemCount: 12,
    vat7: 42.46,
    total: 649.0,
    payment: "Credit",
    status: "Settled",
    timestampIso: "2026-06-14T14:21:05+07:00",
  },
  {
    id: "t-4",
    trxId: "#TRX-9478",
    time: "14:18:30",
    cashier: "Somchai P.",
    lane: "Lane 01",
    itemsSummary: "2/2 pcs",
    itemCount: 2,
    vat7: 7.85,
    total: 120.0,
    payment: "TrueMoney",
    status: "Partially Refunded",
    timestampIso: "2026-06-14T14:18:30+07:00",
  },
  {
    id: "t-5",
    trxId: "#TRX-9477",
    time: "14:14:19",
    cashier: "Noon R.",
    lane: "Lane 02",
    itemsSummary: "3/4 pcs",
    itemCount: 4,
    vat7: 14.39,
    total: 220.0,
    payment: "PromptPay",
    status: "Settled",
    timestampIso: "2026-06-14T14:14:19+07:00",
  },
  {
    id: "t-6",
    trxId: "#TRX-9476",
    time: "14:09:51",
    cashier: "Noon R.",
    lane: "Lane 02",
    itemsSummary: "5/5 pcs",
    itemCount: 5,
    vat7: 18.97,
    total: 290.0,
    payment: "Cash",
    status: "Voided",
    timestampIso: "2026-06-14T14:09:51+07:00",
  },
  {
    id: "t-7",
    trxId: "#TRX-9475",
    time: "14:02:11",
    cashier: "Somchai P.",
    lane: "Lane 01",
    itemsSummary: "2/2 pcs",
    itemCount: 2,
    vat7: 5.89,
    total: 90.0,
    payment: "PromptPay",
    status: "Settled",
    timestampIso: "2026-06-14T14:02:11+07:00",
  },
];

export const STOCK_REORDER_WARNINGS = [
  {
    id: "w-1",
    name: "Betagen Fermented Milk 400ml",
    barcode: "8850188200142",
    stock: 2,
    unit: "btls",
    reorderPt: 12,
    supplier: "CP-Meiji TH",
  },
  {
    id: "w-2",
    name: "Mama Noodles Tom Yum Shrimp 55g",
    barcode: "8851876000019",
    stock: 4,
    unit: "pks",
    reorderPt: 24,
    supplier: "Thai President Foods",
  },
  {
    id: "w-3",
    name: "CP Bologna Pork w/ Chilli 150g",
    barcode: "8850123891024",
    stock: 3,
    unit: "pks",
    reorderPt: 15,
    supplier: "CPF Direct",
  },
  {
    id: "w-4",
    name: "Chang Mineral Water 600ml",
    barcode: "8851959132014",
    stock: 5,
    unit: "btls",
    reorderPt: 30,
    supplier: "ThaiBev Logistics",
  },
];

/* -------------------------------------------------------------------------- */
/* NEW MOCK DATASETS SUPPORTING COMPLETE DESIGN DOC SCOPE                      */
/* -------------------------------------------------------------------------- */

export interface StaffMember {
  id: string;
  name: string;
  nameEn: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  pin: string;
  avatar: string;
  shiftActive: boolean;
}

export const MOCK_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "สมชาย พาณิชย์",
    nameEn: "Somchai P.",
    role: "MANAGER",
    pin: "1234",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    shiftActive: true,
  },
  {
    id: "staff-2",
    name: "ณัฐพร กิตติสาร",
    nameEn: "Nattaporn K.",
    role: "CASHIER",
    pin: "5678",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80",
    shiftActive: false,
  },
  {
    id: "staff-3",
    name: "ระทิบ เจ้าของร้าน",
    nameEn: "Ratib M.",
    role: "OWNER",
    pin: "9999",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    shiftActive: true,
  },
];

export interface CatalogProduct {
  id: string;
  sku: string;
  barcode: string;
  plu?: string;
  nameTh: string;
  nameEn: string;
  category: "Dairy" | "Ready Meal" | "Beverages" | "Snacks" | "Meat & Fresh" | "Bakery" | string;
  saleType: "UNIT" | "WEIGHT";
  unit: string;
  price: number;
  avgCost: number;
  stockQty: number;
  isQuickKey: boolean;
  imageUrl: string;
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export const MOCK_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "prod-1",
    sku: "8850329144",
    barcode: "8850188201948",
    plu: "1001",
    nameTh: "นมสดเมจิ พาสเจอร์ไรส์ 830 มล.",
    nameEn: "Meiji Pasteurized Fresh Milk 830ml",
    category: "Dairy",
    saleType: "UNIT",
    unit: "ขวด",
    price: 46.5,
    avgCost: 35.2,
    stockQty: 18,
    isQuickKey: true,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&h=160&q=80",
    status: "ACTIVE",
  },
  {
    id: "prod-2",
    sku: "8850123991",
    barcode: "8851351402910",
    plu: "1002",
    nameTh: "ข้าวไก่ย่างเทอริยากิ ซีพี 230 กรัม",
    nameEn: "CP Roasted Teriyaki Chicken Bowl 230g",
    category: "Ready Meal",
    saleType: "UNIT",
    unit: "กล่อง",
    price: 49.0,
    avgCost: 34.0,
    stockQty: 9,
    isQuickKey: true,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&h=160&q=80",
    status: "ACTIVE",
  },
  {
    id: "prod-3",
    sku: "8850999120",
    barcode: "8850999001201",
    plu: "1003",
    nameTh: "โซดาสิงห์ 325 มล.",
    nameEn: "Singha Soda Water 325ml",
    category: "Beverages",
    saleType: "UNIT",
    unit: "ขวด",
    price: 16.0,
    avgCost: 11.2,
    stockQty: 42,
    isQuickKey: true,
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=160&h=160&q=80",
    status: "ACTIVE",
  },
  {
    id: "prod-4",
    sku: "8851442019",
    barcode: "8850718804918",
    plu: "1004",
    nameTh: "เลย์ ร็อค รสโนริสาหร่าย 48 กรัม",
    nameEn: "Lay's Rock Nori Seaweed 48g",
    category: "Snacks",
    saleType: "UNIT",
    unit: "ซอง",
    price: 22.0,
    avgCost: 15.5,
    stockQty: 25,
    isQuickKey: true,
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=160&h=160&q=80",
    status: "ACTIVE",
  },
  {
    id: "prod-5",
    sku: "8850999201",
    barcode: "2101234003504",
    plu: "2010",
    nameTh: "หมูเนื้อแดงหั่นชิ้น (ชั่งน้ำหนัก)",
    nameEn: "Fresh Sliced Pork Meat (By Weight)",
    category: "Meat & Fresh",
    saleType: "WEIGHT",
    unit: "กก.",
    price: 180.0,
    avgCost: 135.0,
    stockQty: 14.85,
    isQuickKey: true,
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=160&h=160&q=80",
    status: "ACTIVE",
  },
  {
    id: "prod-6",
    sku: "8850999202",
    barcode: "2101235005001",
    plu: "2011",
    nameTh: "อกไก่สดปลอดสาร (ชั่งน้ำหนัก)",
    nameEn: "Organic Chicken Breast (By Weight)",
    category: "Meat & Fresh",
    saleType: "WEIGHT",
    unit: "กก.",
    price: 110.0,
    avgCost: 82.0,
    stockQty: 22.4,
    isQuickKey: false,
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=160&h=160&q=80",
    status: "ACTIVE",
  },
  {
    id: "prod-7",
    sku: "8850999203",
    barcode: "8850123004018",
    plu: "3001",
    nameTh: "กล้วยหอมทองแพ็กคู่",
    nameEn: "Cavendish Banana Twin Pack",
    category: "Meat & Fresh",
    saleType: "UNIT",
    unit: "แพ็ก",
    price: 18.0,
    avgCost: 12.0,
    stockQty: 6,
    isQuickKey: true,
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=160&h=160&q=80",
    status: "LOW_STOCK",
  },
  {
    id: "prod-8",
    sku: "8850999204",
    barcode: "8850123004025",
    plu: "4001",
    nameTh: "ซาลาเปาไส้หมูสับไข่เค็ม",
    nameEn: "Steamed Minced Pork Bao w/ Salted Egg",
    category: "Bakery",
    saleType: "UNIT",
    unit: "ลูก",
    price: 24.0,
    avgCost: 14.5,
    stockQty: 15,
    isQuickKey: true,
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=160&h=160&q=80",
    status: "ACTIVE",
  },
];

export interface GoodsReceipt {
  id: string;
  docNo: string;
  supplier: string;
  date: string;
  itemCount: number;
  totalCost: number;
  status: "RECEIVED" | "PENDING";
  receivedBy: string;
}

export const MOCK_RECEIPTS: GoodsReceipt[] = [
  {
    id: "gr-1",
    docNo: "GR-202606-0041",
    supplier: "CP-Meiji Distribution",
    date: "2026-06-14 09:30",
    itemCount: 4,
    totalCost: 5240.0,
    status: "RECEIVED",
    receivedBy: "สมชาย พ.",
  },
  {
    id: "gr-2",
    docNo: "GR-202606-0040",
    supplier: "Thai President Foods PCL",
    date: "2026-06-13 11:15",
    itemCount: 6,
    totalCost: 8900.0,
    status: "RECEIVED",
    receivedBy: "สมชาย พ.",
  },
  {
    id: "gr-3",
    docNo: "GR-202606-0039",
    supplier: "ThaiBev Logistics BKK",
    date: "2026-06-12 14:00",
    itemCount: 8,
    totalCost: 14200.0,
    status: "RECEIVED",
    receivedBy: "ระทิบ ม.",
  },
];

export interface StockTakeSession {
  id: string;
  code: string;
  titleTh: string;
  titleEn: string;
  date: string;
  status: "DRAFT" | "APPROVED" | "CANCELLED";
  itemsCount: number;
  varianceTotalQty: number;
  varianceTotalValue: number;
  createdBy: string;
}

export const MOCK_STOCK_TAKES: StockTakeSession[] = [
  {
    id: "st-1",
    code: "ST-202606-W2",
    titleTh: "รอบตรวจนับประจำสัปดาห์ 2 (ของสด & นม)",
    titleEn: "Weekly Cycle Count Week 2 (Dairy & Fresh)",
    date: "2026-06-14",
    status: "DRAFT",
    itemsCount: 12,
    varianceTotalQty: -3,
    varianceTotalValue: -114.5,
    createdBy: "สมชาย พ.",
  },
  {
    id: "st-2",
    code: "ST-202606-W1",
    titleTh: "รอบตรวจนับหมวดเครื่องดื่ม & ขนมขบเคี้ยว",
    titleEn: "Cycle Count Week 1 (Beverages & Snacks)",
    date: "2026-06-07",
    status: "APPROVED",
    itemsCount: 38,
    varianceTotalQty: -1,
    varianceTotalValue: -22.0,
    createdBy: "ระทิบ ม.",
  },
];

export interface ExpenseRecord {
  id: string;
  docNo: string;
  category: "Utilities" | "Store Supplies" | "Ice & Cold Store" | "Salary" | "Maintenance" | "Miscellaneous";
  categoryTh: string;
  amount: number;
  date: string;
  paidFromDrawer: boolean;
  shiftId?: string;
  spentBy: string;
  note: string;
}

export type MovementType = "EXPENSE" | "INFLOW";

export type InflowCategory =
  | "Side Business"
  | "Owner Working Capital"
  | "Storefront Rental"
  | "Vending Commission"
  | "Rebate & Scrap Sales"
  | "Shift Cash Float"
  | "Miscellaneous Inflow";

export interface FinancialMovementRecord {
  id: string;
  docNo: string;
  type: MovementType;
  category: string;
  categoryTh: string;
  amount: number;
  date: string;
  destinationOrSource: "DRAWER" | "BANK";
  shiftId?: string;
  recordedBy: string;
  note: string;
}

export function calculateFinancialSummary(
  grossSales: number,
  cogs: number,
  records: FinancialMovementRecord[]
) {
  const totalExpenses = records
    .filter((r) => r.type === "EXPENSE")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalInflows = records
    .filter((r) => r.type === "INFLOW")
    .reduce((sum, r) => sum + r.amount, 0);

  const drawerExpenses = records
    .filter((r) => r.type === "EXPENSE" && r.destinationOrSource === "DRAWER")
    .reduce((sum, r) => sum + r.amount, 0);

  const drawerInflows = records
    .filter((r) => r.type === "INFLOW" && r.destinationOrSource === "DRAWER")
    .reduce((sum, r) => sum + r.amount, 0);

  const grossProfit = grossSales - cogs;
  const netProfit = grossProfit - totalExpenses;
  const netSurplus = netProfit + totalInflows;

  return {
    grossSales,
    cogs,
    grossProfit,
    totalExpenses,
    totalInflows,
    drawerExpenses,
    drawerInflows,
    netProfit,
    netSurplus,
  };
}

export const MOCK_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp-1",
    docNo: "EXP-202606-018",
    category: "Ice & Cold Store",
    categoryTh: "ค่าน้ำแข็งหลอดหน้าร้าน",
    amount: 150.0,
    date: "2026-06-14 11:20",
    paidFromDrawer: true,
    shiftId: "SHIFT-01-MORNING",
    spentBy: "สมชาย พ.",
    note: "น้ำแข็งหลอดใหญ่ 3 ถุง สำหรับตู้เครื่องดื่มเย็น",
  },
  {
    id: "exp-2",
    docNo: "EXP-202606-017",
    category: "Store Supplies",
    categoryTh: "ถุงหูหิ้วและกระดาษพิมพ์สลิป",
    amount: 480.0,
    date: "2026-06-13 16:45",
    paidFromDrawer: true,
    shiftId: "SHIFT-01-AFTERNOON",
    spentBy: "ณัฐพร ก.",
    note: "กระดาษความร้อน 80mm จำนวน 10 ม้วน",
  },
  {
    id: "exp-3",
    docNo: "EXP-202606-016",
    category: "Utilities",
    categoryTh: "ค่าไฟฟ้าประจำเดือนมิถุนายน (งวด 1)",
    amount: 4500.0,
    date: "2026-06-10 10:00",
    paidFromDrawer: false,
    spentBy: "ระทิบ ม.",
    note: "โอนชำระการไฟฟ้านครหลวง",
  },
];

export const MOCK_FINANCIAL_MOVEMENTS: FinancialMovementRecord[] = [
  {
    id: "inf-1",
    docNo: "INF-202606-003",
    type: "INFLOW",
    category: "Side Business",
    categoryTh: "เงินทุนจากธุรกิจเสริม",
    amount: 15000.0,
    date: "2026-06-14 13:40",
    destinationOrSource: "BANK",
    recordedBy: "สมชาย พ.",
    note: "กำไรจากร้านกาแฟนำมาเติมซื้อสต็อกสินค้าเข้าร้าน",
  },
  {
    id: "exp-1",
    docNo: "EXP-202606-018",
    type: "EXPENSE",
    category: "Ice & Cold Store",
    categoryTh: "ค่าน้ำแข็งหลอดหน้าร้าน",
    amount: 150.0,
    date: "2026-06-14 11:20",
    destinationOrSource: "DRAWER",
    shiftId: "SHIFT-01-MORNING",
    recordedBy: "สมชาย พ.",
    note: "น้ำแข็งหลอดใหญ่ 3 ถุง สำหรับตู้เครื่องดื่มเย็น",
  },
  {
    id: "inf-2",
    docNo: "INF-202606-002",
    type: "INFLOW",
    category: "Storefront Rental",
    categoryTh: "รายได้ค่าเช่าพื้นที่หน้าร้าน",
    amount: 3500.0,
    date: "2026-06-14 09:30",
    destinationOrSource: "DRAWER",
    recordedBy: "สมชาย พ.",
    note: "ค่าเช่าแผงหมูปิ้งหน้าร้านประจำเดือน",
  },
  {
    id: "exp-2",
    docNo: "EXP-202606-017",
    type: "EXPENSE",
    category: "Store Supplies",
    categoryTh: "ถุงหูหิ้วและกระดาษพิมพ์สลิป",
    amount: 480.0,
    date: "2026-06-13 16:45",
    destinationOrSource: "DRAWER",
    shiftId: "SHIFT-01-AFTERNOON",
    recordedBy: "ณัฐพร ก.",
    note: "กระดาษความร้อน 80mm จำนวน 10 ม้วน",
  },
  {
    id: "exp-3",
    docNo: "EXP-202606-016",
    type: "EXPENSE",
    category: "Utilities",
    categoryTh: "ค่าไฟฟ้าประจำเดือนมิถุนายน (งวด 1)",
    amount: 4500.0,
    date: "2026-06-10 10:00",
    destinationOrSource: "BANK",
    recordedBy: "ระทิบ ม.",
    note: "โอนชำระการไฟฟ้านครหลวง",
  },
];

export interface TenantStore {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  ownerEmail: string;
  branchesCount: number;
  terminalsCount: number;
  dailyTrxAvg: number;
  storageMb: number;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  joinedDate: string;
  ownerPhone?: string;
}

export interface CustomerMember {
  id: string;
  phone: string;
  name: string;
  tier: "BRONZE" | "SILVER" | "GOLD";
  pointsBalance: number;
  joinedDate: string;
}

export const MOCK_CUSTOMERS: CustomerMember[] = [
  {
    id: "cust-1",
    phone: "0891234567",
    name: "คุณกิตติศักดิ์ รัตนวิบูลย์",
    tier: "GOLD",
    pointsBalance: 340,
    joinedDate: "2026-01-15",
  },
  {
    id: "cust-2",
    phone: "0819876543",
    name: "คุณพิมพา สมบูรณ์ทรัพย์",
    tier: "SILVER",
    pointsBalance: 125,
    joinedDate: "2026-03-22",
  },
  {
    id: "cust-3",
    phone: "0955551234",
    name: "คุณธนพล ศรีวิชัย",
    tier: "BRONZE",
    pointsBalance: 45,
    joinedDate: "2026-06-01",
  },
];

export const MOCK_TENANTS: TenantStore[] = [
  {
    id: "tenant-1",
    nameTh: "กิ๊ป มาร์เก็ต (สำนักงานใหญ่ สุขุมวิท 24)",
    nameEn: "Kipp Market Sukhumvit 24",
    slug: "kipp-market",
    ownerEmail: "owner@kippmarket.com",
    ownerPhone: "081-999-8841",
    branchesCount: 2,
    terminalsCount: 4,
    dailyTrxAvg: 186,
    storageMb: 24.8,
    status: "ACTIVE",
    joinedDate: "2026-05-01",
  },
  {
    id: "tenant-2",
    nameTh: "มีสุข มินิมาร์ท ลาดพร้าว 71",
    nameEn: "Meesuk Minimart Ladprao",
    slug: "meesuk-mart",
    ownerEmail: "somporn@meesuk.co.th",
    ownerPhone: "086-555-1234",
    branchesCount: 1,
    terminalsCount: 2,
    dailyTrxAvg: 124,
    storageMb: 14.2,
    status: "ACTIVE",
    joinedDate: "2026-05-18",
  },
  {
    id: "tenant-3",
    nameTh: "โชคดี สด & ชำ นนทบุรี",
    nameEn: "Chokdee Fresh & Grocery",
    slug: "chokdee-grocery",
    ownerEmail: "contact@chokdeegrocery.com",
    ownerPhone: "089-888-7766",
    branchesCount: 1,
    terminalsCount: 1,
    dailyTrxAvg: 68,
    storageMb: 6.4,
    status: "PENDING",
    joinedDate: "2026-06-12",
  },
];

