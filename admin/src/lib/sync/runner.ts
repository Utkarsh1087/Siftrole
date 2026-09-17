import prisma from "../prisma";
import { getAdapter, NormalizedListing, SyncResult } from "../scrapers";
import { parseScrapedListingWithAi } from "../ai/extractor";

export async function syncCompany(companyId: string): Promise<SyncResult> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error(`Company with ID ${companyId} not found`);
  }

  const adapter = getAdapter(company.ats_type);
  if (!adapter) {
    return {
      companyId: company.id,
      companyName: company.name,
      atsType: company.ats_type,
      fetched: 0,
      inserted: 0,
      updated: 0,
      expired: 0,
      flagged: 0,
      errors: [`No adapter found for ATS type: ${company.ats_type}`],
    };
  }

  let scrapedListings: NormalizedListing[] = [];
  try {
    scrapedListings = await adapter.fetchListings(company.ats_identifier, company.name);
  } catch (error: any) {
    console.error(`[Scraper Error] Failed to fetch listings for ${company.name}:`, error);
    return {
      companyId: company.id,
      companyName: company.name,
      atsType: company.ats_type,
      fetched: 0,
      inserted: 0,
      updated: 0,
      expired: 0,
      flagged: 0,
      errors: [error.message || "Failed to fetch listings"],
    };
  }

  let inserted = 0;
  let updated = 0;
  let flagged = 0;
  const currentScrapedHashes = new Set<string>();

  for (const rawItem of scrapedListings) {
    currentScrapedHashes.add(rawItem.raw_jd_hash);

    const exactMatch = await prisma.listing.findFirst({
      where: {
        raw_jd_hash: rawItem.raw_jd_hash,
      },
    });

    if (exactMatch) {
      if (exactMatch.status === "expired") {
        await prisma.listing.update({
          where: { id: exactMatch.id },
          data: {
            status: "active",
            updated_at: new Date(),
          },
        });
        updated++;
      }
      continue;
    }

    // AI Parsing Step: Parse raw JD text and metadata through AI extraction engine first
    let item: NormalizedListing;
    try {
      item = await parseScrapedListingWithAi(rawItem);
    } catch (aiErr) {
      console.warn(`[AI Parsing Error] Failed to parse scraped JD for ${rawItem.title}, using raw item:`, aiErr);
      item = rawItem;
    }

    const nearMatch = await prisma.listing.findFirst({
      where: {
        normalized_key: item.normalized_key,
        status: "active",
      },
    });

    const status = nearMatch ? "flagged" : "active";
    if (nearMatch) {
      flagged++;
    }

    await prisma.listing.create({
      data: {
        company_id: company.id,
        title: item.title,
        company: item.company,
        location: item.location,
        employment_type: item.employment_type,
        eligibility: item.eligibility,
        stipend_or_salary: item.stipend_or_salary,
        deadline: item.deadline ? new Date(item.deadline) : null,
        skills_required: item.skills_required,
        experience_level: item.experience_level,
        apply_url: item.apply_url,
        source: item.source || "scraped",
        status: status,
        raw_jd_hash: item.raw_jd_hash,
        raw_jd_text: item.raw_jd_text,
        normalized_key: item.normalized_key,
      },
    });

    inserted++;
  }

  const existingCompanyListings = await prisma.listing.findMany({
    where: {
      company_id: company.id,
      source: "scraped",
      status: {
        in: ["active", "flagged"],
      },
    },
  });

  let expired = 0;
  for (const existing of existingCompanyListings) {
    if (!currentScrapedHashes.has(existing.raw_jd_hash)) {
      await prisma.listing.update({
        where: { id: existing.id },
        data: {
          status: "expired",
          updated_at: new Date(),
        },
      });
      expired++;
    }
  }

  return {
    companyId: company.id,
    companyName: company.name,
    atsType: company.ats_type,
    fetched: scrapedListings.length,
    inserted,
    updated,
    expired,
    flagged,
  };
}

export async function syncAllCompanies(): Promise<SyncResult[]> {
  const companies = await prisma.company.findMany({
    where: { verified: true },
  });

  const results: SyncResult[] = [];
  for (const company of companies) {
    try {
      const res = await syncCompany(company.id);
      results.push(res);
    } catch (err: any) {
      console.error(`Sync error on company ${company.name}:`, err);
      results.push({
        companyId: company.id,
        companyName: company.name,
        atsType: company.ats_type,
        fetched: 0,
        inserted: 0,
        updated: 0,
        expired: 0,
        flagged: 0,
        errors: [err.message || "Unknown sync error"],
      });
    }
  }

  return results;
}
