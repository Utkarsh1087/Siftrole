# Siftrole

Siftrole connects students and early-career builders with verified tech opportunities directly from trusted company career feeds.

## Project Architecture

- **`client/`**: Public Job Board (Next.js 16, Tailwind CSS, Lucide Icons)
  - URL: `http://localhost:3000`
  - Features: Live company ticker, curated role filters, YC/Linear style design, application tracking.
- **`admin/`**: Standalone Admin Portal (Next.js 16, PostgreSQL, Prisma, Groq LLM)
  - URL: `http://localhost:3001`
  - Features: Verified company management, user CRUD, Groq AI job ingestion parser, site analytics telemetry, ATS sync pipeline.

## Getting Started

### 1. Run the Public Client
```bash
cd client
npm run dev
```

### 2. Run the Admin Dashboard
```bash
cd admin
npm run dev
```

### 3. Database
- Powered by PostgreSQL with Prisma ORM (`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/siftrole"`).
