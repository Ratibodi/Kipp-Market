import { NextRequest, NextResponse } from "next/server";
import { verifyPosToken } from "@/lib/auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

// Paths that never require authentication
const PUBLIC_PREFIXES = [
  "/api/auth/",
  "/r/", // E-Receipts public customer links
];

const EXACT_PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Check if the path is explicitly public
  const isExactPublic = EXACT_PUBLIC_PATHS.includes(pathname);
  const isPrefixPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  // Allow GET /api/staff publicly so the POS/Login PIN screen can list active cashiers
  const isPublicStaffGet = pathname === "/api/staff" && req.method === "GET";

  // 2. Extract session token (check kipp_session, fallback to kipp_pos_session)
  const token =
    req.cookies.get("kipp_session")?.value ||
    req.cookies.get("kipp_pos_session")?.value;

  const session = token ? await verifyPosToken(token) : null;

  // 3. If authenticated user visits /login or /register, redirect to /dashboard
  // (Unless explicit ?switch=true query param is provided to allow switching accounts)
  if (session && (pathname === "/login" || pathname === "/register")) {
    const isSwitching = req.nextUrl.searchParams.get("switch") === "true";
    if (!isSwitching) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 4. If path is public, allow through
  if (isExactPublic || isPrefixPublic || isPublicStaffGet) {
    return NextResponse.next();
  }

  // 5. If not public and NOT authenticated:
  if (!session) {
    // For API requests, return 401 Unauthorized JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำรายการ (Unauthorized)" },
        { status: 401 }
      );
    }

    // For page requests (e.g. /dashboard, /pos), redirect to /login with callbackUrl
    const loginUrl = new URL("/login", req.url);
    const callbackUrl = pathname + (search || "");
    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    // If an invalid or expired cookie was present, clear it on redirect
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete("kipp_session");
      response.cookies.delete("kipp_pos_session");
    }
    return response;
  }

  // 6. User is authenticated, forward request with session metadata in headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-member-id", session.memberId);
  requestHeaders.set("x-tenant-id", session.tenantId);
  requestHeaders.set("x-member-role", session.role);
  requestHeaders.set("x-branch-id", session.branchId || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
