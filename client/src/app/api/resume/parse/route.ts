import { NextRequest, NextResponse } from "next/server";
import { executeLLMCascade } from "@/lib/ai/llmCascade";
// @ts-ignore - unpdf
import { extractText } from "unpdf";
import prisma from "@/lib/prisma";

// Comprehensive Technical Skills Dictionary for Scanner Validation
const SKILLS_LEXICON = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "Go", "Golang", "Rust", "Ruby", "PHP",
  "Swift", "Kotlin", "SQL", "HTML", "HTML5", "CSS", "CSS3", "Sass", "SCSS", "R", "Scala", "Dart",
  // Frameworks & Libraries
  "React", "React.js", "React Native", "Next.js", "NextJS", "Vue", "Vue.js", "Nuxt.js", "Angular", "Svelte",
  "Node.js", "NodeJS", "Express", "Express.js", "FastAPI", "Django", "Flask", "Spring Boot", "ASP.NET",
  "TailwindCSS", "Tailwind CSS", "Bootstrap", "Chakra UI", "Material UI", "MUI", "Redux", "Redux Toolkit",
  "Zustand", "Prisma", "Drizzle", "TypeORM", "Mongoose", "GraphQL", "Apollo", "TRPC",
  // Databases & Caching
  "PostgreSQL", "Postgres", "MongoDB", "MySQL", "Redis", "SQLite", "DynamoDB", "Cassandra", "Elasticsearch",
  "Supabase", "Firebase", "Neo4j", "Vector DB", "Pinecone", "Milvus", "ChromaDB",
  // Cloud, DevOps & Infra
  "AWS", "Amazon Web Services", "GCP", "Google Cloud", "Azure", "Docker", "Kubernetes", "K8s", "Terraform",
  "CI/CD", "GitHub Actions", "GitLab CI", "Linux", "Unix", "Bash", "Vercel", "Netlify", "AWS Lambda",
  "EC2", "S3", "Cloudflare", "Nginx", "Kafka", "RabbitMQ", "Celery",
  // AI & Data Science
  "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "Pandas", "NumPy", "OpenCV", "LangChain", "LlamaIndex",
  "Hugging Face", "LLMs", "NLP", "Computer Vision", "RAG", "Vector Search",
  // Tools & Methodologies
  "Git", "GitHub", "GitLab", "Jira", "Postman", "Figma", "REST APIs", "RESTful APIs", "WebSockets",
  "Microservices", "System Design", "Agile", "Scrum", "TDD", "Jest", "Cypress", "Playwright"
];

// Helper: Scan text deterministically for known entities
function runDeterministicScanners(rawText: string) {
  const clean = rawText.replace(/\r\n/g, "\n");

  // 1. Email
  const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // 2. Phone
  const phoneMatch = clean.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // 3. GitHub & LinkedIn
  const githubMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const githubUrl = githubMatch ? `https://github.com/${githubMatch[1]}` : "";

  const linkedinMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedinUrl = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : "";

  // 4. Skills scan
  const lowerText = clean.toLowerCase();
  const matchedSkills = new Set<string>();

  for (const skill of SKILLS_LEXICON) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?:$|[^a-zA-Z0-9#+])`, "i");
    if (regex.test(lowerText)) {
      // Normalize common variants
      let norm = skill;
      if (norm === "React.js") norm = "React";
      if (norm === "NextJS") norm = "Next.js";
      if (norm === "NodeJS") norm = "Node.js";
      if (norm === "Tailwind CSS") norm = "TailwindCSS";
      if (norm === "Golang") norm = "Go";
      if (norm === "Postgres") norm = "PostgreSQL";
      matchedSkills.add(norm);
    }
  }

  // 5. Degree keywords
  const degreeRegex = /(?:Bachelor|Master|Doctor|Ph\.?D|B\.?Tech|B\.?S\.?|B\.?E\.?|M\.?Tech|M\.?S\.?|B\.?C\.?A|M\.?C\.?A|Associate)[^,\n.]*(?:in|of)?[^,\n.]*/i;
  const degreeMatch = clean.match(degreeRegex);
  const detectedDegree = degreeMatch ? degreeMatch[0].trim() : "";

  // 6. Graduation Year
  const yearMatch = clean.match(/\b(202[0-9]|201[5-9])\b/);
  const detectedGradYear = yearMatch ? parseInt(yearMatch[0]) : null;

  return {
    email,
    phone,
    githubUrl,
    linkedinUrl,
    matchedSkills: Array.from(matchedSkills),
    detectedDegree,
    detectedGradYear,
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userEmail = (formData.get("userEmail") as string) || "";
    let rawText = (formData.get("rawText") as string) || "";

    if (!file && !rawText) {
      return NextResponse.json({ error: "No resume file or text provided" }, { status: 400 });
    }

    const fileName = file ? file.name : "Resume.pdf";
    let fileBuffer: Buffer | null = null;
    let base64Pdf = "";

    // 1. DUAL-LAYER TEXT INGESTION
    if (file) {
      fileBuffer = Buffer.from(await file.arrayBuffer());
      base64Pdf = fileBuffer.toString("base64");

      if (file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
        try {
          const { text } = await extractText(new Uint8Array(fileBuffer));
          rawText = Array.isArray(text) ? text.join("\n\n") : text || "";
        } catch (unpdfErr: any) {
          console.warn("[Parser] unpdf fallback to secondary parser:", unpdfErr?.message);
        }

        if (!rawText || rawText.trim().length < 50) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const pdfData = await pdfParse(fileBuffer);
            rawText = pdfData.text || rawText || "";
          } catch {
            rawText = rawText || fileBuffer.toString("utf-8");
          }
        }
      } else {
        rawText = fileBuffer.toString("utf-8");
      }
    }

    // Clean and normalize extracted text
    const cleanRawText = (rawText || "")
      .replace(/\r\n/g, "\n")
      .replace(/[^\x20-\x7E\n\t]/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Run deterministic scanner on the raw text
    const scanned = runDeterministicScanners(cleanRawText);

    const extractionInstructions = `You are the Lead Resume Parsing Engine for Siftrole.
Analyze this resume text thoroughly and extract EVERY detail into exact JSON with zero loss of information.

JSON FORMAT:
{
  "candidateName": "Exact full name of candidate found in resume",
  "email": "Email address found in resume (or empty string)",
  "phone": "Phone number (or empty string)",
  "location": "City, State / Country (or empty string)",
  "linkedinUrl": "LinkedIn URL or handle (or empty string)",
  "githubUrl": "GitHub URL or handle (or empty string)",
  "portfolioUrl": "Portfolio/Personal website (or empty string)",
  "headline": "Target role or headline based on resume (e.g. Software Engineer)",
  "summary": "Executive summary or professional objective (or empty string)",
  "degree": "Primary degree and major (e.g. B.S. in Computer Science)",
  "graduationYear": 2026,
  "gpa": "GPA if mentioned (or empty string)",
  "skills": ["Every single technical skill, language, framework, database, tool, API, cloud platform mentioned"],
  "categorizedSkills": {
    "languages": ["Python", "TypeScript", "JavaScript", "Go", "Java", "C++", "SQL"],
    "frameworksAndLibraries": ["React", "Next.js", "Node.js", "Express", "FastAPI", "TailwindCSS"],
    "databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
    "cloudAndDevops": ["AWS", "Docker", "Kubernetes", "GCP", "CI/CD", "Git"],
    "toolsAndMethods": ["GraphQL", "REST APIs", "System Design", "Agile", "Linux", "Figma"]
  },
  "experience": [
    {
      "role": "Job / Internship Title",
      "company": "Company Name",
      "location": "Job Location",
      "duration": "Dates / Duration (e.g. May 2025 - Aug 2025)",
      "technologiesUsed": ["React", "Node.js", "AWS"],
      "highlights": ["Every single bullet point / achievement / metric from this role"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "techStack": ["React", "TypeScript", "PostgreSQL"],
      "description": "Comprehensive summary of what the project does and candidate's role",
      "highlights": ["Key achievements, features, architecture, and metrics"],
      "link": "Live URL or GitHub link if present"
    }
  ],
  "education": [
    {
      "institution": "University / College Name",
      "degree": "Degree title (e.g. Bachelor of Science)",
      "major": "Major (e.g. Computer Science)",
      "gpa": "GPA if mentioned",
      "year": "Graduation year or date range (e.g. 2022 - 2026)",
      "relevantCoursework": ["Data Structures", "Algorithms", "Operating Systems", "DBMS"],
      "honors": ["Dean's List", "Scholarships"]
    }
  ],
  "certifications": ["AWS Certified", "etc."],
  "awardsAndAchievements": ["Hackathon winner", "etc."]
}

CRITICAL: Extract actual information from the text. Do NOT invent or make up placeholders.`;

    let parsedData: any = null;

    // 2. METHOD A: Multimodal Gemini 1.5 Flash Vision (if key available)
    const geminiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY,
    ].filter(Boolean) as string[];

    if (geminiKeys.length > 0 && base64Pdf) {
      for (const key of Array.from(new Set(geminiKeys))) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: [
                      { text: extractionInstructions },
                      {
                        inlineData: {
                          mimeType: "application/pdf",
                          data: base64Pdf,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.1,
                  responseMimeType: "application/json",
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              parsedData = JSON.parse(content);
              console.log("[Resume Parser] Successfully parsed resume via Gemini 1.5 Flash Multimodal Document AI");
              break;
            }
          }
        } catch (geminiErr: any) {
          console.warn("[Resume Parser] Gemini multimodal key attempt notice:", geminiErr?.message);
        }
      }
    }

    // 3. METHOD B: High-Capacity LLM Cascade Parser (Groq 120B / Compound / OpenAI)
    if (!parsedData) {
      const userPrompt = `Resume Document Filename: ${fileName}
Full Extracted Document Text (Length: ${cleanRawText.length} chars):
\`\`\`
${cleanRawText.slice(0, 12000) || fileName}
\`\`\`

Parse the complete resume text into the requested JSON schema accurately.`;

      const llmResult = await executeLLMCascade({
        systemPrompt: extractionInstructions,
        userPrompt,
        temperature: 0.1,
        responseFormatJson: true,
        timeoutMs: 15000,
      });

      if (llmResult?.content) {
        try {
          parsedData = JSON.parse(llmResult.content);
          console.log(`[Resume Parser] Successfully parsed resume via ${llmResult.provider}`);
        } catch {
          const jsonMatch = llmResult.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedData = JSON.parse(jsonMatch[0]);
              console.log(`[Resume Parser] Successfully extracted JSON from ${llmResult.provider}`);
            } catch {
              parsedData = null;
            }
          }
        }
      }
    }

    // 4. METHOD C: Deterministic Merging & Validation
    // Merge scanner results with LLM output so nothing is missed
    const finalSkills = Array.from(
      new Set([...(parsedData?.skills || []), ...scanned.matchedSkills])
    );

    const mergedData = {
      candidateName:
        parsedData?.candidateName ||
        cleanRawText.split("\n")[0]?.slice(0, 40).trim() ||
        fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
      email: parsedData?.email || scanned.email || "",
      phone: parsedData?.phone || scanned.phone || "",
      location: parsedData?.location || "",
      linkedinUrl: parsedData?.linkedinUrl || scanned.linkedinUrl || "",
      githubUrl: parsedData?.githubUrl || scanned.githubUrl || "",
      portfolioUrl: parsedData?.portfolioUrl || "",
      headline: parsedData?.headline || (parsedData?.experience?.[0]?.role) || "",
      summary: parsedData?.summary || "",
      degree: parsedData?.degree || scanned.detectedDegree || "",
      graduationYear: parsedData?.graduationYear || scanned.detectedGradYear || "",
      gpa: parsedData?.gpa || "",
      skills: finalSkills.length > 0 ? finalSkills : scanned.matchedSkills,
      categorizedSkills: parsedData?.categorizedSkills || {},
      experience: Array.isArray(parsedData?.experience) ? parsedData.experience : [],
      projects: Array.isArray(parsedData?.projects) ? parsedData.projects : [],
      education:
        Array.isArray(parsedData?.education) && parsedData.education.length > 0
          ? parsedData.education
          : scanned.detectedDegree
          ? [
              {
                institution: "University / College",
                degree: scanned.detectedDegree,
                year: scanned.detectedGradYear || "",
              },
            ]
          : [],
      certifications: Array.isArray(parsedData?.certifications) ? parsedData.certifications : [],
      awardsAndAchievements: Array.isArray(parsedData?.awardsAndAchievements) ? parsedData.awardsAndAchievements : [],
    };

    // 5. DATABASE PERSISTENCE
    if (userEmail) {
      try {
        await prisma.user.upsert({
          where: { email: userEmail },
          update: {
            name: mergedData.candidateName || undefined,
            graduation_year: mergedData.graduationYear ? parseInt(String(mergedData.graduationYear)) : undefined,
            skills: mergedData.skills || [],
            resume_url: fileName,
          },
          create: {
            email: userEmail,
            name: mergedData.candidateName || "Candidate",
            graduation_year: mergedData.graduationYear ? parseInt(String(mergedData.graduationYear)) : null,
            skills: mergedData.skills || [],
            resume_url: fileName,
            role: "STUDENT",
            status: "ACTIVE",
          },
        }).catch(() => null);

        // Record parsed event with full JSON payload in metadata
        await prisma.analyticsEvent.create({
          data: {
            event_type: "RESUME_PARSED_SUCCESS",
            section_name: "resume_parser",
            target_element: fileName,
            metadata: {
              candidateName: mergedData.candidateName,
              email: mergedData.email,
              degree: mergedData.degree,
              graduationYear: mergedData.graduationYear,
              skillsCount: mergedData.skills.length,
              experienceCount: mergedData.experience.length,
              projectsCount: mergedData.projects.length,
              parsedAt: new Date().toISOString(),
            },
          },
        }).catch(() => null);
      } catch (dbErr) {
        console.warn("[Resume Parser] Could not save parsed resume to database:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      fileName,
      parsed: mergedData,
      rawTextSnippet: cleanRawText.slice(0, 500),
    });
  } catch (error: any) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { error: "Our servers are experiencing trouble processing files at the moment. Please try again in a few moments." },
      { status: 500 }
    );
  }
}
