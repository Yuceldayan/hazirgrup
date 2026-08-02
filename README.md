# HazırGrup

> **Create your group, pick a package, decide together.**

A city-based platform that answers a group of friends' "so where are we going?"
in a single flow. You create a group, enter headcount, budget and date, get
matching venue packages, invite friends by link so they can vote with you, and
send a booking request to the venue behind the winning package.

---

## Runs with one command

```bash
npm install
npm run dev
```

`http://localhost:3000` — **no environment variables and no external services
required.**

If no Supabase key is configured the application drops into **demo mode**: an
in-memory data source filled with seed data, where the whole plan → invite → vote
→ booking flow works end to end. A "Demo mode" banner appears at the top.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| User | `elif@ornek.test` | `Demo1234` |
| Business | `isletme01@ornek.test` | `Isletme1234` |
| Admin | `admin@ornek.test` | `Admin1234` |

These are also listed on the sign-in screen (in demo mode only). All of them are
fictional and contain no real personal data.

### Mobile app

```bash
npm run dev:mobile      # Expo development server
```

Scan the QR code with Expo Go. Mobile uses the same demo data source.

---

## What is in it

| Area | State |
| --- | --- |
| Public SEO site (Next.js) | City, district, category, venue, package, guide and FAQ pages — static / ISR |
| Guest invite flow | Join and vote without an account (signed cookie identity) |
| User panel | 7-step plan wizard, invitations, voting, booking tracking |
| Business panel | Package management, booking approve/reject, opening hours |
| Admin panel | Application review, user and business management, audit log |
| Mobile app (Expo) | Sign-in, plan wizard, voting, bookings, notifications |
| Database | 13 migrations + RLS policies + seed |
| Tests | 479 unit/integration (Vitest) + 44 E2E (Playwright) |

---

## Repository layout

```
apps/
  web/            Next.js 16 (App Router) — public site + every panel
  mobile/         Expo SDK 57 + Expo Router
packages/
  types/          shared domain types
  core/           business logic: matching, budget, state machines, SEO, seed
  validation/     Zod schemas (shared by web and mobile)
  ui/             design tokens (single source; CSS for web, TS for mobile)
supabase/
  migrations/     0001…0013 — schema, indexes, RLS
  seed/seed.sql   GENERATED from the packages/core seed (do not edit by hand)
  tests/rls.sql   RLS policy tests
e2e/              Playwright scenarios
tests/            integration, SEO and security tests
scripts/          code generation (tokens, seed SQL) and helpers
docs/             product, architecture, security, SEO, testing and decision records
```

---

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | web development server |
| `npm run dev:mobile` | Expo development server |
| `npm run build` | web production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint across the repository |
| `npm run typecheck` | `tsc --noEmit` in every workspace |
| `npm test` | Vitest (unit + integration) |
| `npm run test:e2e` | Playwright (starts the web server itself) |
| `npm run test:rls` | RLS SQL tests (requires the Supabase CLI) |
| `npm run verify` | lint + typecheck + test |
| `npm run seed:sql` | regenerate `supabase/seed/seed.sql` |
| `npm run tokens:css` | regenerate `apps/web/src/styles/tokens.css` |

---

## Documentation

**Getting started**
- [SETUP.md](docs/SETUP.md) — installation, demo mode, Supabase (local and cloud)
- [DEPLOY_WEB.md](docs/DEPLOY_WEB.md) — web deployment and environment variables
- [BUILD_ANDROID.md](docs/BUILD_ANDROID.md) — producing an Android APK/AAB
- [MOBILE_QA_CHECKLIST.md](docs/MOBILE_QA_CHECKLIST.md) — on-device test list

**Product and design**
- [PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) · [USER_FLOWS.md](docs/USER_FLOWS.md) · [INFORMATION_ARCHITECTURE.md](docs/INFORMATION_ARCHITECTURE.md) · [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) · [SCREENSHOTS.md](docs/SCREENSHOTS.md)

**Technical**
- [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) · [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) · [SECURITY_MODEL.md](docs/SECURITY_MODEL.md) · [SEO_STRATEGY.md](docs/SEO_STRATEGY.md) · [TEST_STRATEGY.md](docs/TEST_STRATEGY.md)

**Process**
- [DECISIONS.md](docs/DECISIONS.md) — every technical decision with its rationale (D-001…D-031)
- [PROGRESS.md](docs/PROGRESS.md) — what was built, phase by phase
- [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) — known limits (L-01…L-15)
- [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) · [FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md)

---

## Architecture in short

**Data access is an adapter.** `createRepository()` returns either
`DemoRepository` (in-memory, seed-filled) or `SupabaseRepository`; the
application layer never knows which. That is why the repository runs the moment
it is cloned, without creating any account, and why adding Supabase changes not a
single line of application code.

**The seed has one source.** `packages/core/src/seed/dataset.ts` feeds both the
demo repository and `supabase/seed/seed.sql` (`npm run seed:sql`). The two can
never drift apart.

**Design tokens have one source.** CSS variables for the web are generated from
the tokens in `packages/ui` (`npm run tokens:css`); mobile consumes them directly
as TypeScript. Colour contrast is verified by an automated test.

**Security is layered.** RLS policies are the real authority; `requireUser`,
`requireRole` and `requireBusinessMember` on the server, plus route guards,
repeat it. Invite tokens are stored in the database only as SHA-256 digests.

Details: [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md),
[SECURITY_MODEL.md](docs/SECURITY_MODEL.md).

---

## Things worth knowing

- **There are no real secrets in this repository.** `.env.example` is a template;
  `.env.local` never enters version control.
- **All data is fictional.** Person names, businesses, phone numbers and reviews
  are examples; none of it belongs to a real person or business.
- **The production CSP includes `script-src 'unsafe-inline'`.** This is forced by
  the Next.js App Router's inline RSC payload; the rationale and the mitigations
  are in [D-031](docs/DECISIONS.md) and [L-15](docs/KNOWN_LIMITATIONS.md).
- Features deliberately left out of scope, and why, are listed in
  [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md).

---

## My role

**Sole developer.** The product idea, the data model, the Next.js web
application, the mobile app, the shared packages (`core` / `types` / `ui` /
`validation`), the Supabase schema and RLS policies, and the entire test setup
are all mine.
