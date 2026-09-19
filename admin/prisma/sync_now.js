const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

function computeHash(text) {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
}

function computeKey(company, title, location) {
  const norm = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  return `${norm(company)}_${norm(title)}_${norm(location)}`;
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
}

function extractSkills(text) {
  const common = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
    "Go", "Rust", "Java", "C++", "SQL", "PostgreSQL", "GraphQL",
    "AWS", "Docker", "Kubernetes", "Tailwind CSS", "Figma", "Design",
    "Product Management", "Machine Learning", "AI"
  ];
  const found = [];
  const lower = text.toLowerCase();
  for (const s of common) {
    if (lower.includes(s.toLowerCase())) {
      found.push(s);
    }
  }
  return found.slice(0, 8);
}

async function scrapeGreenhouse(identifier, companyName) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${identifier}/jobs?content=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map((j) => {
    const title = j.title?.trim() || "Untitled Role";
    const location = j.location?.name?.trim() || "Remote / Unspecified";
    const cleanContent = j.content ? stripHtml(j.content) : "";
    const rawText = `${title}\n${companyName}\n${location}\n${cleanContent}`;
    return {
      title,
      company: companyName,
      location,
      skills_required: extractSkills(rawText),
      apply_url: j.absolute_url || `https://boards.greenhouse.io/${identifier}/jobs/${j.id}`,
      raw_jd_hash: computeHash(rawText),
      raw_jd_text: rawText.substring(0, 10000),
      normalized_key: computeKey(companyName, title, location),
    };
  });
}

async function scrapeAshby(identifier, companyName) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${identifier}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map((j) => {
    const title = j.title?.trim() || "Untitled Role";
    const location = j.location || "Remote / Unspecified";
    const cleanContent = stripHtml(j.descriptionHtml || j.descriptionPlain || "");
    const rawText = `${title}\n${companyName}\n${location}\n${cleanContent}`;
    return {
      title,
      company: companyName,
      location,
      skills_required: extractSkills(rawText),
      apply_url: j.jobUrl || `https://jobs.ashbyhq.com/${identifier}/${j.id}`,
      raw_jd_hash: computeHash(rawText),
      raw_jd_text: rawText.substring(0, 10000),
      normalized_key: computeKey(companyName, title, location),
    };
  });
}

async function sync() {
  console.log("Starting full live ATS sync into PostgreSQL...");
  const companies = await prisma.company.findMany({ where: { verified: true } });
  let totalInserted = 0;

  for (const comp of companies) {
    console.log(`\nFetching ${comp.name} (${comp.ats_type})...`);
    let jobs = [];
    try {
      if (comp.ats_type === "GREENHOUSE") {
        jobs = await scrapeGreenhouse(comp.ats_identifier, comp.name);
      } else if (comp.ats_type === "ASHBY") {
        jobs = await scrapeAshby(comp.ats_identifier, comp.name);
      }
      console.log(` -> Fetched ${jobs.length} roles from ${comp.name}`);

      for (const item of jobs) {
        const existing = await prisma.listing.findFirst({
          where: { raw_jd_hash: item.raw_jd_hash },
        });

        if (!existing) {
          await prisma.listing.create({
            data: {
              company_id: comp.id,
              title: item.title,
              company: item.company,
              location: item.location,
              skills_required: item.skills_required,
              apply_url: item.apply_url,
              source: "scraped",
              status: "active",
              raw_jd_hash: item.raw_jd_hash,
              raw_jd_text: item.raw_jd_text,
              normalized_key: item.normalized_key,
            },
          });
          totalInserted++;
        }
      }
    } catch (e) {
      console.error(` Error fetching ${comp.name}:`, e.message);
    }
  }

  const finalCount = await prisma.listing.count();
  console.log(`\n=== SYNC COMPLETE ===`);
  console.log(`New Listings Inserted: ${totalInserted}`);
  console.log(`Total Live Listings in DB: ${finalCount}`);
}

sync()
  .catch((e) => {
    console.error("Sync error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
