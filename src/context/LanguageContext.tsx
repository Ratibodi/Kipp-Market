"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "th" | "en";

export interface Translations {
  [key: string]: {
    th: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation & Header
  "nav.operations": { th: "การปฏิบัติงาน", en: "OPERATIONS" },
  "nav.transactionsSales": { th: "รายการขาย & ธุรกรรม", en: "TRANSACTIONS & SALES" },
  "nav.inventoryProducts": { th: "คลังสินค้า & สินค้า", en: "INVENTORY & PRODUCTS" },
  "nav.suppliersPurchasing": { th: "ซัพพลายเออร์ & สั่งซื้อ", en: "SUPPLIERS & PURCHASING" },
  "nav.returnsVoids": { th: "คืนสินค้า & บิลยกเลิก", en: "RETURNS & VOIDS" },
  "nav.reportsAnalytics": { th: "รายงาน & วิเคราะห์", en: "REPORTS & ANALYTICS" },
  "nav.launchPos": { th: "เปิดหน้าจอขาย POS", en: "Launch POS Terminal" },
  "nav.storeManagement": { th: "จัดการร้านค้า", en: "Store Management" },
  "nav.posTerminal": { th: "หน้าจอขาย POS", en: "POS Terminal" },
  "nav.closeShift": { th: "ปิดกะการขาย", en: "Close Shift" },
  "nav.register": { th: "เครื่อง", en: "Register" },
  "nav.shift": { th: "กะ", en: "Shift" },
  "nav.onlineConnected": { th: "ออนไลน์ / เชื่อมต่อแล้ว", en: "Online / Connected" },
  "nav.cashier": { th: "แคชเชียร์", en: "Cashier" },
  "nav.storeManager": { th: "ผู้จัดการร้าน", en: "Store Manager" },
  "nav.logout": { th: "ออกจากระบบ", en: "Log out" },
  "nav.dashboard": { th: "แดชบอร์ด", en: "Dashboard" },
  "nav.transactions": { th: "รายการธุรกรรม", en: "Transactions" },
  "nav.receiptsInvoices": { th: "ใบเสร็จ & ใบกำกับภาษี", en: "Receipts & Invoices" },
  "nav.productCatalog": { th: "แคตตาล็อกสินค้า", en: "Product Catalog" },
  "nav.stockLevels": { th: "สต็อก & การเคลื่อนไหว", en: "Stock Levels & Movements" },
  "nav.stockTaking": { th: "ตรวจนับสต็อก / สุ่มนับ", en: "Stock Taking / Audit" },
  "nav.supplierDirectory": { th: "รายชื่อผู้จัดจำหน่าย", en: "Supplier Directory" },
  "nav.purchaseOrders": { th: "ใบสั่งซื้อ & รับสินค้า", en: "Purchase Orders & Receiving" },
  "nav.returnsRefunds": { th: "คืนสินค้า & คืนเงิน", en: "Returns & Refunds" },
  "nav.voidsExceptions": { th: "บิลยกเลิก & รายการพิเศษ", en: "Voids & Exceptions" },
  "nav.salesReports": { th: "รายงานการขาย & บัญชี", en: "Sales & Financial Reports" },

  // POS Page
  "pos.searchPlaceholder": {
    th: "สแกนบาร์โค้ด หรือ ค้นหาสินค้า... [F2 ค้นหา]",
    en: "Scan barcode or search product... [F2 Search]",
  },
  "pos.usbReady": { th: "USB พร้อมสแกน", en: "USB Ready" },
  "pos.editQty": { th: "แก้ไขจำนวน", en: "Edit Qty" },
  "pos.hold": { th: "พักบิล (2)", en: "Hold (2)" },
  "pos.clearCart": { th: "ล้างตะกร้า", en: "Clear Cart" },
  "pos.fastPick": { th: "ขายด่วน:", en: "FAST PICK:" },
  "pos.hotItems": { th: "สินค้ายอดนิยม", en: "Hot Items" },
  "pos.bakeryFresh": { th: "เบเกอรี่ & ของสด", en: "Bakery & Fresh" },
  "pos.beverages": { th: "เครื่องดื่ม", en: "Beverages" },
  "pos.snacks": { th: "ขนมขบเคี้ยว", en: "Snacks" },
  "pos.readyMeal": { th: "อาหารพร้อมทาน", en: "Ready Meal" },
  "pos.walkInMember": { th: "สมาชิกลูกค้าทั่วไป", en: "Walk-in Member" },
  "pos.tier1Earn": { th: "+ รับแต้ม Tier 1", en: "+ Tier 1 Earn" },
  "pos.itemDescription": { th: "ชื่อสินค้า / บาร์โค้ด", en: "ITEM DESCRIPTION / BARCODE" },
  "pos.unitPrice": { th: "ราคาต่อหน่วย", en: "UNIT PRICE" },
  "pos.qty": { th: "จำนวน", en: "QTY" },
  "pos.lineTotal": { th: "ยอดรวม", en: "LINE TOTAL" },
  "pos.inStock": { th: "คงเหลือ", en: "In Stock" },
  "pos.changeQty": { th: "เปลี่ยนจำนวน", en: "Change Qty" },
  "pos.voidLine": { th: "ยกเลิกแถวนี้", en: "Void Line" },
  "pos.holdCart": { th: "พักบิลไว้ก่อน", en: "Hold Cart" },
  "pos.promoCoupon": { th: "คูปองส่วนลด", en: "Promo Coupon" },
  "pos.voidTrans": { th: "ยกเลิกทั้งบิล", en: "Clear / Void Trans." },
  "pos.totalAmountDue": { th: "ยอดรวมที่ต้องชำระ", en: "TOTAL AMOUNT DUE" },
  "pos.currencyThb": { th: "THB / บาทไทย", en: "THB / Thai Baht" },
  "pos.subtotalExclVat": { th: "ยอดก่อนภาษี (Excl. VAT):", en: "Subtotal (excl. VAT):" },
  "pos.vat7": { th: "ภาษีมูลค่าเพิ่ม VAT 7%:", en: "VAT 7% (Tax included):" },
  "pos.memberDiscount": { th: "ส่วนลดสมาชิก:", en: "Member Discount:" },
  "pos.grandTotalNet": { th: "ยอดรวมสุทธิ (Net):", en: "Grand Total (Net):" },
  "pos.cashTendered": { th: "รับเงินสด", en: "CASH TENDERED" },
  "pos.quickCashKey": { th: "ปุ่มลัดเงินสด", en: "Quick Cash Key" },
  "pos.received": { th: "รับเงิน:", en: "Received:" },
  "pos.changeDue": { th: "เงินทอน", en: "CHANGE DUE" },
  "pos.returnToCustomer": { th: "คืนเงินให้ลูกค้า", en: "Return to customer" },
  "pos.cashTenderBtn": { th: "ชำระด้วยเงินสด", en: "Cash Tender" },
  "pos.promptpayQrBtn": { th: "สแกนจ่าย พร้อมเพย์", en: "Thai PromptPay QR" },
  "pos.creditCardBtn": { th: "บัตรเครดิต", en: "Credit Card" },
  "pos.trueMoneyBtn": { th: "ทรูมันนี่", en: "TrueMoney" },
  "pos.cartEmpty": { th: "ตะกร้าสินค้าว่างเปล่า", en: "Cart is empty" },
  "pos.cartEmptyDesc": {
    th: "ยิงบาร์โค้ดสินค้า หรือ เลือกจากหมวดหมู่ขายด่วน FAST PICK",
    en: "Scan a product barcode or pick items from FAST PICK",
  },
  "pos.restoreMock": { th: "คืนค่าข้อมูลตัวอย่าง", en: "Restore Mock Cart" },

  // Footer Status Bar
  "footer.cloudSync": { th: "Kipp Cloud ซิงก์:", en: "Kipp Cloud Sync:" },
  "footer.live": { th: "เชื่อมต่อปกติ", en: "Live" },
  "footer.printer": { th: "Epson TM-T88VI (ความร้อน พร้อมใช้งาน)", en: "Epson TM-T88VI (Thermal Ready)" },
  "footer.drawer": { th: "ลิ้นชัก: ปิดอยู่", en: "Drawer: Closed" },
  "footer.lastSale": { th: "บิลล่าสุด:", en: "Last Sale:" },
  "footer.taxReady": { th: "พร้อมออกใบกำกับภาษี 100%", en: "100% Tax Invoice Ready" },
  "footer.search": { th: "ค้นหาสินค้า", en: "Search Items" },
  "footer.editQtyKey": { th: "แก้ไขจำนวน", en: "Edit Qty" },
  "footer.holdCartKey": { th: "พักบิล", en: "Hold Cart" },
  "footer.couponKey": { th: "คูปอง", en: "Promo Coupon" },
  "footer.clearCartKey": { th: "ล้างบิล", en: "Clear Cart" },
  "footer.cashKey": { th: "เงินสด", en: "Cash" },
  "footer.qrKey": { th: "พร้อมเพย์", en: "QR" },
  "footer.cardKey": { th: "บัตรเครดิต", en: "Card" },
  "footer.trueMoneyKey": { th: "ทรูมันนี่", en: "TrueMoney" },
  "footer.voidLineKey": { th: "ยกเลิกแถว", en: "Void Line" },

  // PromptPay Modal
  "pp.breadcrumbCart": { th: "ตะกร้า", en: "Cart" },
  "pp.breadcrumbTender": { th: "ช่องทางชำระเงิน", en: "Payment Tender" },
  "pp.breadcrumbTitle": { th: "สแกนจ่าย Thai PromptPay QR", en: "Thai PromptPay QR" },
  "pp.itmxLive": { th: "เกตเวย์ ITMX Switch: ปกติ (38ms)", en: "ITMX PromptPay Switch: Live (38ms)" },
  "pp.step1": { th: "ยืนยันยอดเงินแล้ว", en: "Amount Confirmed" },
  "pp.step1Sub": { th: "฿196.00 ล็อคยอดแล้ว", en: "฿196.00 Locked" },
  "pp.step2": { th: "ลูกค้ารอสแกน QR", en: "Customer Scanning QR" },
  "pp.step2Sub": { th: "EMVCo ไดนามิกถูกต้อง", en: "Dynamic EMVCo Valid" },
  "pp.step3": { th: "ยืนยันยอดเงินจากธนาคาร", en: "Bank Settlement" },
  "pp.step3Sub": { th: "รอการแจ้งเตือนยอดเงิน", en: "Awaiting Push Auth" },
  "pp.bannerTitle": { th: "ชำระเงินผ่านระบบ Thai QR Payment", en: "Thai QR Payment" },
  "pp.bannerSub": { th: "ระบบการชำระเงินอิเล็กทรอนิกส์แห่งชาติ", en: "NATIONAL ELECTRONIC PAYMENT SERVICE" },
  "pp.duplicateShield": {
    th: "ระบบป้องกันการจ่ายซ้ำทำงาน: ล็อคเซสชันกับโหนดตรวจสลิป ลูกค้าจะชำระได้ตรงยอดเท่านั้น",
    en: "Duplicate Payment Shield Active: Session locked to Slip Verification Node. Customer app will resolve exact amount only.",
  },
  "pp.tenderAmountLocked": { th: "ล็อคยอดชำระเงินเรียบร้อย", en: "TENDER AMOUNT LOCKED" },
  "pp.sessionTimeout": { th: "เวลาหมดอายุเซสชัน:", en: "Session Timeout:" },
  "pp.refreshCycle": { th: "รอบรีเฟรชไดนามิก: ทุก 180 วินาที", en: "Dynamic refresh interval: 180s cycle" },
  "pp.awaitingSettlement": { th: "กำลังรอการยืนยันจากธนาคาร", en: "Awaiting Bank Settlement" },
  "pp.checkingBanks": {
    th: "กำลังสแกนผ่าน ITMX Hub ตรวจสอบ Bualuang, SCB Easy, K PLUS และ Krungthai NEXT",
    en: "Scanning active via ITMX API hub. Checking Bualuang, SCB Easy, K PLUS, & Krungthai NEXT.",
  },
  "pp.reCheck": { th: "[F5] ตรวจสอบสถานะอีกครั้ง", en: "[F5] Re-Check Status" },
  "pp.reGen": { th: "[F3] สร้าง QR ใหม่", en: "[F3] Re-Generate QR" },
  "pp.returnCart": { th: "[Esc] กลับสู่ตะกร้า (เก็บรายการไว้)", en: "[Esc] Return to Cart (Preserved)" },
  "pp.simulation": { th: "โหมดจำลองสถานะแคชเชียร์:", en: "CASHIER SIMULATION SANDBOX:" },
  "pp.waiting": { th: "รอสแกน", en: "Waiting" },
  "pp.success": { th: "สำเร็จ", en: "Success" },
  "pp.expired": { th: "หมดอายุ", en: "Expired" },
  "pp.bankError": { th: "ระบบขัดข้อง", en: "Bank Error" },
  "pp.tenderAudit": { th: "ตรวจสอบรายการบิล", en: "Tender Audit" },
  "pp.pendingScan": { th: "รอลูกค้าสแกน", en: "PENDING SCAN" },
  "pp.taxableAmount": { th: "ยอดคิดภาษี (Vat Excl.)", en: "Taxable Amount (Vat Excl.)" },
  "pp.vatAmount": { th: "ภาษีมูลค่าเพิ่ม (7.0%)", en: "Value Added Tax (7.0%)" },
  "pp.totalTenderLock": { th: "ยอดรวมล็อคบิล", en: "Total Tender Lock" },
  "pp.settlementSlip": { th: "สลิปยืนยันการชำระเงิน", en: "Settlement Slip" },
  "pp.awaitingVerification": { th: "รอการตรวจสอบการชำระเงิน", en: "Awaiting payment verification" },
  "pp.authSlipMetrics": { th: "ข้อมูลการอนุมัติสลิป", en: "AUTH SLIP METRICS" },
  "pp.standby": { th: "สแตนด์บาย", en: "STANDBY" },
  "pp.paymentMethod": { th: "วิธีชำระเงิน:", en: "Payment Method:" },
  "pp.clearingGateway": { th: "เกตเวย์เคลียร์ริ่ง:", en: "Clearing Gateway:" },
  "pp.bankTransId": { th: "รหัสธุรกรรมธนาคาร:", en: "Bank Trans ID:" },
  "pp.senderAccount": { th: "บัญชีผู้โอน:", en: "Sender Account:" },
  "pp.timestamp": { th: "เวลาทำรายการ:", en: "Timestamp:" },
  "pp.pendingScanText": { th: "รอลูกค้าสแกน", en: "Pending scan" },
  "pp.autoPrintSlip": { th: "พิมพ์สลิปใบเสร็จความร้อนอัตโนมัติ", en: "Auto-Print Thermal Receipt" },
  "pp.smsReceipt": { th: "ส่ง SMS ใบเสร็จอิเล็กทรอนิกส์ (+66 89-412-XXXX)", en: "SMS E-Receipt (+66 89-412-XXXX)" },
  "pp.waitingConfirmationBtn": { th: "รอการยืนยันยอดพร้อมเพย์...", en: "Waiting for PromptPay Confirmation" },
  "pp.paymentVerifiedBtn": { th: "✓ ยืนยันชำระเงินแล้ว • ปิดบิล [Enter]", en: "✓ Payment Verified & Finalize [Enter]" },
  "pp.managerFallback": { th: "ทางเลือกกรณีพิเศษสำหรับผู้จัดการ", en: "Manager Fallback" },
  "pp.supervisorKey": { th: "คีย์หัวหน้างาน [F1]", en: "Supervisor Key [F1]" },
  "pp.manualAudit": { th: "ตรวจสอบสลิปด้วยตนเอง", en: "Manual Slip Audit" },

  // Cash Tender Modal
  "cash.title": { th: "ชำระเงิน & ปิดการขาย", en: "Payment & Checkout" },
  "cash.amountDue": { th: "ยอดชำระ (4 รายการ, 6 ชิ้น)", en: "AMOUNT DUE (4 ITEMS, 6 UNITS)" },
  "cash.fastKeysTitle": { th: "ปุ่มลัดมูลค่าธนบัตรไทยด่วน", en: "QUICK THAI BAHT DENOMINATION FAST-KEYS" },
  "cash.autoTenderReady": { th: "ปุ่มลัดรับเงินสดพร้อมทำงาน", en: "Auto-Tender Shortcut Ready" },
  "cash.exactCash": { th: "พอดีบิล", en: "Exact Cash" },
  "cash.twoRed": { th: "ธนบัตร 100 บาท 2 ใบ", en: "2x ฿100 Red Note" },
  "cash.purpleNote": { th: "ธนบัตร 500 บาท", en: "฿500 Purple Note" },
  "cash.brownNote": { th: "ธนบัตร 1,000 บาท", en: "฿1,000 Brown Note" },
  "cash.receivedTendered": { th: "ยอดเงินสดที่รับมา", en: "CASH RECEIVED (TENDERED)" },
  "cash.tabEdit": { th: "[TAB] แก้ไข", en: "[TAB] EDIT" },
  "cash.enterAmountHelp": { th: "กรอกจำนวนเงินบาท หรือ คลิกเลือกจากปุ่มลัดด้านบน", en: "Enter amount in Baht or use keypad shortcuts." },
  "cash.changeDue": { th: "เงินทอน", en: "CHANGE DUE" },
  "cash.balancedReturn": { th: "คำนวณเงินทอนลงตัว", en: "Balanced Return" },
  "cash.drawerAutoPop": { th: "เปิดลิ้นชักเงินสดอัตโนมัติ", en: "Cash Drawer Auto-Pop" },
  "cash.optimalNotes": { th: "คำแนะนำการทอนธนบัตร & เหรียญ:", en: "Optimal Drawer Notes:" },
  "cash.printThermalPaper": { th: "พิมพ์ใบเสร็จกระดาษความร้อน (มาตรฐาน)", en: "Print thermal paper slip (Standard)" },
  "cash.sendSms": { th: "ส่ง E-Receipt ทาง SMS (+66 89-412-XXXX)", en: "Send E-Receipt SMS (+66 89-412-XXXX)" },
  "cash.printerReady": { th: "เครื่องพิมพ์: พร้อมใช้งาน (Epson TM-T88VI)", en: "Printer: Ready (Epson TM-T88VI)" },
  "cash.backToCart": { th: "กลับสู่ตะกร้า", en: "Back to Cart" },
  "cash.completeSale": { th: "ยืนยันปิดการขาย & เปิดลิ้นชักเงินสด", en: "Complete Sale & Open Cash Drawer" },
  "cash.quickPickDrawer": { th: "ลิ้นชักสินค้าด่วน (PLU)", en: "Quick-Pick Drawer" },
  "cash.nonBarcodeSync": { th: "ซิงก์สินค้าไร้บาร์โค้ด: ออนไลน์", en: "Non-Barcode Sync: Online" },
  "cash.holdShift": { th: "กด SHIFT เพื่อเพิ่มทีละหลายชิ้น", en: "Hold SHIFT to Batch" },

  // Dashboard Page
  "dash.title": { th: "แดชบอร์ดผู้จัดการร้าน", en: "Manager Dashboard" },
  "dash.executiveOverview": { th: "ภาพรวมผู้บริหาร", en: "Executive Overview" },
  "dash.shiftActive": { th: "กะ B กำลังทำงาน (หัวหน้ากะ: ดนัย เค.)", en: "Shift B Active (Supervisor: Danai K.)" },
  "dash.subtitle": {
    th: "ข้อมูลผลประกอบการร้านแบบเรียลไทม์ สถานะการขายทุกเลน และการสั่งเติมสต็อกสินค้า",
    en: "Real-time store performance, lane telemetry, and SKU replenishment status.",
  },
  "dash.todayVsYesterday": { th: "วันนี้ (เทียบเมื่อวาน)", en: "Today (vs Yesterday)" },
  "dash.exportReport": { th: "ส่งออกรายงาน", en: "Export Report" },
  "dash.grossSales": { th: "ยอดขายรวม (GROSS SALES)", en: "GROSS SALES" },
  "dash.vsYesterday": { th: "เทียบกับเมื่อวาน", en: "vs yesterday" },
  "dash.netSales": { th: "ยอดขายสุทธิ: ฿23,224.30 (ไม่รวม VAT 7% & ส่วนลด)", en: "Net Sales: ฿23,224.30 (excl. 7% VAT & discounts)" },
  "dash.salesBreakdown": { th: "ดูรายละเอียดการขาย", en: "Sales Breakdown" },
  "dash.grossProfit": { th: "กำไรขั้นต้น (GROSS PROFIT)", en: "GROSS PROFIT" },
  "dash.margin": { th: "อัตรากำไร", en: "Margin" },
  "dash.targetExceeded": { th: "เกินเป้าหมาย 26.0%", en: "Target 26.0% exceeded" },
  "dash.cogs": { th: "ต้นทุนขาย COGS: ฿16,804.30 (Cost of Goods Sold)", en: "COGS: ฿16,804.30 (Cost of Goods Sold)" },
  "dash.marginAnalysis": { th: "วิเคราะห์อัตรากำไร", en: "Margin Analysis" },
  "dash.totalTransactions": { th: "จำนวนบิลขาย (TRANSACTIONS)", en: "TOTAL TRANSACTIONS" },
  "dash.salesLogged": { th: "บิลที่บันทึกแล้ว", en: "sales logged" },
  "dash.avgBasket": { th: "เฉลี่ยต่อตะกร้า:", en: "Avg Basket:" },
  "dash.peakHour": { th: "ช่วงพีก: 12:00–13:30 (48 บิล)", en: "Peak: 12:00–13:30 (48 sales)" },
  "dash.viewAllTransactions": { th: "ดูทั้ง 186 รายการ", en: "View All 186 Transactions" },
  "dash.inventoryAttention": { th: "สินค้าต้องดูแลสต็อก (INVENTORY)", en: "INVENTORY ATTENTION" },
  "dash.needsReorder": { th: "ต้องสั่งเพิ่ม", en: "Needs Reorder" },
  "dash.criticalOutOfStock": { th: "สินค้าหมด 3 รายการ", en: "3 critical out of stock" },
  "dash.lowStock": { th: "สินค้าใกล้หมด 5 รายการ", en: "5 low stock" },
  "dash.reviewStock": { th: "ตรวจสต็อก & ออกใบสั่งซื้อ PO", en: "Review Stock & POs" },
  "dash.hourlyTrend": { th: "แนวโน้มยอดขายรายชั่วโมง", en: "Hourly Sales Trend" },
  "dash.hourlySubtitle": {
    th: "เปรียบเทียบยอดขายรวมทุกเครื่องแคชเชียร์ (06:00 – 22:00)",
    en: "Gross volume comparison across active trading registers (06:00 – 22:00)",
  },
  "dash.todayLegend": { th: "วันนี้ (฿24.8k)", en: "Today (฿24.8k)" },
  "dash.yesterdayLegend": { th: "เมื่อวาน (฿21.7k)", en: "Yesterday (฿21.7k)" },
  "dash.peakVelocity": { th: "ยอดขายสูงสุดต่อนาที:", en: "Peak Sales Velocity:" },
  "dash.transPerHour": { th: "จำนวนบิลเฉลี่ยต่อชั่วโมง:", en: "Transactions / Hour:" },
  "dash.basketVelocity": { th: "ความเร็วสินค้าต่อตะกร้า:", en: "Basket Velocity:" },
  "dash.lunch": { th: "(มื้อเที่ยง)", en: "(Lunch)" },
  "dash.paymentBreakdown": { th: "สัดส่วนช่องทางชำระเงิน", en: "Payment Breakdown" },
  "dash.tenderMethodDist": { th: "การกระจายตัวของวิธีรับเงิน", en: "Tender method distribution" },
  "dash.reconciled": { th: "กระทบยอดครบ 100%", en: "100% Reconciled" },
  "dash.topCategories": { th: "หมวดหมู่สินค้าขายดี", en: "Top Categories" },
  "dash.byGrossRev": { th: "เรียงตามยอดขายรวม", en: "by gross rev." },
  "dash.stockWarnings": { th: "แจ้งเตือนสินค้าใกล้หมดสต็อก", en: "Stock Reorder Warnings" },
  "dash.autoPoAlerts": { th: "ระบบแจ้งเตือนจุดสั่งซื้ออัตโนมัติ", en: "Automated PO threshold alerts" },
  "dash.reorderAll": { th: "สั่งซื้อทั้งหมด (4)", en: "Reorder All (4)" },
  "dash.recentTransactions": { th: "รายการขายล่าสุด", en: "Recent Transactions" },
  "dash.liveFromLanes": { th: "ข้อมูลสดจากเลน 01 & 02", en: "Live sync from Lanes 01 & 02" },
  "dash.liveFeed": { th: "ข้อมูลสด", en: "LIVE FEED" },
  "dash.auditingJournal": { th: "สมุดบันทึกการตรวจสอบ", en: "Auditing Journal" },

  // Transactions Page
  "trx.title": { th: "รายการธุรกรรม", en: "Transactions" },
  "trx.liveAuditFeed": { th: "บันทึกการตรวจสอบสด", en: "LIVE AUDIT FEED" },
  "trx.subtitle": {
    th: "บันทึก Audit log แบบเรียลไทม์, ใบเสร็จรับเงิน, ภาษีมูลค่าเพิ่ม และวงจรชีวิตบิลขาย",
    en: "Real-time audit log, sales receipts, VAT accounting, and transaction lifecycle",
  },
  "trx.exportCsv": { th: "ส่งออก CSV / Excel", en: "Export CSV / Excel" },
  "trx.printSummary": { th: "พิมพ์รายงานสรุป", en: "Print Summary Report" },
  "trx.refreshFeed": { th: "รีเฟรชข้อมูล", en: "Refresh Feed" },
  "trx.showingDetails": { th: "กำลังแสดงรายละเอียดของ", en: "Showing" },
  "trx.details": { th: "รายละเอียด", en: "Details" },
  "trx.clearFilters": { th: "ล้างตัวกรอง", en: "Clear Filters" },
  "trx.eTaxTitle": {
    th: "ระบบเคลียร์ภาษีอิเล็กทรอนิกส์ประจำวัน (RD-Thailand e-Tax Ready)",
    en: "Daily Electronic Tax Clearance (RD-Thailand e-Tax Ready)",
  },
  "trx.eTaxDesc": {
    th: "ย่อยบันทึกการขายทั้ง 186 รายการและลงลายมือชื่อดิจิทัลด้วย Kipp Market Store #01 RSA-2048 HSM keystore ซิงก์รอบอัตโนมัติกับกรมสรรพากรเวลา 23:59:00 น.",
    en: "All 186 transaction digests are signed using Kipp Market Store #01 RSA-2048 HSM keystore. Automatic clearing with Revenue Department batch sync is scheduled for 23:59:00 ICT.",
  },
  "trx.verified": { th: "ตรวจสอบแล้ว", en: "Verified" },
  "trx.confirmedSettled": { th: "ยืนยัน & เคลียร์ยอดแล้ว", en: "CONFIRMED & SETTLED" },
  "trx.printDuplicate": { th: "พิมพ์ใบเสร็จซ้ำ", en: "Print Duplicate" },
  "trx.taxSlipPdf": { th: "ดาวน์โหลด PDF ภาษี", en: "Tax Slip PDF" },
  "trx.voidReturn": { th: "ยกเลิก / คืนเงิน", en: "Void/Return" },
  "trx.itemizedLedger": { th: "รายการสินค้าในบิล", en: "ITEMIZED LINE LEDGER" },
  "trx.paymentSettlement": { th: "ข้อมูลการชำระเงิน", en: "PAYMENT SETTLEMENT" },
  "trx.instantClearance": { th: "เคลียร์ยอดทันที", en: "Instant Clearance" },
  "trx.slipPreview": { th: "ตัวอย่างสลิปใบเสร็จความร้อน 80 มม.", en: "80MM THERMAL SLIP PREVIEW" },
  "trx.escPosEmulator": { th: "จำลองการพิมพ์ ESC/POS", en: "ESC/POS EMULATOR" },
  "trx.auditLog": { th: "บันทึกประวัติการทำรายการ (AUDIT LOG)", en: "TRANSACTION AUDIT LOG" },

  // Quick Pick
  "quickpick.allItems": { th: "สินค้าทั้งหมด", en: "All Items" },
  "quickpick.bakery": { th: "เบเกอรี่", en: "Bakery" },
  "quickpick.dimSum": { th: "ติ่มซำ", en: "Dim Sum" },
  "quickpick.freshFruit": { th: "ผลไม้สด", en: "Fresh Fruit" },
  "quickpick.beverages": { th: "เครื่องดื่ม", en: "Beverages" },
  "quickpick.add": { th: "+ เพิ่ม +1", en: "+ Add +1" },

  // Transactions Page KPIs & Table
  "trx.todaysTransactions": { th: "จำนวนบิลวันนี้", en: "TODAY'S TRANSACTIONS" },
  "trx.totalSalesVolume": { th: "ยอดขายรวมทั้งหมด", en: "TOTAL SALES VOLUME" },
  "trx.promptpayQrShare": { th: "สัดส่วนพร้อมเพย์ QR", en: "PROMPTPAY QR SHARE" },
  "trx.refundsVoids": { th: "คืนเงิน & ยกเลิกบิล", en: "REFUNDS & VOIDS" },
  "trx.searchPlaceholder": { th: "ค้นหารหัสบิล, แคชเชียร์, บาร์โค้ด...", en: "Search TRX ID, cashier, barcode..." },
  "trx.filterPayment": { th: "ช่องทางชำระเงิน", en: "Payment Method" },
  "trx.filterLane": { th: "ช่องชำระเงิน (เลน)", en: "Register Lane" },
  "trx.filterStatus": { th: "สถานะ", en: "Status" },
  "trx.colTrxId": { th: "รหัสธุรกรรม", en: "TRANSACTION ID" },
  "trx.colTime": { th: "เวลา", en: "TIME" },
  "trx.colLaneCashier": { th: "เลน / แคชเชียร์", en: "LANE / CASHIER" },
  "trx.colItems": { th: "จำนวนสินค้า", en: "ITEMS" },
  "trx.colPaymentMethod": { th: "วิธีชำระ", en: "PAYMENT METHOD" },
  "trx.colTotalThb": { th: "ยอดสุทธิ (บาท)", en: "TOTAL (THB)" },
  "trx.colStatus": { th: "สถานะ", en: "STATUS" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "th",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Thai is strictly the default
  const [language, setLanguageState] = useState<Language>("th");

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kipp_language") as Language | null;
      if (saved === "th" || saved === "en") {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("kipp_language", lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "th" ? "en" : "th");
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item.th || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
