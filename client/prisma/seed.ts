import { PrismaClient, AtsType } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_COMPANIES = [
  {
    name: "Figma",
    career_page_url: "https://www.figma.com/careers/",
    ats_type: AtsType.GREENHOUSE,
    ats_identifier: "figma",
    verified: true,
  },
  {
    name: "Stripe",
    career_page_url: "https://stripe.com/jobs",
    ats_type: AtsType.GREENHOUSE,
    ats_identifier: "stripe",
    verified: true,
  },
  {
    name: "Spotify",
    career_page_url: "https://www.lifeatspotify.com/jobs",
    ats_type: AtsType.LEVER,
    ats_identifier: "spotify",
    verified: true,
  },
  {
    name: "Linear",
    career_page_url: "https://linear.app/careers",
    ats_type: AtsType.ASHBY,
    ats_identifier: "linear",
    verified: true,
  },
  {
    name: "Notion",
    career_page_url: "https://www.notion.so/careers",
    ats_type: AtsType.ASHBY,
    ats_identifier: "notion",
    verified: true,
  },
  {
    name: "SmartRecruiters",
    career_page_url: "https://www.smartrecruiters.com/about-us/careers/",
    ats_type: AtsType.SMARTRECRUITERS,
    ats_identifier: "smartrecruiters",
    verified: true,
  },
];

async function main() {
  console.log("🌱 Starting seed for Siftrole verified companies...");

  for (const comp of SEED_COMPANIES) {
    const existing = await prisma.company.findFirst({
      where: {
        name: comp.name,
      },
    });

    if (!existing) {
      const created = await prisma.company.create({
        data: comp,
      });
      console.log(`✅ Inserted company: ${created.name} (${created.ats_type})`);
    } else {
      console.log(`ℹ️  Company already exists: ${existing.name}`);
    }
  }

  console.log("🌱 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
