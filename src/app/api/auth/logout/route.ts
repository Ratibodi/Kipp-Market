import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("kipp_session");
  cookieStore.delete("kipp_pos_session");

  return NextResponse.json({
    success: true,
    message: "ออกจากระบบเรียบร้อย",
  });
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("kipp_session");
  cookieStore.delete("kipp_pos_session");

  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}
