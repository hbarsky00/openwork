# Openwork — Accessibility Platform Rebuild Plan

**Date:** 2026-09-24
**Directive:** Stop the job-board direction. Rebuild as an accessibility-first
employment platform: capabilities + access needs + work preferences, matched
against what a job actually requires and what a workplace actually supports.

---

## 1. Current-product audit

What exists (built earlier today, 34 source files, 15 jobs, 8 employers):

| Area | Finding |
|---|---|
| Data model | 11 workplace dimensions in one table (`dimensions.ts`) drive candidate form, employer form and matching. Solid seam. **Too narrow**: no physical, technology, hearing, vision or mobility information anywhere. |
| Matching | Deterministic, explained, never hides. Correct philosophy. **Missing**: evidence source, "unknown" as an action (Ask employer), skills/strengths, access needs. |
| Onboarding | Starts with goal, then location/roles/skills. **Résumé-shaped**; no strengths, no "help me discover", no access needs. |
| Landing | Hero is right, but the first product moment on `/jobs` is `[title][location][Search]` — Indeed. |
| Job card | Pay/arrangement/type + 2–4 aligned signals. **Only shows alignment**, never unknowns; no ✓/△/? vocabulary. |
| Job detail | Good hierarchy, but leads with description prose; no tasks, physical, communication, technology or physical-accessibility sections. |
| Employer job builder | Two-part builder with vague-language check. **Missing** tasks, physical, communication, technology, accessibility evidence, support. |
| Employer profile | Communication/onboarding/adjustment route. **No accessibility profile**, no evidence, no accessibility contact. |
| Privacy | Three states per answer + sharing review. Correct; extend to access needs. |
| Trust | Three verification levels. **No per-fact evidence** (who said it, when). |
| Legibility | Fixed today: 18px body, 48px controls. Keep. |

### Keep / Modify / Rebuild / Remove

**KEEP** — routing, store + persistence, auth pattern, saved jobs, application
state machine, employer accounts, `dimensions.ts` (as one of several input
sources), `PolarisLink`, legibility layer, split-view mechanics, admin
moderation.

**MODIFY** — `Jobs` (grouped accessibility filters, ✓/△/? on cards, "Jobs
that work for you"), `CandidateHome` (next-action page; add questions +
support), `Applications`, `Company` (add accessibility profile), `SignIn`
(new personas), `CandidateDetail` (shared access needs + accommodation
request), `Admin` (evidence oversight).

**REBUILD** — matching (`match.ts`), onboarding, landing, job card, job
detail, profile → **Work Accessibility Passport**, access-needs form, apply
(accommodation request), employer job builder (9 sections), employer
accessibility profile, dashboard (candidate questions).

**REMOVE** — the `[title][location][Search]` landing pattern; numeric
`rankScore` as anything but internal ordering; the assumption that a candidate
has experience/résumé; any dimension-only view of "how the job works".

Nothing here asked for a diagnosis, so there is no diagnosis-first flow to
remove — but the *taxonomy* was implicitly autism-shaped. That is what changes.

---

## 2. Research summary (live, 2026-09-24)

| Product | Solves well | Does poorly / gap |
|---|---|---|
| **Inclusively** (verified) | "Success Enablers": candidates select functional accommodations, **not diagnoses**; "select only what you would request from an employer"; enablers travel with an "Inclusively Résumé" PDF. | Enablers are candidate-side only. No structured evidence about whether a *job's* software, entrance or interview is accessible. Matching is opaque. |
| **AbilityJOBS** (verified) | 100% intentional employers, no aggregated jobs. Large scale (134k seekers). | **Encourages listing disability information on the profile and résumé.** Job listings carry no accessibility data. Diagnosis-forward. |
| **Mentra** (verified) | Cognitive strengths + workplace preferences on profile; "beyond a CV". | Neurodivergence-only. Disclosure controls not described publicly. |
| **Hire Autism** (verified) | Free human Navigators; alerts; resources. | "Autism-friendly employer" is **undefined** on the site — the badge anti-pattern. Listing = title/company/type/location. |
| **Disability Solutions** | — | `disabilitysolutionsatwork.org` now serves unrelated health content. Not assessable. |
| **SourceAbled** | Two-sided (employers / seekers / talent sources). | Only navigation retrievable; model not verifiable. |
| **Wellfound / Indeed / LinkedIn** (verified earlier) | Pay on card, save/apply from list, preferences as durable state, date/type/company filters. | Nothing about how the job is performed, what it requires physically, what technology it uses, or whether hiring is accessible. |
| **WCAG 2.2** (verified) | New AA: 2.4.11 Focus Not Obscured, 2.5.7 Dragging, **2.5.8 Target Size ≥ 24×24**, 3.3.8 Accessible Auth. New A: **3.2.6 Consistent Help**, **3.3.7 Redundant Entry**. | 3.3.7 maps directly to "never re-ask what the profile holds"; 3.2.6 to a Support link in the same place on every page. |

**What our product must do differently:** put access information on the
*job and workplace*, not only the person; show *who said it and when*; treat
unknown as a first-class state with an action; never require disclosure; work
for someone with no résumé; and make all of that visible in the product itself,
not the marketing.

---

## 3. Revised product architecture

Three sides, one shared vocabulary:

```
CANDIDATE                      JOB                          EMPLOYER / WORKPLACE
strengths                      tasks (typical day)          physical accessibility
skills                         essential functions          digital accessibility
experience (optional)          physical requirements        communication accessibility
how I work best (11 dims)      communication requirements   hiring accessibility
access needs (9 categories)    technology + a11y evidence   flexible work
hiring preferences             environment (11 dims)        job coaching / support
support preferences            schedule / location          accommodation process
sharing controls               job-scope accessibility      accessibility contact
                               hiring steps + options       verification + evidence
```

`src/lib/access.ts` is the new single source: **access features**, each with
a candidate label, a need sentence, a provided sentence, a scope
(workplace / job / hiring) and a **resolver** saying where the employer's side
comes from — an evidence map, a dimension value, a hiring option, a physical
requirement, a communication requirement or technology evidence. Candidate UI,
employer UI, filters and matching all read this table.

---

## 4. Revised candidate journey

```
Landing (no search bar) → "What do you need to do your best work?" chips
  → Find the right work (public, filtered) ─┐
  → Create account                          ├→ Onboarding
                                            ┘
Onboarding:  1 What do you want to do?  (titles / interests / "help me discover" / first job)
             2 What are you good at?    (strengths vocabulary + custom)
             3 How do you work best?    (5 dimensions; 6 more later)
             4 What would make work more accessible?  (9 categories, all optional)
             5 Who can see this?        (private / matching / OK to share)
→ Jobs that work for you  → Why this could work (✓ △ ? with sources)
→ Ask employer (on any ?) → Save → Apply → Request an interview accommodation
→ What this employer will see → Submit → Tracker
```

**Help me discover** (Path B): strengths + preferences + access needs →
kinds of work (job families) → jobs. No diagnosis input exists anywhere.

**First-job mode**: no résumé required; profile from strengths, school,
volunteering, projects, support. Applications send the passport.

## 5. Revised employer journey

```
Account → Company → WORKPLACE ACCESSIBILITY PROFILE (evidence per feature, contact)
→ Create job: 1 Job  2 Typical day & essential functions  3 Physical requirements
              4 Communication requirements  5 Technology (+ accessibility)
              6 How it actually works (11 dims)  7 Accessibility & accommodations
              8 Hiring process & accessible options  9 Support → Preview → Publish
→ Candidate questions (from "Ask employer") → Applicants → Advance
```

## 6. My Work Accessibility Passport

Not a medical record. Sections: **Strengths · Skills · Experience & learning
(optional) · How I work best · Access needs (by category) · Hiring preferences ·
Support · Sharing controls.** Each access need carries importance
(Required / Preferred / Doesn't matter) and visibility (Private / Used for
matching / OK to share). The passport is what an application sends — after the
sharing review.

## 7. Access-needs taxonomy

Nine **need** categories (not diagnoses): Vision · Hearing · Mobility ·
Dexterity & motor · Communication · Cognitive & focus · Color & visual
presentation · Schedule & energy · Support. ~55 features. Every feature is
usable in any combination. Wording is always "I need captions", never "I am
Deaf". Full table: `src/lib/access.ts`.

## 8. Workplace accessibility model

`Evidence = { status: confirmed | notAvailable | contact, source: employer |
candidateConfirmed | platformVerified, confirmedOn, note? }`. Absent = **Not
provided**. Workplace-scope features live on the employer; job-scope on the
job; job overrides employer. Technology is a list of named tools each with its
own accessibility evidence (screen reader tested, keyboard accessible,
captions, magnification).

## 9. Matching model

Per candidate need → resolver → one of:

| State | Symbol | When | Action |
|---|---|---|---|
| Confirmed | ✓ | employer side satisfies need | — |
| Worth reviewing | △ | one step away, or `contact` status | — |
| Different from your need | ✗ | `notAvailable`, or ≥2 steps / required | — |
| Needs confirmation | ? | employer side absent | **Ask employer** |
| Not important to you | – | importance = doesn't matter | — |

Every reason carries a sentence, the **source** and the **date**. Skills and
strengths overlap are reported separately as counts + names. A job is never
hidden. Ranking is internal ordering only and never displayed.

## 10. Privacy model

Collect the need, not the condition. Defaults: every need = *Used for
matching*. Employers see nothing until the candidate ticks it on the sharing
review of a specific application. Accommodation requests go to the employer's
named accessibility contact and require no reason. No diagnosis field exists.

## 11. Employer verification model

Per fact: *Employer reported* (default) → *Candidate confirmed* (post-interview
structured feedback, phase 2, moderated) → *Platform verified*. Per employer:
Listed → Practices completed → Verified practices. "Report incorrect
information" on every job detail creates an admin report. No "Disability
friendly ✓" badge anywhere.

## 12. Information architecture

Candidate: **Home · Find work · Saved · Applications · My passport · Support**
Employer: **Overview · Jobs · Candidates · Workplace accessibility · Company**
Admin: Moderation.

"Support" is in the same place on every page (WCAG 3.2.6).

## 13. Data-model changes

`CandidateProfile` + `strengths`, `accessNeeds`, `firstJob`, `learning[]`,
`volunteering[]`. `Job` + `tasks`, `essentialFunctions` (renamed), `physical`,
`communication`, `technology[]`, `accessibility`, `family`, `strengthsUsed`.
`Employer` + `accessibility`, `accessibilityContact`, `digitalAccessibilityNote`.
New: `Question` (candidate → employer, with answer). `AppState` + `displayMode`,
`questions`. `HIRING_PRACTICES` + captions, interpreter, accessible location,
video, phone, text, extra time.

## 14. Polaris component strategy

Unchanged foundation. New product components: `AccessEvidence`,
`EvidenceSource`, `JobAccessibilitySummary`, `WhyThisCouldWork`,
`PhysicalRequirements`, `CommunicationRequirements`, `TechnologyAccessibility`,
`AccommodationRequest`, `AskEmployer`, `StrengthsPicker`, `AccessNeedsForm`,
`Passport`, `DisplaySettings`. Audit note: Polaris `Tooltip` is hover/focus
only — evidence sources are therefore rendered as visible text, not tooltips.

## 15. Assistive-technology strategy

Semantic landmarks; one `h1` per page; status always icon **+ text**; live
region for result counts; `aria-current` on steps; modal focus trap (Polaris);
no drag, no hover-only; 48px controls; visible focus; per-fact sources as text.
Tested with axe (WCAG 2.2 AA + best-practice) and keyboard walkthrough.

## 16. Simplified-mode strategy

Display settings in the header: **Standard · Simplified · Large text**.
Simplified = one column, sidebars collapse below content, larger controls,
shorter helper copy hidden behind "More". Same functionality. Respects
`prefers-reduced-motion` and `prefers-contrast` first.

## 17. Mobile strategy

Unchanged: results list → full-page detail below 1024px; filters in a modal;
48px controls; one column.

## 18. Migration plan

1. `access.ts` taxonomy + `types.ts` (this document's §7, §13)
2. `match.ts` rebuild on resolvers + evidence
3. Seed data: 15 jobs get tasks/physical/communication/technology/accessibility; 8 employers get accessibility profiles; 5 scenario personas
4. Store: display mode, questions
5. Components: evidence, summary, why-this-could-work, requirements, accommodation request, ask employer, strengths, access-needs form, display settings
6. Pages: landing, onboarding, discover, passport, access needs, jobs, job detail, apply, home, support; employer builder, accessibility profile, dashboard, candidate detail
7. Scenario tests 1–7, keyboard, axe
