import { NextRequest, NextResponse } from "next/server";

const BLOCKED_BOT_AGENTS = [
  "sqlmap",
  "nikto",
  "zgrab",
  "masscan",
  "gobuster",
  "dirbuster",
  "wprecon",
  "nmap",
];

const ipRequestMap = new Map<string, number[]>();

export function middleware(req: NextRequest) {
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();

  // 1. Block known scanner bots
  const isMalicious = BLOCKED_BOT_AGENTS.some((bot) => userAgent.includes(bot));
  if (isMalicious) {
    return new NextResponse(
      JSON.stringify({ error: "Access denied: automated scanning bot detected." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Rate limit API endpoints
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 100;

    const timestamps = (ipRequestMap.get(ip) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before making more requests." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    timestamps.push(now);
    ipRequestMap.set(ip, timestamps);
  }

  // 3. Attach security headers
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
