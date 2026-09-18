import { NextRequest, NextResponse } from "next/server";

const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/newsletter/subscribers`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ success: true, count: 0, subscribers: [] });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Admin newsletter subscribers fetch error:", err);
    return NextResponse.json({ success: true, count: 0, subscribers: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${SERVER_API_URL}/api/newsletter/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Broadcast failed" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Admin newsletter broadcast proxy error:", err);
    return NextResponse.json({ error: err.message || "Failed to process newsletter broadcast." }, { status: 500 });
  }
}
