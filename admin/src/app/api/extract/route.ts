import { NextRequest, NextResponse } from "next/server";
import { extractJobListingWithAI } from "@/lib/ai/extractor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { raw_jd_text } = body;

    if (!raw_jd_text || typeof raw_jd_text !== "string" || !raw_jd_text.trim()) {
      return NextResponse.json(
        { error: "raw_jd_text is required to extract job information." },
        { status: 400 }
      );
    }

    const result = await extractJobListingWithAI(raw_jd_text);

    return NextResponse.json({
      success: true,
      listing: result.listing,
      modelUsed: result.modelUsed,
      tokensUsed: result.tokensUsed,
      rawExtractedJson: result.rawExtractedJson,
    });
  } catch (error: any) {
    console.error("Extraction route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse job description" },
      { status: 500 }
    );
  }
}
