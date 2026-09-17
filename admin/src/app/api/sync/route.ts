import { NextRequest, NextResponse } from "next/server";
import { syncAllCompanies, syncCompany } from "@/lib/sync/runner";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (companyId) {
      const result = await syncCompany(companyId);
      return NextResponse.json({ success: true, result });
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
