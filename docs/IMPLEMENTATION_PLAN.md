# Openwork — Implementation Plan

**Product name:** Openwork
**Thesis:** A job listing should tell you how the job actually works — schedule, communication, environment, hiring process and support — before you apply.
**Positioning line:** Find work where you can do your best work.

---

## 1. Benchmark findings

Research done September 24, 2026 against the live products. Where a product is
gated behind sign-in, that is recorded as a limitation rather than guessed at.

### Wellfound (primary benchmark — verified live)
Single-column job list grouped by job family. Each card, in order: company logo,
company name, job title, company size/stage, location, **salary range always
present**, equity, posting recency, and **Save + Apply directly on the card**.
No heavy filter rail on the browse page; filtering happens through pre-built
segment pages (`/candidates/remote`, `/role/l/software-engineer/united-states`).

**Adopt:** salary on every card, save/apply without opening the job, posting
recency as a first-class field, company context on the card, single-column
scannable list, profile-drives-application (don't re-ask what we already hold).
**Reject:** equity/startup-stage framing (wrong for hourly and administrative
work), category-grouped browse as the only discovery path (too weak for a
preference-driven marketplace).

### LinkedIn Jobs (verified live, logged-out)
Logged-out LinkedIn now serves a **single-column** list, not the split view, and
shows a banner saying most filters are temporarily unavailable — "you can type
them directly into your search." Cards are minimal: title, company, location,
recency, "Be an early applicant." Full descriptions require sign-in.

**Adopt:** date-posted / company / experience / employment-type filter
vocabulary, job alerts, the split-view reading pattern for desktop (a mature
signed-in pattern, applied here to *everyone* since our jobs are public).
**Reject:** gating the job description behind auth — it directly contradicts our
"prove value before asking for commitment" rule; and "early applicant"-style
urgency mechanics, which are engagement bait.

### Indeed (verified via Indeed Help + Hiring Lab)
Preferences live on a profile Preferences page: job titles, locations, work
types, **salary**, qualifications and skills, each markable as *preferred* or
*hidden*. Indeed's own 2026 Best Jobs index weights Remote Work Availability as
an explicit scoring factor alongside pay and demand.

**Adopt:** preferences as durable profile state that silently shapes every
search (not a one-off wizard), the preferred/hidden distinction, a plain-language
"qualifications" summary, and treating work arrangement as a ranking input.
**Reject:** volume-first discovery and one-click apply to everything — our north
star is fewer, better applications.

### Welcome to the Jungle
Returns **HTTP 403 to unauthenticated fetches**, so its current company pages
could not be verified. Rather than describe an interface I could not load, the
company-profile design here is derived from our own PRD §8 and the market
research §8 "Job Environment Profile", not from WTTJ. Recorded as a research gap
to close with a manual session.

### Shopify Polaris (verified from the published package, not the docs site)
`@shopify/polaris@13.9.5`. Peer dependency is **React ^18.0.0 — not React 19**,
so React is pinned to 18.3. `polaris.shopify.com/components` now 301s to
shopify.dev. Component inventory and props were read from the package's own
`.d.ts` files, which is authoritative.

Legacy components present and **avoided**: `LegacyCard`, `LegacyStack`,
`LegacyTabs`, `LegacyFilters`. Modern equivalents used instead: `Card`, `Box`,
`BlockStack`, `InlineStack`, `InlineGrid`, `Tabs`, `Filters`.

---

## 2. Product architecture

Single-page React application, no backend. All state is local and persisted to
`localStorage` behind one store module, so a real API can replace it without
touching screens.

- `src/lib/dimensions.ts` — the **single shared vocabulary** for how work works.
  One table defines, per dimension: the candidate-facing question and options,
  the employer-facing question and options, the ordinal scale, and the sentence
  templates used in explanations. Candidate UI, employer UI and the matching
  engine all read from this one table. Adding a twelfth dimension is a
  one-object change, not a three-file change.
- `src/lib/match.ts` — deterministic matching. No scoring model, no inference.
- `src/data/*` — realistic seed marketplace.
- `src/state/store.tsx` — context + reducer + localStorage.

## 3. Information architecture

**Public:** Home · Find Jobs · Job Detail · Company · How It Works · For
Employers · Sign in / Create account

**Candidate:** Home · Jobs · Saved · Applications · Profile (Professional · How I
Work Best · Privacy & Sharing)

**Employer:** Dashboard · Jobs · Create Job · Candidates · Company & Workplace

**Admin:** Employer verification · Reported jobs

Candidate navigation is five items. Employer navigation is four. Both are flat —
no nested menus, no hidden navigation (PRD §11: predictable navigation).

## 4. User roles

`visitor` · `candidate` · `employer` · `admin`. Coach exists in the data model
(`JobCoachRelationship`) and is deliberately **not** built in MVP.

## 5. Route map

| Route | Role |
|---|---|
| `/` | public |
| `/jobs` | public — search, filters, split view |
| `/jobs/:id` | public |
| `/companies/:id` | public |
| `/how-it-works`, `/for-employers` | public |
| `/signin`, `/signup` | public |
| `/onboarding` | candidate |
| `/home` | candidate |
| `/saved`, `/applications`, `/applications/:id` | candidate |
| `/jobs/:id/apply` | candidate |
| `/profile`, `/profile/work-preferences`, `/profile/privacy` | candidate |
| `/employer` | employer |
| `/employer/jobs`, `/employer/jobs/new`, `/employer/jobs/:id/edit` | employer |
| `/employer/jobs/:id/preview` | employer |
| `/employer/candidates`, `/employer/candidates/:id` | employer |
| `/employer/company` | employer |
| `/admin` | admin |

## 6. Data model

`User` · `CandidateProfile` (professional + `workPreferences` + `privacy`) ·
`Skill` · `Experience` · `Employer` (+ `verification`) · `WorkplaceProfile` ·
`Job` (+ `environment` + `hiring` + `requirements`) · `HiringStage` ·
`SavedJob` · `Application` (+ `sharedData` + `statusHistory`) · `Report` ·
`JobCoachRelationship` (modeled, unused).

A candidate preference is `{ value, importance }` where importance is
`required | preferred | dontMatter`. A job environment value is
`string | null` — **null means the employer did not answer**, which is a
first-class state, never filled in with a guess.

## 7. Polaris component mapping

| Need | Polaris |
|---|---|
| App frame, nav, top bar | `Frame`, `Navigation`, `TopBar` |
| Page scaffold | `Page`, `Layout`, `Box`, `BlockStack`, `InlineStack`, `InlineGrid` |
| Surfaces | `Card`, `Divider` |
| Type | `Text` (never raw `<h1>`/`<p>` with custom sizes) |
| Actions | `Button`, `ButtonGroup`, `Link` |
| Status | `Badge`, `Banner`, `Tag`, `ProgressBar` |
| Forms | `Form`, `FormLayout`, `TextField`, `Select`, `ChoiceList`, `Checkbox`, `RadioButton` |
| Filtering | `Filters`, `ChoiceList` inside filter sections |
| Disclosure | `Collapsible`, `Popover`, `Modal` |
| Empty / loading | `EmptyState`, `SkeletonBodyText`, `Spinner` |

## 8. Product-specific components

Each composed from Polaris primitives and tokens only:
`JobCard` · `MatchSummary` · `WhyThisMatches` · `WorkEnvironmentProfile` ·
`HiringProcess` · `PreferenceControl` · `PrivacyControl` ·
`ApplicationStatusTimeline` · `CompanyCard` · `SharingReview` ·
`CompletenessMeter` · `VerificationBadge`.

## 9. Candidate golden path

Browse without an account → job detail with full environment profile → create
account → goal, basics, skills, How I Work Best, privacy → personalised results
→ Why This Matches → save → apply → **What This Employer Will See** → submit →
tracker.

## 10. Employer golden path

Create account → organization → company profile → workplace profile → create job
(Part One: the job / Part Two: how this job actually works) → vague-language
check → hiring process → candidate-view preview → publish → review applicants →
advance through configured stages.

## 11. Matching model

`candidate.value + candidate.importance + job.environment[dim] → state + sentence`

States: **Aligned · Worth reviewing · Different from your preference ·
Not important to you · Not provided by this employer.**

Rules, per dimension, on an ordinal scale:

- employer value is `null` → *Not provided* (never inferred, never scored)
- importance is `dontMatter` → *Not important to you*
- distance 0 → *Aligned*
- distance 1 → *Worth reviewing* (or *Different* when importance is `required`)
- distance ≥ 2 → *Different*

Hard constraints (work arrangement, employment type, commute) are surfaced
separately and **never auto-hide a job**. No percentage is the primary UX. No
automatic rejection. No inference from any disclosure.

## 12. Privacy model

Three states per shareable field: **Private to me · Used for matching ·
Shared with employer.** Default for every How I Work Best answer is *Used for
matching*. Nothing reaches an employer without passing the explicit
**What This Employer Will See** step. There is no diagnosis field anywhere in
the product.

## 13. Accessibility strategy

WCAG 2.2 AA target. Polaris supplies focus rings, contrast and labelling
foundations; the product adds: one decision per onboarding step, visible step
progress, autosave, status communicated by text + icon (never color alone),
errors adjacent to their field, `prefers-reduced-motion` respected globally,
skip link, semantic landmarks, and literal button labels.

## 14. Responsive strategy

Candidate mobile is designed, not compressed. Desktop `/jobs` is a split view
(results list + detail pane); below `md` it becomes a results list that pushes to
a full-screen job detail route, with filters in a sheet. Employer tooling is
desktop-first and remains usable at tablet width.

## 15. Phases

1. Foundation — dimensions table, types, store, seed data
2. Design system — app shell, navigation, product components
3. Public marketplace — landing, search, filters, job detail, company
4. Candidate — auth, onboarding, profile, How I Work Best, saved
5. Matching — engine, Why This Matches, recommendations
6. Applications — apply, sharing review, tracker
7. Employer — onboarding, company, job builder, hiring process, applicants
8. Admin + quality — moderation, states, responsive, accessibility audit

## Assumptions recorded

1. **No backend.** Seed data + localStorage. Store module is the seam.
2. **Polaris on React 18**, because 13.9.5 declares that peer. Not a preference.
3. **Welcome to the Jungle unverified** (403). Company-profile structure comes
   from the PRD, not from a guess at their UI.
4. **CLAUDE.md conflict:** the global instruction says MUI via the design-system
   MCP; this brief specifies Polaris. Followed the brief, since it is explicit
   and current.
5. **Salary shown on every job.** Seed data always includes a range, because
   transparency is a product rule (PRD §13), not a nice-to-have.
