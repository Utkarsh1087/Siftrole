import { NextRequest, NextResponse } from "next/server";
import { dispatchRoleAlert } from "@/lib/notifications/alerts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, company, location, stipend_or_salary, apply_url, skills } = body;

    if (!title || !company || !apply_url) {
      return NextResponse.json({ error: "Title, company, and apply URL are required" }, { status: 400 });
    }

    const result = await dispatchRoleAlert({
      title,
      company,
      location: location || "Remote / Hybrid",
      stipend_or_salary,
      apply_url,
      skills,
    });

    return NextResponse.json({
      success: true,
      result,
      message: "Alert dispatched successfully to subscribers",
    });
  } catch (error: any) {
    console.error("Alert dispatch API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
