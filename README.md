# Siftrole | Intelligent Tech Career Platform & ATS Pipeline

### 🌐 Live Production Deployments
- 🚀 **Candidate Web App**: [https://siftrole-user.vercel.app](https://siftrole-user.vercel.app)
- 🛡️ **Admin Operations Console**: [https://siftrole-admin.vercel.app](https://siftrole-admin.vercel.app)

Siftrole connects university students, early-career engineers, and builders directly with verified tech roles extracted from official ATS feeds (Greenhouse, Lever, Ashby, SmartRecruiters) and direct recruiter contacts.

---

## 🏛️ Architecture Overview

The monorepo contains three independent services sharing a unified PostgreSQL database:

| Component | Framework | Port (Local) | Primary Responsibility |
| :--- | :--- | :---: | :--- |
| **`client/`** | Next.js 16 (App Router) | `:3000` | Public job board, resume parser & matcher, Sift AI Career Copilot, direct recruiter outreach (`/cold-email`), student dashboard. |
| **`admin/`** | Next.js 16 (App Router) | `:3001` | Operations portal, Admin AI Copilot, scraper sync pipelines, pending review queue, company verifier, newsletter dispatcher. |
| **`server/`** | Node.js & Express | `:4000` | Microservice APIs, authentication, background sync jobs, email delivery. |

---

## 🤖 Two-Tier AI Agent System

* **Candidate Career Copilot** (`client`): Safe, sandboxed assistant providing verified role recommendations and resume matching. Fully isolated with prompt-injection defense.
* **Admin Operations Agent** (`admin`): Full-control platform agent with live database grounding (`totalListings`, `activeListings`, `pendingListings`, `totalUsers`, extractions) to advise on platform operations.
* **Multi-Key Failover Cascade**: Both agents utilize Groq (`qwen/qwen3.8-27b`, `openai/gpt-oss-120b`) and Google AI Studio (`gemini-3.6-flash`, `gemini-3.8-flash`) with automatic rate-limit failover across multiple API keys.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Root
npm install

# Sub-services
cd client && npm install
cd ../admin && npm install
cd ../server && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in each service directory:
```bash
cp client/.env.example client/.env
cp admin/.env.example admin/.env
cp server/.env.example server/.env
```
Fill in your `DATABASE_URL` (Neon PostgreSQL), Groq/Gemini API keys, and Resend credentials.

### 3. Generate Database Client
```bash
cd client && npx prisma generate
cd ../admin && npx prisma generate
```

### 4. Run Development Servers
From the root directory:
```bash
# Terminal 1: Client (:3000)
npm run dev:client

# Terminal 2: Admin Dashboard (:3001)
npm run dev:admin

# Terminal 3: Express Backend (:4000)
npm run dev:server
```

---

## 🚢 Deployment Guide

### Deploying to Vercel (Client & Admin)
1. **Client**:
   * Root Directory: `client`
   * Build Command: `next build` (Prisma generate is automated via `postinstall`)
   * Output Directory: `.next`
   * Environment Variables: Copy from `client/.env.example`
2. **Admin**:
   * Root Directory: `admin`
   * Build Command: `next build`
   * Output Directory: `.next`
   * Environment Variables: Copy from `admin/.env.example`

### Deploying to Render / Railway (Server)
* Root Directory: `server`
* Build Command: `npm install`
* Start Command: `npm start` (`node src/index.js`)
* Environment Variables: Copy from `server/.env.example`

---

## ⏰ Keep-Alive Automation (GitHub Actions)

A dedicated GitHub Actions workflow is included at [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml).

It automatically pings `/api/health` across all three deployed services every 14 minutes to prevent free-tier instances (Render, Railway, Fly.io, Vercel cold starts) from spinning down.

**To activate**:
In your GitHub repo: **Settings ➔ Secrets and variables ➔ Actions**, configure:
* `CLIENT_URL` (e.g. `https://siftrole.vercel.app`)
* `ADMIN_URL` (e.g. `https://siftrole-admin.vercel.app`)
* `SERVER_URL` (e.g. `https://siftrole-server.onrender.com`)

---

## 🔒 Security Best Practices

* Never commit `.env` or `.env.local` files to Git. All secret files are strictly excluded in `.gitignore`.
* Sensitive admin mutation endpoints are guarded by session authentication and role validation.
* Rate limiting is enforced via `express-rate-limit` on the backend and middleware proxies in Next.js.
