const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COMPANIES = [
  {
    name: "Figma",
    career_page_url: "https://boards.greenhouse.io/figma",
    ats_type: "GREENHOUSE",
    ats_identifier: "figma",
    verified: true,
  },
  {
    name: "Stripe",
    career_page_url: "https://boards.greenhouse.io/stripe",
    ats_type: "GREENHOUSE",
    ats_identifier: "stripe",
    verified: true,
  },
  {
    name: "Airbnb",
    career_page_url: "https://boards.greenhouse.io/airbnb",
    ats_type: "GREENHOUSE",
    ats_identifier: "airbnb",
    verified: true,
  },
  {
    name: "Discord",
    career_page_url: "https://boards.greenhouse.io/discord",
    ats_type: "GREENHOUSE",
    ats_identifier: "discord",
    verified: true,
  },
  {
    name: "Retool",
    career_page_url: "https://boards.greenhouse.io/retool",
    ats_type: "GREENHOUSE",
    ats_identifier: "retool",
    verified: true,
  },
  {
    name: "Vercel",
    career_page_url: "https://jobs.ashbyhq.com/vercel",
    ats_type: "ASHBY",
    ats_identifier: "vercel",
    verified: true,
  },
  {
    name: "Linear",
    career_page_url: "https://jobs.ashbyhq.com/linear",
    ats_type: "ASHBY",
    ats_identifier: "linear",
    verified: true,
  },
  {
    name: "Ramp",
    career_page_url: "https://jobs.ashbyhq.com/ramp",
    ats_type: "ASHBY",
    ats_identifier: "ramp",
    verified: true,
  },
];

async function seed() {
  console.log("Seeding verified companies into Neon PostgreSQL...");

  for (const comp of COMPANIES) {
    const existing = await prisma.company.findFirst({
      where: { name: { equals: comp.name, mode: "insensitive" } },
    });

    if (!existing) {
      const created = await prisma.company.create({
        data: comp,
      });
      console.log(`+ Created company: ${created.name} (${created.ats_type})`);
    } else {
      console.log(`= Company already exists: ${existing.name}`);
    }
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
