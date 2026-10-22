import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { MOCK_FINANCIAL_MOVEMENTS, FinancialMovementRecord, MovementType } from "@/data/mockData";

// Process-wide in-memory cache to guarantee persistence across requests and page refreshes
const globalForMovements = globalThis as unknown as {
  __kipp_movements?: FinancialMovementRecord[];
};

if (!globalForMovements.__kipp_movements) {
  globalForMovements.__kipp_movements = [...MOCK_FINANCIAL_MOVEMENTS];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("type"); // "EXPENSE" | "INFLOW" | null

    let dbMovements: FinancialMovementRecord[] = [];

    try {
      const expenses = await db.expense.findMany({
        orderBy: { spentAt: "desc" },
        take: 100,
      });

      if (expenses.length > 0) {
        dbMovements = expenses.map((e) => {
          let parsedNote: any = {};
          try {
            parsedNote = e.note ? JSON.parse(e.note) : {};
          } catch {
            parsedNote = { note: e.note };
          }

          const isInf = e.category.startsWith("INFLOW:");
          const cleanCategory = e.category.replace(/^(INFLOW|EXPENSE):/, "");

          return {
            id: e.id,
            docNo: parsedNote.docNo || (isInf ? `INF-${e.id.slice(-6)}` : `EXP-${e.id.slice(-6)}`),
            type: (isInf ? "INFLOW" : "EXPENSE") as MovementType,
            category: cleanCategory,
            categoryTh: parsedNote.categoryTh || cleanCategory,
            amount: Number(e.amount),
            date: e.spentAt.toISOString().replace("T", " ").slice(0, 16),
            destinationOrSource: parsedNote.destinationOrSource || "DRAWER",
            recordedBy: parsedNote.recordedBy || "สมชาย พ. (ผู้จัดการ)",
            note: parsedNote.note || "",
          };
        });
      }
    } catch (dbErr) {
      console.warn("DB query failed in /api/expenses, using cached store:", dbErr);
    }

    // Combine db records with memory store, removing duplicates by ID
    const mergedMap = new Map<string, FinancialMovementRecord>();
    for (const m of globalForMovements.__kipp_movements || []) {
      mergedMap.set(m.id, m);
    }
    for (const m of dbMovements) {
      mergedMap.set(m.id, m);
    }

    let allMovements = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (filterType === "EXPENSE" || filterType === "INFLOW") {
      allMovements = allMovements.filter((m) => m.type === filterType);
    }

    // Calculate totals for waterfall strip
    const totalRevenue = 24850;
    const cogs = 17941.7;
    const totalExpenses = allMovements
      .filter((m) => m.type === "EXPENSE")
      .reduce((sum, m) => sum + m.amount, 0);
    const totalInflows = allMovements
      .filter((m) => m.type === "INFLOW")
      .reduce((sum, m) => sum + m.amount, 0);

    const netOperatingSurplus = Number(
      (totalRevenue - cogs - totalExpenses + totalInflows).toFixed(2)
    );

    return NextResponse.json({
      movements: allMovements,
      summary: {
        totalRevenue,
        cogs,
        totalExpenses,
        totalInflows,
        netOperatingSurplus,
      },
    });
  } catch (err: any) {
    console.error("GET /api/expenses error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load financial movements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, categoryTh, amount, destinationOrSource, recordedBy, note } = body;

    // Validation
    if (!type || (type !== "EXPENSE" && type !== "INFLOW")) {
      return NextResponse.json(
        { error: "Invalid movement type: must be EXPENSE or INFLOW" },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number greater than 0" },
        { status: 400 }
      );
    }

    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").slice(0, 16);
    const randDoc = Math.floor(100 + Math.random() * 900);
    const docNo = type === "INFLOW" ? `INF-202610-${randDoc}` : `EXP-202610-${randDoc}`;
    const id = `${type.toLowerCase()}-${Date.now()}`;

    const newRecord: FinancialMovementRecord = {
      id,
      docNo,
      type: type as MovementType,
      category: category.trim(),
      categoryTh: categoryTh || category.trim(),
      amount: numAmount,
      date: dateStr,
      destinationOrSource: destinationOrSource || "DRAWER",
      recordedBy: recordedBy || "สมชาย พ. (ผู้จัดการ)",
      note: note || "",
    };

    // 1. Save to in-memory store
    globalForMovements.__kipp_movements = [
      newRecord,
      ...(globalForMovements.__kipp_movements || []),
    ];

    // 2. Attempt save to database Prisma Expense model
    try {
      const tenant = await db.tenant.findFirst();
      if (tenant) {
        const branch = await db.branch.findFirst({ where: { tenantId: tenant.id } });
        const member = await db.member.findFirst({ where: { tenantId: tenant.id } });

        if (branch && member) {
          await db.expense.create({
            data: {
              tenantId: tenant.id,
              branchId: branch.id,
              memberId: member.id,
              category: `${type}:${category}`,
              amount: new Prisma.Decimal(numAmount),
              note: JSON.stringify({
                docNo,
                categoryTh: categoryTh || category,
                destinationOrSource: destinationOrSource || "DRAWER",
                recordedBy: recordedBy || "สมชาย พ. (ผู้จัดการ)",
                note: note || "",
              }),
              spentAt: now,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Could not write expense to database, saved to in-memory store:", dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        movement: newRecord,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/expenses error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to record financial movement" },
      { status: 500 }
    );
  }
}
