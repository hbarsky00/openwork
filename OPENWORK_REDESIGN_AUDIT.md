# Openwork redesign audit

Date: 2026-09-26. Scope: the whole repository (`hbarsky00/openwork`, 43 commits since 2026-09-24) and the live product at https://open-work.tech, which serves this repository's `main` branch. **Every push to `main` deploys.**

The directive asks for AUDIT → PRESERVE → RESTRUCTURE → REDESIGN → IMPROVE. This document is the audit and the classification. Implementation starts in the same session, in the order given at the end.

---

## 1. What exists

### 1.1 Architecture

| Layer | Today |
|---|---|
| Build | Vite 8, React 18.3, TypeScript 6, react-router 7 |
| UI foundation | Shopify Polaris 13.9.5 + `src/styles/product.css` (1,987 lines) that re-tokens Polaris to the settled Openwork identity (Inter, slate ink, near-black primary, blue links; six text sizes) |
| State | One reducer in `src/state/store.tsx`, persisted to `localStorage` key `openwork.v9` (schema 9). Seed data merges with user data on load; `wellFormed` guards drop malformed records. |
| Auth | Four roles: visitor, candidate, employer, admin. Demo personas by default. Clerk email accounts behind `VITE_CLERK_PUBLISHABLE_KEY` (`src/auth/clerk.tsx`), bridged into the store by email. Employers and admin are demo-only. |
| Backend | Two Netlify Functions: `/api/suggest` (résumé rewrites) and `/api/import-jobs` (careers-page import), both call Claude with `ANTHROPIC_API_KEY`. No database. Netlify DB (Neon) is the agreed next step. |
| Data | 16 jobs, 8 employers, 5 candidates, seeded applications and questions. Realistic names, pay, tasks, hiring stages, dated accessibility evidence. No lorem ipsum. |

### 1.2 Routes (41)

Public: `/` (landing for visitors, redirect to Matches for candidates), `/about`, `/how-it-works`, `/for-employers`, `/pricing`, `/support`, `/jobs`, `/jobs/:id`, `/companies/:id`, `/discover`, `/signin/*`, `/signup/*`, `/employers/signup`, `/post` (job-first employer sign-up), `/claim`.

Candidate: `/onboarding` (6 steps), `/matches` (home), `/jobs/:id/apply`, `/applications`, `/applications/:id`, `/saved`, `/passport` (+ `/passport/access-needs`, `/how-i-work`, `/sharing`, `/assist`), `/resume`, legacy `/profile*` and `/home` redirects.

Employer: `/employer` (overview), `/employer/jobs`, `/employer/jobs/new`, `/employer/jobs/import`, `/employer/jobs/:id/edit`, `/employer/jobs/:id/preview`, `/employer/candidates`, `/employer/candidates/:id`, `/employer/interviews`, `/employer/accessibility`, `/employer/company`, `/employer/settings`.

Admin: `/admin` (verification levels, reports).

### 1.3 Data model, mapped to the directive's list

| Directive concept | Exists as | Gap |
|---|---|---|
| User / CandidateProfile | `CandidateProfile` (name, email, phone, headline, about, location, goals, desiredRoles, employmentTypes, salary, `strengths`, `skills`, `experience[]`, `education[]`, `workExamples[]`, `firstJob`, `workPreferences`, `accessNeeds`, `assistMode`, `plan`, `autoRules`, `supportNotes`, coach) | One type carries everything. Fine at this size. |
| Experience / Skill | `Experience` (kind: paid, school, volunteer, project…), `skills: string[]`, `strengths: string[]` | Skills are strings, not entities. Acceptable. |
| JobPreference / WorkPreference | `desiredRoles`, `employmentTypes`, `desiredSalaryMin`; `WorkPreferences` over 14 `DimensionId`s with `importance` (required / preferred / dontMatter) and `visibility` | Matches the directive exactly. |
| AccessibilityNeed / AccessibilityPrivacy | `AccessNeeds` keyed by feature with `importance` + `visibility` (private / matching / shared) | Matches. |
| Resume | `resumeFileName` + `/resume` builder from profile | No file storage (no backend). |
| Employer / Company / Verification | `Employer` with `verification: listed / practicesCompleted / verifiedPractices`, `claimedBy`, `plan` | Directive wants company verification separate from accessibility claims. Today one field blends them. **Split needed.** |
| WorkplaceAccessibilityProfile | `Employer.accessibility: Record<feature, Evidence>` + `workplace{}` + `accessibilityContact` | Matches. |
| ATSConnection / JobImport | `/employer/jobs/import` creates drafts; no connection object, no sync state | **Missing:** `Job.source` (manual / imported / ats), `Job.importedFrom`, `Job.needsInfo`, `ATSConnection` (designed, not functional). |
| Job, JobTask, JobRequirement, PhysicalRequirement, TechnologyRequirement, WorkEnvironment | `Job` has `tasks[]`, `essentialRequirements[]`, `preferredRequirements[]`, `physical{}`, `communication{}`, `technology[]` (with per-tool accessibility evidence), `environment{}` over the 14 dimensions | Matches. |
| AccessibilityEvidence | `Evidence {status: confirmed / contact / notAvailable, source: employer / openwork / candidate, confirmedOn, note}` | Directive states: CONFIRMED / WORTH REVIEWING / NEEDS CONFIRMATION / NOT PROVIDED. Our `matchJob` already derives exactly those four for the candidate (`confirmed / review / needsConfirmation / different`). Naming in UI is consistent. |
| HiringMethod / HiringStage | `hiringOptions[]`, `hiringStages[]`, `decisionTimeframe` | Matches. |
| JobMatch / MatchReason | Computed live by `matchJob()` → `MatchResult`, `matchTier()`, `evidenceLines()` | Not persisted. Fine. **Missing:** "Worth knowing" lines (meetings, travel) and "Not for me" feedback. |
| SavedJob, Application, ApplicationSharedData, ApplicationStatus | All present; statuses prepared / applied / viewed / assessment / interview / offer / hired / notSelected / withdrawn; `sentBy` candidate or openwork | Directive tabs (All / Needs action / Applied / Interview / Offer / Closed) map onto these. |
| Interview | Implicit: status `interview` + `history[]` + `shared.accommodationRequest` | **Missing:** interview object (format, when, arrangements) and a preparation surface. |
| AccommodationRequest | `Application.shared.accommodationRequest` + `Question` to employer | Adequate. |
| Notification | none | **Missing.** `alerts[]` exists for saved searches only. |
| CandidateFeedback | none | **Missing** ("Not for me" reasons). |
| JobCoachRelationship | type exists, unused in UI | Keep the type. |

### 1.4 Working functionality (verified in the browser this week)

Candidate: onboarding two paths, Matches home with hero and feed, "Why this is a great fit" three-line evidence, search with rail and compact strip, split-view results, job page with evidence + hiring process + Your match bars, one-page Prepare application with required employer questions and readiness, Quick apply when there are no questions, Applications with Ready-to-send / Active / Interviews / Closed and a detail timeline, Saved with suggestions, Passport with per-item privacy, How Openwork helps (Review / Assist / Auto with rules and daily cap), résumé builder with two templates and print-to-PDF, Discover by strengths, job alerts, ask-employer questions, report a job.

Employer: overview, 7-step job builder on option cards, jobs list with Edit + overflow, candidates with status filter, candidate detail showing only shared data with a "Sent by Openwork" banner, interviews list, workplace accessibility profile that folds answered areas, company profile, settings, auto-apply opt-out per job, job-first sign-up (`/post`), claim by work-email domain, careers-page import (backend-dependent), pricing page.

Admin: verification level per employer, reported jobs.

Quality gates in place: axe (wcag2a/aa, 2.1aa, 2.2aa, best-practice) zero violations on every page touched since 2026-09-25; every form's first field under 320px at 1440; 44px controls; Log in / Sign up vocabulary; no chip walls.

### 1.5 Unfinished or absent

1. Backend never exercised end to end: both functions need a key in Netlify. Clerk path untested.
2. No database; user data lives in the browser.
3. No notifications surface. No Help entry in the header.
4. "Why this matches" is a panel inside the card, not the flagship page/drawer with Worth knowing and Application sections.
5. No "Not for me" feedback loop.
6. Applications tabs do not match the directive (no Needs action / Offer split); no interview object or preparation surface; no AI interview actions.
7. AI résumé tailoring is a rewrite button per field (works when backend is up); no diff view of changes.
8. Employer landing still leads with a paragraph and "Post a job"; the directive wants Import → Connect ATS → Post, plus a Founding Employer program.
9. Import creates drafts but there is no Import review (ready / needs information), no `source` on jobs, no Enrich flow distinct from the 7-step builder, no ATS connection architecture.
10. No AI job analysis panel for employers (the deterministic `findVaguePhrases` exists and is used only as a warning count in the builder).
11. Employer dashboard mixes priorities with description text; no sync state, no "imported jobs needing enrichment" tile.
12. Candidate matching for employers does not exist.
13. Employer verification and accessibility claims share one field.

### 1.6 Visual inconsistencies

- Employer pages still use Polaris `Page`/`Card`/`Layout` (Jobs, Candidates, Accessibility, Overview) while candidate pages use `.ow-sheet` and `.ow-pagehead`. Two header styles.
- Logo monogram tiles scale text with size (11–24px); acceptable, but they are the only off-scale text left.
- The landing display headline is a special size (56px) by design.
- Two badge tone systems (Polaris tones vs `.ow-matchlabel`).

### 1.7 UX problems still open

- Filters exist twice in the DOM (rail and strip) and are toggled by CSS.
- Discover overlaps onboarding path B; both pick strengths.
- Passport is one very long page; the directive's profile architecture wants sections that can be reached directly.
- Job page is long; "How this job works" is a definition list rather than the grouped structure the directive specifies (schedule, environment, physical, technology, workplace).
- Employer overview reads as a report, not a work queue.

### 1.8 Accessibility

Strong: axe-clean, 44px targets, focus ring, landmarks, `role="status"` on result counts and readiness, keyboard-operable option cards with radio/checkbox semantics, display modes (Simplified, Large text), reduced motion respected via Polaris tokens.

Not yet done: a real screen-reader pass (VoiceOver), forced-colors / high-contrast mode check, 400% zoom reflow check, announcement of filter changes beyond the count, modal focus return test on Ask employer, error announcement test on Apply.

### 1.9 Dead or duplicate code

Unused components: `AccommodationRequest`, `CompanyCard`, `JobAccessibilitySummary`, `JobRequirements`, `Stepper`, `WorkEnvironmentProfile`. Unrouted page: `CandidateHome` (224 lines, superseded by Matches). `ChoiceChips` is still used inside form controls (EvidencePicker, PreferenceControl) but nowhere as a filter.

---

## 2. Classification

### KEEP
- Store, persistence, seed merge, roles, demo personas, Clerk bridge.
- `matchJob`, `matchTier`, `evidenceLines`, `jobSatisfies`, `rankScore`, dimensions and access vocabularies (`src/lib/match.ts`, `dimensions.ts`, `access.ts`). This is the product's intelligence.
- Apply engine (`src/lib/apply.ts`), auto-apply rules and daily cap.
- Data: employers, jobs, candidates, applications, questions.
- `QuickApplyButton`, `OptionCard`/`OptionGrid`, `PickedList`, `StrengthsPicker`, `NeedsSearch`, `EvidenceLine`, `FitPanel`, `SuggestRewrite`, `DisplaySettings`.
- Onboarding, Apply, Résumé builder, Passport privacy model, How Openwork helps, job builder, workplace accessibility profile, claim, `/post`, pricing.
- Netlify Functions and the honest offline pattern.
- `docs/DESIGN_SYSTEM.md` rules 1–13.

### MODIFY
- **Matches**: add the filter row (Best match · Newest · Salary · Remote · Accessibility · All filters), greeting with count and basis line, "Not for me" on cards.
- **Job card**: summarize accessibility in one line, never list badges.
- **Job detail**: regroup "How this job works" into Schedule / Communication / Environment / Physical / Technology / Workplace; add "Request interview accommodation" CTA in Accessible hiring; concise Why this matches summary with "See full match".
- **Applications**: tabs All / Needs action / Applied / Interview / Offer / Closed; per-item next action; interview block.
- **Employer landing**: new promise and CTA order; Founding Employer section.
- **Employer overview**: work queue tiles (needs review, matched candidates, interviews, active, imported needing enrichment, accessibility to confirm, questions, sync status).
- **Employer jobs**: tabs Active / Imported / Needs information / Draft / Closed; completeness and sync columns.
- **Employer type**: split `verification` (company) from accessibility claim level.
- **Job type**: add `source`, `importedFrom`, `needsInfo`.
- Employer pages: move off Polaris `Page`/`Card` onto `.ow-pagehead` + `.ow-sheet` (restyle, not rebuild).

### REBUILD
- **Why this matches** as its own route `/jobs/:id/match` (drawer on desktop, page on phone) with Career / Work / Accessibility / Worth knowing / Application and the feedback loop.
- **Import review** (`/employer/jobs/import` result state): counts, ready vs needs information, Import all.
- **Enrich job** (`/employer/jobs/:id/enrich`): the 3-minute subset of the builder for imported jobs.
- **Interview preparation** (`/applications/:id/prepare`).
- **Connect ATS** (`/employer/connect`) as a designed integration state with providers, honest "coming" status.
- **AI job analysis** panel (`Improve candidate reach`) built on `findVaguePhrases` plus completeness, with an optional AI rewrite via the existing function.

### REMOVE
- `CandidateHome.tsx`, `AccommodationRequest.tsx`, `CompanyCard.tsx`, `JobAccessibilitySummary.tsx`, `JobRequirements.tsx`, `Stepper.tsx`, `WorkEnvironmentProfile.tsx`.
- Duplicate filter DOM (render rail or strip, not both).
- The `/discover` route once onboarding path B covers it (keep for now; it is linked from Support).

---

## 3. Design foundation decision (needs Hiram)

The directive names **IBM Carbon** as the structural and accessibility foundation, while also saying "do not throw away working code merely because the visual design is changing" and "Openwork owns the visual identity."

Facts checked today: `@carbon/react` 1.117.0, requires Dart Sass, supports React 18, TypeScript typings still incomplete (needs `skipLibCheck`, which we already have). Carbon ships IBM Plex and the 2x grid; our identity is Inter, slate and blue, settled on 2026-09-25 after a live comparison.

What a migration means here: Polaris is imported in 62 files; `product.css` re-tokens Polaris in ~2,000 lines; every option card, sheet, badge, listbox and popover override is written against Polaris class names. Replacing the foundation is a rewrite of the presentation layer of every screen, with regression risk on pages that are axe-clean today. Estimated 3 to 5 working days of agent time before parity, before any of the new product work.

What Carbon would add that Polaris does not: nothing functional for this product. Both are WCAG-tested component libraries with keyboard and focus behaviour built in. The directive's real requirements (typography scale, spacing rhythm, status never by colour alone, focus management, drawers, tabs, notifications, empty and loading states) are properties we enforce in `docs/DESIGN_SYSTEM.md` regardless of the library underneath.

**Recommendation:** keep Polaris as the accessibility foundation under the settled Openwork identity, adopt Carbon's principles where they are stronger (2x spacing grid, explicit status text + icon, drawer and tabs patterns), and spend the days on the twelve screens the directive names. If Hiram wants Carbon specifically, it is a separate phase after the product work, done screen by screen behind the same `.ow-*` class contract so pages can switch libraries without changing their markup.

Until that answer arrives, everything below is foundation-independent and proceeds.

---

## 4. Implementation order for this session

1. Why this matches page with Worth knowing, Application, Not for me feedback (stored as `CandidateFeedback`).
2. Matches filter row and card summary line.
3. Applications tabs per directive; interview object and preparation page.
4. Job type: `source`, `importedFrom`, `needsInfo`; employer verification split.
5. Employer landing per directive with Founding Employer; Connect ATS designed state.
6. Import review states and Enrich job flow.
7. Employer jobs tabs; overview as work queue; AI job analysis panel.
8. Remove dead code; restyle employer pages off Polaris `Page`.
9. Re-run axe, phone, tablet, keyboard on every touched screen; push after each numbered step.
