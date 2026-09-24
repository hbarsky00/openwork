# Openwork

An accessibility-first employment platform. Every job states what it actually
requires — a typical day as tasks, physical and communication requirements, the
real software and whether it works with a screen reader — and every workplace
shows its accessibility evidence (✓ confirmed · △ contact · ✗ not available ·
? not provided) with who said it and when. A candidate's **Work Accessibility
Passport** (strengths, how they work, what they need — never a diagnosis) is
compared line by line, unknowns become "Ask employer", and nothing reaches an
employer until the candidate confirms the exact list.

## Run

```bash
npm install
npm run dev
```

Vite + React 18 + TypeScript + Shopify Polaris 13. No backend: seed data lives in
`src/data`, state persists to `localStorage` through `src/state/store.tsx`.

**Demo accounts** are on `/signin` — one per scenario: Devon (screen reader,
keyboard, accessible documents), Rosa (step-free, accessible restroom and
workstation), Sam (captions, text communication, interpreter), Tyler (first job,
no résumé, job coach), Priya (preferences only, no disclosure). Employers:
Meridian, Northline, Dalgren, Kessler & Vance, Corvid. Plus the trust team.

## Where things are

| Path | What |
|---|---|
| `src/lib/access.ts` | The access-needs taxonomy: 9 categories, ~55 needs, each with a resolver saying where the employer's side comes from. Also physical/communication requirements, technology attributes, hiring options, strengths, job families. |
| `src/lib/dimensions.ts` | The 11 "how work works" questions (one of the resolvers). |
| `src/lib/match.ts` | Deterministic need-based matching with evidence sources + self-check (`npx tsx src/lib/match.ts`). |
| `src/lib/search.ts` | URL-state search/filter + vague-language detector. |
| `src/state/store.tsx` | Reducer + persistence. The seam for a real API. |
| `src/components/` | Product components on Polaris primitives. |
| `src/pages/{public,candidate,employer,admin}` | Routes. |
| `docs/ACCESSIBILITY_PLATFORM_REBUILD_PLAN.md` | Audit, research, architecture, taxonomy, matching, privacy, verification, migration. |
| `docs/IMPLEMENTATION_PLAN.md` | The original (superseded) plan, kept for the audit trail. |
| `docs/DESIGN_SYSTEM.md` | Tokens, components, states, accessibility. |

## Checks

```bash
npx tsc --noEmit -p tsconfig.app.json
npx tsx src/lib/match.ts
npm run build
```
