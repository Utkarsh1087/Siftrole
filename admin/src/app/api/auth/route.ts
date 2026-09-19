import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "siftrole-admin-2026";
const AUTH_COOKIE_NAME = "siftrole_admin_token";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token === ADMIN_SECRET) {
      return NextResponse.json({
        authenticated: true,
        user: { name: "Administrator", role: "ADMIN", status: "Active" },
      });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, passcode } = body;

    const inputPassword = password || passcode;
    const isValid = inputPassword === ADMIN_SECRET;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Administrator authenticated successfully",
      user: {
        email: email || "admin@siftrole.com",
        name: "Administrator",
        role: "ADMIN",
        status: "Active",
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: ADMIN_SECRET,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
