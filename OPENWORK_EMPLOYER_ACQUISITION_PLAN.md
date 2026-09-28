# Openwork employer acquisition and job supply

Date: 2026-09-27. Repository `hbarsky00/openwork`, live at https://open-work.tech (every push to `main` deploys).

This plan covers the 49-point employer directive. Phase 1 (audit) is below. Some of the directive shipped on 2026-09-26; this document says what exists, what changes, and what is new, then implements the rest.

---

## Phase 1 — Audit of employer functionality

### 1.1 Employer routes today

| Route | What it does | Verdict |
|---|---|---|
| `/for-employers` | Landing. Import / Connect ATS / Post a job, five-step strip, Founding Employer block | **MODIFY** — becomes `/employers`, gains the product demo and the three-ways section |
| `/pricing` | Free / Growth / Enterprise | **MODIFY** — de-emphasised; launch is free, founding programme leads |
| `/post` | Job builder for visitors; account created at the end | KEEP |
| `/import` + `/employer/jobs/import` | Careers-page import via `/api/import-jobs` | **MODIFY** — batch, dedup, origin tracking, review screen |
| `/connect` + `/employer/connect` | ATS request, recorded on the employer | **MODIFY** — per-provider truthful states |
| `/claim` | Claim a listed company by work-email domain | **MODIFY** — accepts a job id, feeds the lead pipeline |
| `/employers/signup` | Organization name, work email, password; lands imported or posted drafts | **MODIFY** — adds contact name, then the "bring your jobs" chooser |
| `/employer` | Work-queue overview (8 tiles, questions, activity, drafts, verification, ATS) | **MODIFY** — explicit Needs attention block |
| `/employer/jobs` | Tabs Active / Imported / Needs information / Draft / Closed | **MODIFY** — matches column, sync state |
| `/employer/jobs/new`, `/:id/edit` | 7-step builder | KEEP |
| `/employer/jobs/:id/enrich` | Three-minute enrichment + clarity review | **MODIFY** — structured rewrite of ambiguous phrases |
| `/employer/jobs/:id/preview` | Candidate view | KEEP |
| `/employer/candidates`, `/:id` | Applicants, detail limited to shared data | KEEP |
| `/employer/interviews` | Interview and work-sample stage | KEEP |
| `/employer/accessibility` | Workplace Accessibility Profile, 15 questions by area | KEEP |
| `/employer/company` | Company profile | KEEP |
| `/employer/settings` | Contact, reply time, accommodation route | **MODIFY** — Integrations entry |
| `/companies/:id` | Public company page with evidence and open jobs | **MODIFY** — claim entry points |
| `/admin` | Verification level per employer, reported jobs | **MODIFY** — employer leads and pipeline |

### 1.2 Data model today

`Job` carries `source?: 'manual' | 'imported' | 'ats'` and `importedFrom?: string`. That is not enough to sync: no external id, no timestamps, no source status, no error. **REBUILD as `Job.origin`.**

`Employer` carries `claimedBy`, `companyVerified`, `plan`, `ats?: {provider, status, requestedOn}`, `verification` (accessibility claim level), `accessibility` (evidence map), `workplace`, `accessibilityContact`. Company verification is already separate from accessibility claims (directive §26 satisfied).

`CandidateProfile` has no discovery consent. Employers currently see a count of potential matches on the overview and no list. **ADD `discoverable`,** default off, candidate-controlled on the sharing page.

No lead, notification or claim entities. Notifications are **derived** from real state rather than stored, so they can never drift or be fabricated.

### 1.3 Keep / Modify / Rebuild / Remove

**KEEP** — match engine (`match.ts`, `access.ts`, `dimensions.ts`), apply engine, job builder, Workplace Accessibility Profile, evidence model, candidate-detail privacy limits, `/post`, preview, interviews, seeds.

**MODIFY** — employer landing, import, claim, signup, dashboard, jobs list, enrich, settings, admin, company page.

**REBUILD** — job origin and sync model; import as a batch with dedup and a review screen; ATS provider states; employer landing product demo.

**NEW** — `/employers` canonical landing, Founding Employer application and lead pipeline, first-run "bring your jobs" chooser, per-job candidate matches with consent, derived employer notifications, admin employer onboarding, claim-this-job entry.

**REMOVE** — nothing. No dead employer code remains after yesterday's sweep.

### 1.4 Honesty constraints applied (directive §43, §44)

- Import fetches only the URL the employer supplies, declares itself in the user agent, and refuses when `robots.txt` disallows the path. No bypassing, no crawling beyond the page given.
- No ATS provider is marked available, because none are built. Every provider is Coming soon or Request integration, and requesting records interest only.
- All counts shown to employers are computed from real state. With a small seeded candidate pool the numbers are small, and the copy says so rather than inflating them.
- Verification is never granted by typing a company name. Domain match or trust-team review only.

---

## Phase 2–9 — Implementation order (as directed)

1. Employer landing `/employers` with the product demo and three ways to add jobs.
2. Import My Jobs: batch, dedup by external id, origin tracking, robots check.
3. Founding Employer programme and application.
4. Employer sign-up with contact name, then the bring-your-jobs chooser.
5. Import review screen: imported / ready / needs information, publish ready.
6. Claim company and claim job, both feeding the lead pipeline.
7. Job enrichment with structured rewriting of ambiguous requirements.
8. Workplace Accessibility Profile reused across jobs (already company-level).
9. Employer dashboard with Needs attention and derived notifications.
10. Per-job candidate matches, gated by candidate discovery consent.
11. ATS architecture with truthful per-provider states.
12. Admin employer onboarding: leads, pipeline stages, notes, conversion.

Each step is verified in the browser at 1440 and 375, axe-clean, then pushed.

---

## Implementation log

- **2026-09-27** — Steps 1–12 implemented; see the commits on `main`. Details appended below as they land.
