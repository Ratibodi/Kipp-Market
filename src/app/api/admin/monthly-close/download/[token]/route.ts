import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const archive = await db.monthlyArchive.findUnique({
    where: { downloadToken: token },
  });

  if (!archive || !archive.filePath) {
    return NextResponse.json({ error: "Archive file not found" }, { status: 404 });
  }

  const fullPath = path.join(process.cwd(), "public", archive.filePath.replace(/^\//, ""));
  try {
    const fileBuffer = await fs.readFile(fullPath);
    const fileName = path.basename(fullPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to read archive file" }, { status: 500 });
  }
}
