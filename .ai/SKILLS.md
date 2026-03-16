# DocsVault — Shared Agent Context

## What is DocsVault?
DocsVault is a **secure AI-powered document sharing platform** (a DocSend alternative). Founders, sales teams, and professionals upload PDFs (pitch decks, contracts, reports), configure secure sharing links, and share them with stakeholders. Viewers open the link and can interact with an **AI Assistant** that answers their questions using a curated Knowledge Base that the document owner pre-populates.

## Core Value Proposition
- **Secure sharing:** email gates, passcodes, auto-expiring links, watermarks
- **Analytics:** per-page view tracking, time-on-page, viewer drop-off
- **AI Knowledge Base:** owner curates Q&A pairs from the document; the AI uses *only* these approved answers when viewers ask questions (zero hallucinations)

## Tech Stack
- **Framework:** Next.js 15 (App Router), deployed via Cloudflare Workers (OpenNext)
- **Database:** PostgreSQL via Prisma ORM
- **Storage:** Vercel Blob (file storage)
- **AI:** Google Gemini (`@google/generative-ai`) + local embeddings (`@xenova/transformers`)
- **Auth:** NextAuth.js

## Repository Structure
```
/app         → Next.js app router pages & API routes
/components  → React UI components
/context     → React context providers (data/state)
/lib         → Shared utilities and helpers
/prisma      → Database schema (schema.prisma)
/public      → Static assets
/.ai         → AI agent configs and SKILLS files (this folder)
```

## Key Database Models
| Model | Purpose |
|---|---|
| `User` | Authenticated user accounts |
| `Workspace` | Multi-user workspaces |
| `Document` | Uploaded PDF files |
| `Link` | Secure share links (slug, passcode, email gate, watermark, AI toggle) |
| `View` | Viewer session tracking |
| `PageView` | Per-page analytics |
| `Comment` | Viewer Q&A (questions sent to owner) |
| `KnowledgeBase` | AI KB per document (pending/ready status) |
| `KBEntry` | Individual Q&A pair, with embedding for semantic search |
| `UnansweredQuestion` | Viewer questions that had no KB match |

## Critical Git Rules (ALL AGENTS MUST FOLLOW)
1. **NEVER commit directly to `main`**
2. All AI-generated code changes go to the `ai` branch ONLY
3. After completing a feature or fix, open a Pull Request from `ai` → `main`
4. Add a comment in the PR summarising what changed and why
5. **Wait for board (Nikhil) approval** before merging — this is a hard rule, no exceptions
6. The board reviews PRs manually and will merge when satisfied

## AI Dev Tool
The **Developer Agent** uses **Antigravity** (Google DeepMind's AI coding assistant) to write, edit, and commit code. Antigravity can read files, edit files, run terminal commands, and open browser sessions.

---

## Agent Roster

| Agent | Role | Heartbeat |
|---|---|---|
| Product Manager | Analyze usage + competitor data → generate GitHub Issues | Weekly (Monday 9am IST) |
| Marketing Manager | Write and post DocsVault content on Twitter/X and Product Hunt | Daily (10am IST) |
| Developer | Implement PM tickets using Antigravity on the `ai` branch | On-demand (ticket triggered) |
