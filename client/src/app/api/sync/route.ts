import { NextRequest, NextResponse } from "next/server";
import { syncAllCompanies, syncCompany } from "@/lib/sync/runner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { companyId } = body;

    if (companyId) {
      const result = await syncCompany(companyId);
      return NextResponse.json({ success: true, results: [result] });
    }

    const results = await syncAllCompanies();
    return NextResponse.json({
      success: true,
      totalCompaniesSynced: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Scraper sync trigger error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // Support simple cron-like GET ping
  try {
    const results = await syncAllCompanies();
    return NextResponse.json({
      success: true,
      totalCompaniesSynced: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
