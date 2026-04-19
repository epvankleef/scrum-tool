<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# scrum-tool

Digitaal scrum-bord gebaseerd op het Scrum School-template (Product Backlog · Sprint Backlog · To Do · Busy + testen · Done, plus Definition of Fun/Done, Burn Down, Stand-up, Review & Retro). Team-leden plakken samen live stickies op één gedeeld bord via een share-link. Uitstraling = "echt papier" — scheve stickies, tape, Caveat-font.

## Stack

- Next.js 16 App Router · TypeScript · Tailwind v4 · `next/font` (Caveat + Inter)
- Supabase Postgres + Realtime broadcast (project `sxjjivsbykvrnlamcaga` in org Cartesya, eu-central-1)
- `@dnd-kit/*` voor drag-and-drop met fractional-index positionering
- `@tanstack/react-query` voor client-state, `recharts` voor burn-down
- Vercel hosting — config via `vercel.ts`, dagelijkse cron op `/api/cron/burndown`

## Architectuur-regels

- **Browser praat nooit direct met de DB.** Mutaties gaan via server actions / route handlers met service-role (`lib/supabase/server.ts`). Browser gebruikt alleen Supabase Realtime broadcast voor live-updates.
- RLS staat op default-deny op alle tabellen. Access = via service-role vanaf server.
- Share-token in URL (`/b/[share_token]`) is de enige "auth" — server verifieert voor elke mutatie.
- Sticky-posities = `double precision` met fractional indexing (`lib/fractional-index.ts`) zodat gelijktijdige drops elkaar niet overschrijven.
- Sticky `rotation` wordt bij aanmaken gefixeerd (−3..+3°) en opgeslagen — consistent papiergevoel, geen dansend bord.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # productie build
pnpm lint
pnpm typecheck
```

## Env

Zie `.env.example`. `.env.local` bevat lokale waardes, nooit committen.
Ontbrekende `SUPABASE_SERVICE_ROLE_KEY` invullen vanuit Supabase dashboard → Project Settings → API → `service_role`.

## Database

Migraties in `supabase/migrations/*.sql`. Toegepast via Supabase MCP (`apply_migration`) of `supabase db push` als de CLI lokaal staat.

## Plan

Zie `~/.claude/plans/ik-wil-een-scrum-squishy-hearth.md` voor de volledige spec en mijlpalen (M0–M7). M0 = skeleton (huidig), M1 = statisch bord, M2 = CRUD + drag-drop, M3 = realtime, M4 = sprints, M5 = footer-docks, M6 = burn-down, M7 = polish.
