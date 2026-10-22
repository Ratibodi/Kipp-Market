"use client";

import { useState, useRef } from "react";
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  FileSpreadsheet,
  Download,
  Upload,
  Edit,
  Trash2,
  Sparkles,
  Scale,
  CheckCircle,
  AlertTriangle,
  X,
  ExternalLink,
  Layers,
  Barcode,
  RefreshCw,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_CATALOG_PRODUCTS, CatalogProduct } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { transliterateThaiBarcode } from "@/lib/scannerListener";

export default function ProductsPage() {
  const { t, language } = useLanguage();
  const isTh = language === "th";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const [products, setProducts] = useState<CatalogProduct[]>(MOCK_CATALOG_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Dairy",
    "Ready Meal",
    "Beverages",
    "Snacks",
    "Meat & Fresh",
    "Bakery",
  ]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const getCategoryLabel = (cat: string) => {
    if (cat === "ALL") return isTh ? "ทุกหมวดหมู่" : "All Categories";
    if (cat === "Dairy") return isTh ? "นมและเนย (Dairy)" : "Dairy";
    if (cat === "Ready Meal") return isTh ? "อาหารพร้อมทาน (Ready Meal)" : "Ready Meal";
    if (cat === "Beverages") return isTh ? "เครื่องดื่ม (Beverages)" : "Beverages";
    if (cat === "Snacks") return isTh ? "ขนมขบเคี้ยว (Snacks)" : "Snacks";
    if (cat === "Meat & Fresh") return isTh ? "ของสด & ผักผลไม้ (Fresh)" : "Meat & Fresh";
    if (cat === "Bakery") return isTh ? "เบเกอรี่ (Bakery)" : "Bakery";
    return cat;
  };

  const parseCSVLine = (text: string) => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ""));
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ""));
    return result;
  };

  const handleProcessCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const lines = content.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert(isTh ? "ไฟล์ไม่มีข้อมูลสินค้า" : "File has no product data");
        return;
      }

      const rawHeaders = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s\(\)_-]/g, ""));
      const findCol = (keywords: string[]) => {
        return rawHeaders.findIndex((h) => keywords.some((k) => h.includes(k.toLowerCase())));
      };

      const barcodeCol = findCol(["barcode", "บาร์โค้ด", "บาร์"]);
      const nameThCol = findCol(["nameth", "ชื่อสินค้าไทย", "ชื่อสินค้า", "ชื่อ"]);
      const nameEnCol = findCol(["nameen", "ชื่อสินค้าอังกฤษ", "name"]);
      const catCol = findCol(["category", "หมวดหมู่", "หมวด"]);
      const saleTypeCol = findCol(["saletype", "ประเภทการขาย", "ประเภท", "type"]);
      const unitCol = findCol(["unit", "หน่วย", "หน่วยนับ"]);
      const priceCol = findCol(["price", "ราคาขาย", "ราคา"]);
      const costCol = findCol(["cost", "avgcost", "ต้นทุน", "ราคาต้นทุน"]);
      const stockCol = findCol(["stock", "stockqty", "คงเหลือ", "จำนวนคงเหลือ", "สต็อก"]);

      const newProducts: CatalogProduct[] = [];
      const newCats: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length === 0 || !cols.some((c) => c.length > 0)) continue;

        const barcode = (barcodeCol !== -1 ? cols[barcodeCol] : cols[0]) || `8850${Math.floor(100000000 + Math.random() * 900000000)}`;
        const nameTh = (nameThCol !== -1 ? cols[nameThCol] : cols[1]) || `สินค้า ${i}`;
        const nameEn = (nameEnCol !== -1 ? cols[nameEnCol] : nameTh) || nameTh;
        const cat = (catCol !== -1 ? cols[catCol] : "General") || "General";
        const saleTypeRaw = (saleTypeCol !== -1 ? cols[saleTypeCol] : "").toLowerCase();
        const saleType: "UNIT" | "WEIGHT" = saleTypeRaw.includes("weight") || saleTypeRaw.includes("ชั่ง") ? "WEIGHT" : "UNIT";
        const unit = (unitCol !== -1 ? cols[unitCol] : "ชิ้น") || "ชิ้น";
        const price = parseFloat(priceCol !== -1 ? cols[priceCol] : "0") || 0;
        const avgCost = parseFloat(costCol !== -1 ? cols[costCol] : "0") || 0;
        const stockQty = parseFloat(stockCol !== -1 ? cols[stockCol] : "0") || 0;

        if (cat && !categoriesList.includes(cat) && !newCats.includes(cat)) {
          newCats.push(cat);
        }

        newProducts.push({
          id: `prod-${Date.now()}-${i}`,
          sku: `SKU-${barcode || Math.floor(100000 + Math.random() * 900000)}`,
          barcode,
          nameTh,
          nameEn,
          category: cat,
          saleType,
          unit,
          price,
          avgCost,
          stockQty,
          isQuickKey: false,
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&h=160&q=80",
          status: stockQty <= 0 ? "OUT_OF_STOCK" : stockQty <= 10 ? "LOW_STOCK" : "ACTIVE",
        });
      }

      if (newProducts.length > 0) {
        if (newCats.length > 0) {
          setCategoriesList((prev) => [...prev, ...newCats]);
        }
        setProducts((prev) => [...newProducts, ...prev]);
        setImportNotification(
          isTh
            ? `นำเข้าสินค้าสำเร็จ ${newProducts.length} รายการ (พบหมวดหมู่ใหม่ ${newCats.length} หมวด)`
            : `Successfully imported ${newProducts.length} products (${newCats.length} new categories)`
        );
        setTimeout(() => setImportNotification(null), 5000);
      }
      setIsCsvModalOpen(false);
    };
    reader.readAsText(file, "UTF-8");
  };

  const allCategories = Array.from(
    new Set(["ALL", ...categoriesList, ...products.map((p) => p.category)])
  );

  // Form State
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formBarcode, setFormBarcode] = useState("");
  const [formPlu, setFormPlu] = useState("");
  const [formCategory, setFormCategory] = useState<string>("Beverages");
  const [formSaleType, setFormSaleType] = useState<"UNIT" | "WEIGHT">("UNIT");
  const [formUnit, setFormUnit] = useState("ชิ้น");
  const [formPrice, setFormPrice] = useState("25.00");
  const [formCost, setFormCost] = useState("18.00");
  const [formStock, setFormStock] = useState("20");
  const [formIsQuickKey, setFormIsQuickKey] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState(
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&h=160&q=80"
  );

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.barcode.includes(searchQuery) ||
      (prod.plu && prod.plu.includes(searchQuery)) ||
      prod.sku.includes(searchQuery);

    const matchesCategory =
      selectedCategory === "ALL" || prod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = (prod?: CatalogProduct) => {
    setIsAddingNewCategory(false);
    setNewCategoryName("");
    if (prod) {
      setEditingProduct(prod);
      setFormNameTh(prod.nameTh);
      setFormNameEn(prod.nameEn);
      setFormBarcode(prod.barcode);
      setFormPlu(prod.plu || "");
      setFormCategory(prod.category);
      setFormSaleType(prod.saleType);
      setFormUnit(prod.unit);
      setFormPrice(prod.price.toString());
      setFormCost(prod.avgCost.toString());
      setFormStock(prod.stockQty.toString());
      setFormIsQuickKey(prod.isQuickKey);
      setFormImageUrl(prod.imageUrl);
      if (!categoriesList.includes(prod.category)) {
        setCategoriesList((prev) => [...prev, prod.category]);
      }
    } else {
      setEditingProduct(null);
      setFormNameTh("");
      setFormNameEn("");
      setFormBarcode(`8850${Math.floor(100000000 + Math.random() * 900000000)}`);
      setFormPlu("");
      setFormCategory("Beverages");
      setFormSaleType("UNIT");
      setFormUnit(isTh ? "ชิ้น" : "pcs");
      setFormPrice("35.00");
      setFormCost("22.00");
      setFormStock("24");
      setFormIsQuickKey(true);
      setFormImageUrl(
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&h=160&q=80"
      );
    }
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      isAddingNewCategory && newCategoryName.trim()
        ? newCategoryName.trim()
        : formCategory;

    if (isAddingNewCategory && newCategoryName.trim()) {
      if (!categoriesList.includes(newCategoryName.trim())) {
        setCategoriesList((prev) => [...prev, newCategoryName.trim()]);
      }
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                nameTh: formNameTh,
                nameEn: formNameEn,
                barcode: formBarcode,
                plu: formPlu || undefined,
                category: finalCategory,
                saleType: formSaleType,
                unit: formUnit,
                price: parseFloat(formPrice) || 0,
                avgCost: parseFloat(formCost) || 0,
                stockQty: parseFloat(formStock) || 0,
                isQuickKey: formIsQuickKey,
                imageUrl: formImageUrl,
              }
            : item
        )
      );
    } else {
      const newProduct: CatalogProduct = {
        id: `prod-${Date.now()}`,
        sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        barcode: formBarcode,
        plu: formPlu || undefined,
        nameTh: formNameTh,
        nameEn: formNameEn || formNameTh,
        category: finalCategory,
        saleType: formSaleType,
        unit: formUnit,
        price: parseFloat(formPrice) || 0,
        avgCost: parseFloat(formCost) || 0,
        stockQty: parseFloat(formStock) || 0,
        isQuickKey: formIsQuickKey,
        imageUrl: formImageUrl,
        status: "ACTIVE",
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setIsAddModalOpen(false);
  };

  const handleToggleQuickKey = (id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isQuickKey: !item.isQuickKey } : item
      )
    );
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm(isTh ? "คุณต้องการลบสินค้านี้ใช่หรือไม่?" : "Delete this product?")) {
      setProducts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Package className="h-6 w-6 text-emerald-600" />
                <span>{isTh ? "จัดการรายการสินค้า & คลัง" : "Product Catalog & Inventory"}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isTh
                  ? "จัดการแคตตาล็อกสินค้า, กำหนดราคาขาย, ตั้งค่าปุ่มขายด่วน และสินค้าชั่งน้ำหนัก"
                  : "Manage catalog products, pricing, fast-pick quick keys, and scale weight items"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Import / Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{isTh ? "+ เพิ่มสินค้าใหม่" : "+ Add New Product"}</span>
              </button>
            </div>
          </div>

          {/* Import Notification Banner */}
          {importNotification && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold">{importNotification}</span>
              </div>
              <button
                type="button"
                onClick={() => setImportNotification(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">
                {isTh ? "รายการสินค้าทั้งหมด" : "Total Catalog SKUs"}
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {products.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">
                {isTh ? "สินค้าขายด่วน (Quick Keys)" : "Active Fast-Pick Keys"}
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {products.filter((p) => p.isQuickKey).length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">
                {isTh ? "สินค้าชั่งน้ำหนัก (ตาชั่ง)" : "Scale / Weight Items"}
              </div>
              <div className="text-2xl font-black font-mono text-lime-700 mt-1">
                {products.filter((p) => p.saleType === "WEIGHT").length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">
                {isTh ? "สินค้าใกล้หมดสต็อก" : "Low Stock Warnings"}
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 mt-1">
                {products.filter((p) => p.stockQty <= 10).length}
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isTh
                    ? "ค้นหาด้วยชื่อสินค้า, บาร์โค้ด, PLU หรือ SKU..."
                    : "Search by product name, barcode, PLU, or SKU..."
                }
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition whitespace-nowrap cursor-pointer flex items-center gap-1"
                title={isTh ? "เพิ่มสินค้าหรือหมวดหมู่ใหม่" : "Add Product or Category"}
              >
                <span>+ {isTh ? "หมวดใหม่" : "New Cat"}</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{isTh ? "สินค้า" : "Product"}</th>
                    <th className="py-3 px-3">{isTh ? "บาร์โค้ด / PLU" : "Barcode / PLU"}</th>
                    <th className="py-3 px-3">{isTh ? "หมวดหมู่" : "Category"}</th>
                    <th className="py-3 px-3 text-center">{isTh ? "ประเภท" : "Type"}</th>
                    <th className="py-3 px-3 text-right">{isTh ? "ราคาขาย (฿)" : "Price (THB)"}</th>
                    <th className="py-3 px-3 text-right">{isTh ? "ต้นทุนเฉลี่ย (฿)" : "Avg Cost (THB)"}</th>
                    <th className="py-3 px-3 text-right">{isTh ? "คงเหลือ" : "Stock"}</th>
                    <th className="py-3 px-3 text-center">{isTh ? "ปุ่มขายด่วน" : "Fast Pick"}</th>
                    <th className="py-3 px-4 text-center">{isTh ? "จัดการ" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition">
                      {/* Product Name & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.nameEn}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {isTh ? prod.nameTh : prod.nameEn}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              SKU: {prod.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Barcode & PLU */}
                      <td className="py-3 px-3 font-mono">
                        <div className="text-slate-800 font-semibold">{prod.barcode}</div>
                        {prod.plu && (
                          <div className="text-[10px] text-emerald-700">PLU: {prod.plu}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                          {prod.category}
                        </span>
                      </td>

                      {/* Type (Unit vs Weight) */}
                      <td className="py-3 px-3 text-center">
                        {prod.saleType === "WEIGHT" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 font-bold text-[10px] border border-lime-300">
                            <Scale className="h-3 w-3" />
                            {isTh ? "ชั่ง นน." : "Weight"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            {isTh ? "นับชิ้น" : "Unit"}
                          </span>
                        )}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                        ฿{prod.price.toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                          /{prod.unit}
                        </span>
                      </td>

                      {/* Avg Cost */}
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        ฿{prod.avgCost.toFixed(2)}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            prod.stockQty <= 10
                              ? "bg-amber-100 text-amber-800"
                              : "text-slate-700"
                          }`}
                        >
                          {prod.stockQty} {prod.unit}
                        </span>
                      </td>

                      {/* Quick Key Switch */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleQuickKey(prod.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            prod.isQuickKey ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              prod.isQuickKey ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct
                  ? isTh
                    ? "แก้ไขข้อมูลสินค้า"
                    : "Edit Product"
                  : isTh
                  ? "เพิ่มสินค้าใหม่ลงแคตตาล็อก"
                  : "Add New Product"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ชื่อสินค้า (ไทย) *" : "Product Name (Thai) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameTh}
                    onChange={(e) => setFormNameTh(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ชื่อสินค้า (อังกฤษ)" : "Product Name (English)"}
                  </label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      {isTh ? "บาร์โค้ด EAN-13 *" : "Barcode EAN-13 *"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomEan = `8850${Math.floor(100000000 + Math.random() * 900000000)}`;
                        setFormBarcode(randomEan);
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition"
                      title={isTh ? "สุ่มสร้างบาร์โค้ดใหม่สำหรับสินค้าที่ไม่มีบาร์โค้ด" : "Generate random barcode"}
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>{isTh ? "🎲 สุ่มรหัสใหม่" : "Auto-Gen"}</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Barcode className="absolute left-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(transliterateThaiBarcode(e.target.value))}
                      placeholder="เช่น 8850188201948"
                      className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isTh
                      ? "💡 ใช้ปืนสแกนยิงใส่ช่องนี้ได้ทันที หรือกด 'สุ่มรหัส' หากเป็นสินค้าทำเอง"
                      : "Scan with gun directly or click Auto-Gen"}
                  </p>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "รหัส PLU (สำหรับตาชั่ง/ปุ่มด่วน)" : "PLU Code (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={formPlu}
                    onChange={(e) => setFormPlu(e.target.value)}
                    placeholder="เช่น 1001"
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isTh
                      ? "สำหรับสินค้าชั่งน้ำหนัก หรือปุ่มสัมผัสหน้าเคาน์เตอร์"
                      : "Used for scale weight items or fast keys"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "หมวดหมู่" : "Category"}
                  </label>
                  <select
                    value={isAddingNewCategory ? "__NEW__" : formCategory}
                    onChange={(e) => {
                      if (e.target.value === "__NEW__") {
                        setIsAddingNewCategory(true);
                        setNewCategoryName("");
                      } else {
                        setIsAddingNewCategory(false);
                        setFormCategory(e.target.value);
                      }
                    }}
                    className="w-full h-9 px-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white text-xs font-medium"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                    <option value="__NEW__">{isTh ? "+ เพิ่มหมวดหมู่ใหม่..." : "+ Add Custom Category..."}</option>
                  </select>

                  {isAddingNewCategory && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={isTh ? "พิมพ์ชื่อหมวด เช่น เครื่องสำอาง" : "Category name"}
                        className="w-full h-8 px-2.5 rounded-lg border border-emerald-500 bg-emerald-50/50 text-xs focus:outline-none focus:bg-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setNewCategoryName("");
                        }}
                        className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "รูปแบบการขาย" : "Sale Type"}
                  </label>
                  <select
                    value={formSaleType}
                    onChange={(e) =>
                      setFormSaleType(e.target.value as "UNIT" | "WEIGHT")
                    }
                    className="w-full h-9 px-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="UNIT">{isTh ? "นับชิ้น (UNIT)" : "By Unit"}</option>
                    <option value="WEIGHT">{isTh ? "ชั่งน้ำหนัก (WEIGHT)" : "By Weight"}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "หน่วยนับ" : "Unit Label"}
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="ขวด / ซอง / กก."
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ราคาขายปลีก (฿) *" : "Retail Price (THB) *"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "ต้นทุนเฉลี่ย (฿)" : "Cost Price (THB)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono text-slate-600 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? "จำนวนสต็อกตั้งต้น" : "Initial Stock"}
                  </label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? "ลิงก์รูปภาพสินค้า (Image URL)" : "Image URL"}
                </label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono text-[11px] text-slate-600 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isQuickKey"
                  checked={formIsQuickKey}
                  onChange={(e) => setFormIsQuickKey(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="isQuickKey" className="font-bold text-slate-800 cursor-pointer">
                  {isTh
                    ? "ตั้งเป็นปุ่มสินค้าขายด่วนบนหน้าจอ POS (Quick Key)"
                    : "Show as Fast-Pick button on POS screen"}
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] font-black cursor-pointer shadow-sm"
                >
                  {isTh ? "บันทึกสินค้า" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT/EXPORT MODAL */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <span>Import / Export CSV</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessCsvFile(file);
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessCsvFile(file);
              }}
              className="p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-2xl text-center space-y-2 bg-slate-50 cursor-pointer transition group"
            >
              <Upload className="h-8 w-8 text-slate-400 group-hover:text-emerald-600 transition mx-auto" />
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                {isTh ? "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ CSV วางที่นี่" : "Click to select or Drag & Drop CSV here"}
              </div>
              <div className="text-[11px] text-slate-500">
                {isTh ? "รองรับหัวตารางภาษาไทย/อังกฤษ (บาร์โค้ด, ชื่อสินค้า, หมวดหมู่, ราคาขาย, ต้นทุน, สต็อก)" : "Supports Thai/English headers (Barcode, Name, Category, Price, Cost, Stock)"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const templateHeaders = isTh
                    ? ["บาร์โค้ด", "ชื่อสินค้า (ไทย)", "ชื่อสินค้า (อังกฤษ)", "หมวดหมู่", "ประเภทการขาย (UNIT/WEIGHT)", "หน่วยนับ", "ราคาขาย (บาท)", "ต้นทุน (บาท)", "สต็อกเริ่มต้น"]
                    : ["Barcode", "Name (TH)", "Name (EN)", "Category", "Sale Type (UNIT/WEIGHT)", "Unit", "Price (THB)", "Cost (THB)", "Initial Stock"];
                  const sampleRows = [
                    ['"8850188200142"', '"นมเปรี้ยวบีทาเก้น 400ml"', '"Betagen 400ml"', '"Beverages"', '"UNIT"', '"ขวด"', "25.00", "18.00", "24"],
                    ['"8851717040214"', '"กล้วยหอมทอง (กิโลกรัม)"', '"Cavendish Banana"', '"Fresh Produce"', '"WEIGHT"', '"กก."', "45.00", "30.00", "15"],
                    ['"8850999015112"', '"ไข่ไก่สด เบอร์ 2 (แพ็ก 10 ฟอง)"', '"Fresh Eggs No.2 10s"', '"Dairy & Eggs"', '"UNIT"', '"แพ็ก"', "58.00", "44.00", "30"],
                  ];
                  const csvContent = "\uFEFF" + [templateHeaders.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "kipp_product_import_template.csv";
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }, 1000);
                  setIsCsvModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isTh ? "ดาวน์โหลดแม่แบบ" : "Download Template"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const exportHeaders = isTh
                    ? ["รหัสสินค้า", "บาร์โค้ด", "PLU", "ชื่อสินค้า (ไทย)", "ชื่อสินค้า (อังกฤษ)", "หมวดหมู่", "ประเภทการขาย", "หน่วย", "ราคาขาย (บาท)", "ราคาต้นทุน (บาท)", "จำนวนคงเหลือ", "ขายด่วน POS"]
                    : ["ID", "Barcode", "PLU", "Name (TH)", "Name (EN)", "Category", "Sale Type", "Unit", "Price (THB)", "Cost (THB)", "Stock Qty", "Quick Key"];

                  const rows = products.map((p) => [
                    `"${p.id}"`,
                    `"${p.barcode}"`,
                    `"${p.plu || ""}"`,
                    `"${p.nameTh}"`,
                    `"${p.nameEn}"`,
                    `"${p.category}"`,
                    `"${p.saleType}"`,
                    `"${p.unit}"`,
                    p.price.toFixed(2),
                    p.avgCost.toFixed(2),
                    p.stockQty.toString(),
                    p.isQuickKey ? (isTh ? '"ใช่"' : '"Yes"') : (isTh ? '"ไม่ใช่"' : '"No"'),
                  ]);

                  const csvContent = "\uFEFF" + [exportHeaders.join(","), ...rows.map((r) => r.join(","))].join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `kipp_catalog_export_${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }, 1000);
                  setIsCsvModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-[#061a12] text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>{isTh ? "ส่งออกข้อมูล CSV" : "Export Products"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
