# M&W Command

The private operating system for M&W Labs. M&W Command covers lead capture, qualification, proposals, contracts, client onboarding, project delivery, tasks, time, team capacity, invoices, payments, expenses, retainers, reporting, automation, and a Gemini-powered agency second brain.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 and shadcn/ui (Base UI primitives)
- Three.js / React Three Fiber and GSAP
- MySQL 8.4 in development and production
- Prisma ORM 7 with the official MySQL/MariaDB driver adapter
- Better Auth with database sessions, email/password, optional Google OAuth, organizations, teams, roles, invitations, and rate limits
- Google GenAI SDK for Gemini

## Local setup

Requirements: Node.js 20.19+ and Docker Desktop (or an existing MySQL 8 server).

```bash
# Create a local .env file with the variables listed below.
docker compose up -d mysql
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For initial setup only, set `ALLOW_INITIAL_SIGNUP=true`, create the first owner account, then set it back to `false`. Set `SEED_DEMO_DATA=true` only when you want sample records in a development workspace.

The included development database uses a non-root `mwlabs_app` user and a separate `mwlabs_shadow` database for Prisma Migrate. Replace every credential and secret before deploying.

### Secret handling

- Keep local credentials only in `.env`; every `.env*` file is ignored by Git.
- Keep `GEMINI_API_KEY`, database passwords, auth secrets, and OAuth secrets server-only. Never use a `NEXT_PUBLIC_` prefix for them.
- Configure production credentials through the deployment platform's encrypted secret manager, then redeploy after rotating a credential.
- Run `npm run security:check` before pushing. GitHub Actions also rejects tracked key patterns and credential files.
- If a provider or GitHub reports a leaked key, revoke it first. Removing it from code does not make the leaked value safe again.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL application connection string |
| `SHADOW_DATABASE_URL` | MySQL shadow database used by development migrations |
| `BETTER_AUTH_URL` | Canonical application URL |
| `BETTER_AUTH_SECRET` | High-entropy auth secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth |
| `GEMINI_API_KEY` | Server-only Gemini credential |
| `GEMINI_MODEL` | Gemini model, default `gemini-3.5-flash` |
| `ALLOW_INITIAL_SIGNUP` | Temporary owner bootstrap gate; keep `false` after setup |
| `SEED_DEMO_DATA` | Adds sample records to a new development workspace when `true` |

Production should use TLS for MySQL, an application-specific database user, managed secret storage, and a transaction email provider before requiring email verification.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run security:check
npm run build
```

If a restricted container prevents Turbopack from starting its internal CSS worker, the equivalent verification command is `npx next build --webpack`.

## Architecture

- `src/app/(marketing)` — M&W Labs public brand experience and authentication layout
- `src/app/(agency)/app` — protected M&W Labs command-center layout
- `src/lib/dal.ts` — server-only session, organization, and DTO boundary
- `src/app/api` — authenticated, Zod-validated route handlers
- `prisma/schema.prisma` — multi-tenant relational domain model
- `prisma/migrations` — MySQL migration history
- `compose.yaml` — reproducible MySQL 8.4 development service

AI responses are grounded in organization-scoped data. Agency records are treated as untrusted context, secrets stay server-side, and external or consequential actions require human approval.
