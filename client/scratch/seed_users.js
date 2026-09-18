const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_j7xipzATkE2V@ep-hidden-math-azt7hzpx.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

const DUMMY_USERS = [
  {
    id: "user-student",
    email: "student@demo.com",
    name: "Alex Morgan",
    role: "STUDENT",
    status: "ACTIVE",
    graduation_year: 2026,
    degree: "B.S. in Computer Science",
    target_role: "Full Stack Engineer",
    bio: "Passionate about building scalable web applications, distributed systems, and modern AI interfaces.",
    skills: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "TailwindCSS", "Docker"],
    github_url: "https://github.com/alexmorgan",
    linkedin_url: "https://linkedin.com/in/alexmorgan",
    portfolio_url: "https://alexmorgan.dev",
    phone: "+1 (555) 234-5678",
    resume_name: "Alex_Morgan_Resume_2026.pdf",
    work_mode: "Hybrid / Remote",
    salary_expectation: "$95,000 - $120,000",
    profile_status: "active",
  },
  {
    id: "user-ux-researcher",
    email: "sarah.ux@example.com",
    name: "Sarah Jenkins",
    role: "STUDENT",
    status: "ACTIVE",
    graduation_year: 2025,
    degree: "M.S. in Human-Computer Interaction",
    target_role: "UX Researcher & Product Designer",
    bio: "Specializing in qualitative user interviews, usability testing, and intuitive design systems for SaaS products.",
    skills: ["Figma", "User Research", "Wireframing", "Usability Testing", "Design Systems", "Prototyping", "User Journey Mapping"],
    github_url: "https://github.com/sarahjenkins-design",
    linkedin_url: "https://linkedin.com/in/sarahjenkins-ux",
    portfolio_url: "https://sarahjenkins.design",
    phone: "+1 (555) 876-5432",
    resume_name: "Sarah_Jenkins_UX_Resume.pdf",
    work_mode: "Remote",
    salary_expectation: "$105,000 - $130,000",
    profile_status: "active",
  },
  {
    id: "user-data-scientist",
    email: "priya.data@example.com",
    name: "Priya Patel",
    role: "STUDENT",
    status: "ACTIVE",
    graduation_year: 2026,
    degree: "B.Tech in Data Science & AI",
    target_role: "Machine Learning / Data Scientist",
    bio: "Focused on LLM fine-tuning, retrieval-augmented generation (RAG), and large-scale data processing pipelines.",
    skills: ["Python", "PyTorch", "TensorFlow", "Pandas", "SQL", "LangChain", "HuggingFace", "FastAPI", "Vector DBs"],
    github_url: "https://github.com/priyapatel-ai",
    linkedin_url: "https://linkedin.com/in/priyapatel-data",
    portfolio_url: "https://priyapatel.ai",
    phone: "+1 (555) 345-6789",
    resume_name: "Priya_Patel_AI_ML_Resume.pdf",
    work_mode: "Remote / In-Office",
    salary_expectation: "$110,000 - $140,000",
    profile_status: "active",
  },
  {
    id: "user-product-manager",
    email: "rohan.pm@example.com",
    name: "Rohan Verma",
    role: "STUDENT",
    status: "ACTIVE",
    graduation_year: 2025,
    degree: "B.S. in Management & Technology",
    target_role: "Associate Product Manager",
    bio: "Product thinker obsessed with user empathy, roadmap prioritization, growth metrics, and cross-functional execution.",
    skills: ["Product Strategy", "Agile / Scrum", "A/B Testing", "SQL", "Mixpanel", "Jira", "Market Research", "Roadmapping"],
    github_url: "https://github.com/rohanverma-pm",
    linkedin_url: "https://linkedin.com/in/rohanverma-pm",
    portfolio_url: "https://rohanverma.co",
    phone: "+1 (555) 456-7890",
    resume_name: "Rohan_Verma_PM_Resume.pdf",
    work_mode: "Hybrid",
    salary_expectation: "$100,000 - $125,000",
    profile_status: "active",
  }
];

async function seedUsers() {
  console.log("Seeding dummy users into Neon PostgreSQL...");
  try {
    for (const u of DUMMY_USERS) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          role: u.role,
          status: u.status,
          graduation_year: u.graduation_year,
          degree: u.degree,
          target_role: u.target_role,
          bio: u.bio,
          skills: u.skills,
          github_url: u.github_url,
          linkedin_url: u.linkedin_url,
          portfolio_url: u.portfolio_url,
          phone: u.phone,
          resume_name: u.resume_name,
          work_mode: u.work_mode,
          salary_expectation: u.salary_expectation,
          profile_status: u.profile_status,
        },
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          status: u.status,
          graduation_year: u.graduation_year,
          degree: u.degree,
          target_role: u.target_role,
          bio: u.bio,
          skills: u.skills,
          github_url: u.github_url,
          linkedin_url: u.linkedin_url,
          portfolio_url: u.portfolio_url,
          phone: u.phone,
          resume_name: u.resume_name,
          work_mode: u.work_mode,
          salary_expectation: u.salary_expectation,
          profile_status: u.profile_status,
        },
      });
      console.log(`✓ Seeded user: ${u.name} (${u.email}) - ${u.target_role}`);
    }

    const total = await prisma.user.count();
    console.log(`\nAll dummy users populated successfully! Total users in database: ${total}`);
  } catch (err) {
    console.error("User seeding error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
