import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_USERS = [
  {
    name: "Alex Rivera",
    email: "alex.rivera@berkeley.edu",
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    graduation_year: 2026,
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    resume_url: "https://storage.siftrole.com/resumes/alex-rivera.pdf",
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@stanford.edu",
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    graduation_year: 2025,
    skills: ["Python", "PyTorch", "Machine Learning", "FastAPI", "Docker"],
    resume_url: "https://storage.siftrole.com/resumes/sarah-chen.pdf",
  },
  {
    name: "Marcus Vance",
    email: "marcus@siftrole.internal",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    graduation_year: null,
    skills: ["Platform Ops", "Security", "AI Systems"],
    resume_url: null,
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@gatech.edu",
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    graduation_year: 2026,
    skills: ["Go", "Kubernetes", "Distributed Systems", "Rust"],
    resume_url: "https://storage.siftrole.com/resumes/priya-sharma.pdf",
  },
  {
    name: "Jordan Lee",
    email: "jordan.lee@mit.edu",
    role: UserRole.STUDENT,
    status: UserStatus.INACTIVE,
    graduation_year: 2025,
    skills: ["UI/UX Design", "Figma", "Next.js", "Tailwind CSS"],
    resume_url: null,
  },
];

async function main() {
  console.log("🌱 Seeding sample users and analytics events for Admin Portal...");

  for (const u of SAMPLE_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });
    if (!existing) {
      await prisma.user.create({ data: u });
      console.log(`✅ Seeded user: ${u.name} (${u.role})`);
    }
  }

  // Seed sample analytics events
  const sampleEvents = [
    { event_type: "page_view", section_name: "hero", duration_ms: 5400 },
    { event_type: "section_view", section_name: "job_feed", duration_ms: 24000 },
    { event_type: "button_click", target_element: "explore_roles_cta" },
    { event_type: "apply_click", target_element: "apply_button" },
    { event_type: "section_view", section_name: "features", duration_ms: 10200 },
  ];

  for (const ev of sampleEvents) {
    await prisma.analyticsEvent.create({
      data: ev,
    });
  }

  console.log("🌱 Admin demo seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
