const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_j7xipzATkE2V@ep-hidden-math-azt7hzpx.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

const HR_CONTACTS_DATA = [
  {
    id: "hr-1",
    name: "Sarah Chen",
    title: "University Talent Lead & Early Career SWE",
    company: "Stripe",
    email: "sarah.chen@stripe.com",
    department: "Early Career / University",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["SWE Intern 2026", "New Grad SWE", "Backend Infrastructure"],
  },
  {
    id: "hr-2",
    name: "Alex Rivera",
    title: "Senior Technical Recruiter, Platform & Core",
    company: "Figma",
    email: "arivera@figma.com",
    department: "Engineering",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Frontend Engineers", "WebGL / Graphics", "Full Stack Interns"],
  },
  {
    id: "hr-3",
    name: "Elena Rostova",
    title: "Head of Technical Talent Acquisition",
    company: "Linear",
    email: "elena@linear.app",
    department: "Engineering",
    location: "San Francisco, CA / Hybrid",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Full Stack SWE", "Desktop Client Engineers", "Systems Interns"],
  },
  {
    id: "hr-4",
    name: "Marcus Thorne",
    title: "Global Talent Partner, R&D Engineering",
    company: "Spotify",
    email: "marcust@spotify.com",
    department: "Engineering",
    location: "New York, NY / Stockholm",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Backend Engineers", "Audio ML Engineers", "Data Engineers"],
  },
  {
    id: "hr-5",
    name: "Priya Sharma",
    title: "Lead AI/ML Technical Recruiter",
    company: "Anthropic",
    email: "priya.sharma@anthropic.com",
    department: "AI & Research",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Research Engineers", "Alignment Scientists", "Distributed Systems SWE"],
  },
  {
    id: "hr-6",
    name: "David Kim",
    title: "Staff Technical Recruiter, Infrastructure",
    company: "Datadog",
    email: "david.kim@datadoghq.com",
    department: "Engineering",
    location: "New York, NY / Boston",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Cloud Infra SWE", "Observability Engineers", "Go / Rust SWE"],
  },
  {
    id: "hr-7",
    name: "Chloe Dupont",
    title: "Design & UX Research Talent Partner",
    company: "Notion",
    email: "cdupont@makenotion.com",
    department: "Product & Design",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Product Designers", "User Researchers", "Design Systems SWE"],
  },
  {
    id: "hr-8",
    name: "Liam O'Connor",
    title: "Director of Technical Recruiting",
    company: "Vercel",
    email: "liam@vercel.com",
    department: "Engineering",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Next.js Core SWE", "Edge Infra Engineers", "Turborepo SWE"],
  }
];

async function seed() {
  console.log("Connecting to Neon PostgreSQL...");
  try {
    for (const c of HR_CONTACTS_DATA) {
      await prisma.hrContact.upsert({
        where: { email: c.email },
        update: {
          name: c.name,
          title: c.title,
          company: c.company,
          department: c.department,
          location: c.location,
          linkedin_url: c.linkedin_url,
          verified: c.verified,
          hiring_for: c.hiring_for,
        },
        create: {
          id: c.id,
          name: c.name,
          title: c.title,
          company: c.company,
          email: c.email,
          department: c.department,
          location: c.location,
          linkedin_url: c.linkedin_url,
          verified: c.verified,
          hiring_for: c.hiring_for,
        },
      });
    }
    console.log(`Successfully seeded ${HR_CONTACTS_DATA.length} verified HR contacts into Neon PostgreSQL!`);

    const count = await prisma.hrContact.count();
    console.log(`Total HR contacts in Neon PostgreSQL: ${count}`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
