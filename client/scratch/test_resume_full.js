async function testFullResume() {
  const sampleResumeText = `
UTKARSH RAJPUT
Email: utkarsh@example.com | Phone: +1-555-0199 | San Francisco, CA

EDUCATION:
Bachelor of Science in Computer Science, Dec 2026
University of California

TECHNICAL SKILLS:
Languages & Frameworks: React, Next.js, TypeScript, Node.js, Python, PostgreSQL, TailwindCSS, Docker, AWS

EXPERIENCE:
Software Engineer Intern | TechFlow Inc. (June 2025 - Aug 2025)
- Engineered high-throughput REST APIs and microservices in Node.js and PostgreSQL.
- Implemented real-time dashboard components using React and TailwindCSS.

PROJECTS:
Siftrole - Automated Tech Job Checklist & Career Copilot
- Built full-stack platform with real-time ATS ingestion and AI candidate matching.
`;

  const form = new FormData();
  form.append('rawText', sampleResumeText);
  form.append('fileName', 'Utkarsh_Rajput_Resume.pdf');
  form.append('userEmail', 'alex@example.com');

  const parseRes = await fetch('http://localhost:3000/api/resume/parse', {
    method: 'POST',
    body: form,
  }).then((r) => r.json());

  console.log('--- PARSE RESULT ---');
  console.log('Candidate Name:', parseRes.parsed?.candidateName);
  console.log('Skills:', parseRes.parsed?.skills);
  console.log('Degree:', parseRes.parsed?.degree);
  console.log('Projects:', parseRes.parsed?.projects);

  const chatRes = await fetch('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'what is my name in resume and what projects do I have?',
      uploadedResumeName: 'Utkarsh_Rajput_Resume.pdf',
      parsedResume: parseRes.parsed,
      liveListings: [],
    }),
  }).then((r) => r.json());

  console.log('\n--- SIFT AI RESPONSE ---');
  console.log(chatRes.reply);
}

testFullResume();
