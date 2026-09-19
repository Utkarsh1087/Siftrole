import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "siftrole-admin-2026";
const AUTH_COOKIE_NAME = "siftrole_admin_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, favicon, public assets, and all API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".png") ||
    pathname.includes(".svg")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token === ADMIN_SECRET;

  // If unauthenticated and trying to access dashboard or protected paths, redirect to /login
  if (!isAuthenticated && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and trying to access /login, redirect to /
  if (isAuthenticated && pathname === "/login") {
    const dashboardUrl = new URL("/", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
