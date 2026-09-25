# Openwork design system

Polaris underneath. Openwork on top. This document is the contract between the
two.

## 0. Candidate flow (the shape of the product)

Jobs first. The front door (`/`) is the job list with What/Where search on first
paint — no account, no questionnaire, no landing page. The marketing page lives
at `/about`.

- **Filters** are one row of plain Selects (Anywhere / Job type / Pay / Date
  posted) plus one typeahead for accessibility needs. No quick-pick chips, no
  popovers, no filter modal.
- **Job card** is the link. One icon action (save). Title · company · pay ·
  arrangement · type · at most three ✓ facts · posted. Desktop ≥1024 opens
  the job in the right pane; below that it navigates.
- **Job page** reads top-down: title/pay → **Apply now** → what you'd do →
  what you need → how the job works (dimensions + physical, as tiles) →
  employer-confirmed accessibility with dates → how hiring works → employer.
  No jump nav, no "why this could work" for visitors.
- **Apply** is one page: name, email, phone (optional), résumé upload or the
  saved one, the employer's ≤3 screening questions, optional interview-need
  note, Submit. Visitors get an account created from the same fields.
  Employers see exactly this page's content and nothing else.
- **Sign up** creates the account and goes to jobs. The needs questionnaire
  is optional, offered from Profile.
- **Nav**: visitor Jobs · How it works · For employers · Sign in; candidate
  Jobs · Saved · Applications · Profile. Display settings is icon-only.
  About, Discover, Support live in the footer.

## 1. Foundation: Shopify Polaris 13.9.5

- Installed as `@shopify/polaris` + `@shopify/polaris-icons`. **Peer is React 18.**
- Loaded once in `src/main.tsx`: `AppProvider` with `en.json` and a
  `linkComponent` adapter (`PolarisLink`) so every Polaris `url` prop routes
  through react-router.
- Global stylesheet: `@shopify/polaris/build/esm/styles.css`, then
  `src/styles/product.css`.
- Component inventory was read from the package's `.d.ts` files. Legacy
  components (`LegacyCard`, `LegacyStack`, `LegacyTabs`, `LegacyFilters`) are
  not used anywhere.

## 00. Reference (2026-09-25 reboot)

The product now follows `OPENWORK_UXPILOT_MASTER_FULL_FLOW.md` and the twelve
UX Pilot screens (kept locally in `public/_ref/`, not committed). Polaris stays
as the component foundation; the reference supplies the look and the IA.

- **Look:** Inter; page `#f8fafc`; surfaces white with `#e2e8f0` hairlines,
  12–16px radius, faint shadow; ink `#0f172a`, meta `#475569`; primary buttons
  ink, links/active nav/focus `#2563eb`; tint panels `#eff6ff`; success
  `#10b981`, warning `#f59e0b`. Pills are 6px-radius slate-100 tags.
- **IA:** Matches is home. Candidate nav Matches · Search jobs · Applications ·
  Saved · Profile; bottom nav on phone. Employer nav Overview · Jobs ·
  Candidates · Interviews · Workplace accessibility · Company · Settings.
- **Cards:** logo · title · company • location · pills · match label
  (Strong / Good / Worth reviewing) · Career / Work / Accessibility lines ·
  Prepare application / View job / Save.
- **Job detail:** header sheet → Accessibility verification (source + date on
  every item) → For you → What you'll actually do → Skills (Required /
  Preferred) → How this job works → Hiring process; sidebar Prepare
  application, Your match bars, About the company.
- **Prepare application:** readiness panel → About you → Résumé → employer
  questions (required) → interview needs → What the employer will see → Submit.
- **Onboarding:** six steps with STEP X OF 6 progress and option cards; ends
  on "Your matches are ready."
- **Applications:** tabs · list · sticky detail panel (Status timeline / What
  they received / Job details).

## 0a. Apply control (one button, learned once)

`QuickApplyButton` is the only apply control. Signed in and the job has no
employer questions → **Quick apply**, sends in one tap from the card, the
pane or the sidebar. Otherwise **Apply now** → the apply page. Already
applied → **Applied · view**. Cards for no-question jobs carry a "Quick
apply" pill for everyone. `lib/apply.ts` builds the application in one place
for both paths.

## 0b. Fit panel

Signed-in candidates with stated needs see a tinted `FitPanel` on every card:
"Matches 6 of 9 things you need", then two matching lines and the one that
differs (the cross is the useful line). Green tint for strong/good, yellow for
mixed, grey otherwise. The job page shows the fuller "For you" block.

## 0c. Trust signals and alerts

Every card, pane and sidebar shows `posted · N applicants · replies within X`.
Applicants = the job's seed baseline plus live applications; reply time is
`Employer.typicalResponse`. The jobs page has one "Alert me about jobs like
this" toggle for the current search (visitors are sent to sign in); alerts
are listed and switched off on the Applications page.

## 1c. Page system (three templates, nothing else)

1. **Rail + list + pane** (`.ow-jobs` → `.ow-rail`, `.ow-split`): jobs.
   Filters live in a sticky 240px left rail with visible labels (Where, Job
   type, Pay, Date posted, Accessibility needs, Sort). To the right: search
   bar, count, list, and the job pane from 1024px. Tablet keeps the rail and
   list; phone turns the rail into one swipeable row. Filters are never
   stacked above the jobs and never behind a button.
2. **Article + sidebar** (`.ow-cols`): job, company, application. One white
   `.ow-sheet` for the reading column and a sticky 360px `.ow-aside` holding
   the action card (Apply / Save) and the employer card. On phone the action
   card comes first, then the article, then the employer card.
3. **Sheet** (`.ow-container--narrow` + `.ow-sheet`): every form and list.
   One centered white sheet, title row above it.

Text never sits on the paper except a page's title row and back link.
Container is 1440px; narrow is 880px; the jobs page is fluid (`.ow-container--fluid`, gutters only).

## 1b. Identity layer (the face on top of Polaris)

Polaris supplies components, spacing, motion and semantics. It is Shopify's
admin system, so used raw it looks like a back-office form. Openwork adds an
identity layer in `product.css` `:root`, all through Polaris semantic tokens:

- **Type:** Atkinson Hyperlegible Next (Braille Institute's low-vision face),
  loaded from Google Fonts, system-ui fallback. Headings 700–800, tight
  tracking.
- **Ground:** white, like Indeed and LinkedIn. Grey `#f7f7f7` only as a
  backdrop for subdued boxes. Hairlines `#e6e6e6` / `#d4d4d4`, ink `#1a1a1a`,
  meta grey `#5e5e5e`. Benchmarked 2026-09-25 against Indeed, LinkedIn Jobs
  and AIApply: white, dense, soft surfaces, metadata as small grey pills.
- **Density:** body 16, meta 14, card title 18, pane title 24, page title 30.
  Controls 44px. One step larger than the benchmarks, never two.
- **Pills:** pay, arrangement, type and status are rounded `Badge`s on
  `#f3f3f3`; success is a soft green tint, info is the accent tint.
- **Search:** one joined radius-full bar with the button inside.
- **One accent:** deep violet `#4c2e8a` (hover `#3c2370`, tint `#efeaf7`).
  Mapped to every brand *and* emphasis token, so primary buttons, links,
  focus rings, active nav and the selected job card are one colour. Not
  stock SaaS blue.
- **Forms:** no red asterisks (`RequiredIndicator` hidden). Required is the
  default; optional fields say "(optional)" in the label. No helper captions
  unless they change what you type.
- **Sheets, not card stacks:** one white `.ow-sheet` holds a whole form.
  Sections are plain headings with generous gaps, never numbered steps.
- **Employer questions are casual** ("Why do you want to work at Corvid?").
  Skills belong on the résumé.

## 1a. Legibility layer (why the app does not look like Shopify admin)

Polaris ships at admin density: 13px body, 12px small text, 32px buttons
(28px above 768px), 18px checkboxes. That is wrong for a product whose users
need clarity most. `product.css` overrides the **semantic** Polaris tokens at
`:root` — not the components — so every `Text`, `Button`, `TextField`,
`Select`, `Checkbox`, `Badge` and `Banner` scales together:

| Token | Polaris default | Openwork |
|---|---|---|
| `--p-text-body-md` | 13 / 20 | **18 / 28** |
| `--p-text-body-sm` | 12 / 16 | 16 / 24 |
| `--p-text-body-lg` | 14 / 20 | 20 / 32 |
| `--p-text-heading-md` | 14 | 20 |
| `--p-text-heading-lg` | 20 | 24 |
| `--p-text-heading-xl` | 24 | 30 |
| `--p-text-heading-2xl` | 30 | 36 |
| Buttons / inputs / selects | 28–32px | **48px** (`--ow-control-height`) |
| Slim buttons | 28px | 40px |
| Checkbox / radio | 18px | 24px (`--ow-choice-size`) |
| Card padding | 16px | 20px, 24px ≥768 |
| Button bevel shadows | on | off (flat) |

Two selector-level overrides were unavoidable: `.Polaris-Button.Polaris-Button--size*`
(Polaris re-shrinks buttons inside a ≥48em media query that outranks a
single-class rule) and `.Polaris-Choice__Control` (no size token exists).
Both are commented in `product.css`.

## 2. Semantic product tokens

Defined in `src/styles/product.css`. Every value is a Polaris token.

| Token | Value | Use |
|---|---|---|
| `--ow-match-aligned-{fg,bg,border}` | `--p-color-*-success` | "Aligned" state |
| `--ow-match-review-*` | `--p-color-*-caution` | "Worth reviewing" |
| `--ow-match-different-*` | `--p-color-*-warning` | "Different from your preference" |
| `--ow-match-unknown-*` | `--p-color-*-secondary` | "Not provided" / "Not important" |
| `--ow-container` | 1280px | Marketplace width (Polaris `Page` caps at 998px; split view needs more) |
| `--ow-container-narrow` | 960px | Single-column reading and sign-up pages. Body ground is `--p-color-bg-surface-secondary` so a narrow column never floats on white |
| `--ow-results-width` | 420px | Left column of the split view |
| `--ow-header-height` | 60px | Sticky header, used for sticky offsets |

Rule: no raw hex, px spacing, radius or shadow anywhere in a component. The one
exception is `EmployerLogo`, whose color is employer **data**, not a token.

## 3. Typography

`Text` only, with Polaris variants. Heading scale as used:

- Page title: `heading2xl` (public) · `Page title` (employer/admin)
- Section: `headingLg`
- Subsection / card title: `headingMd`
- Row label: `headingSm`
- Body: `bodyMd` default, `bodyLg` for lead paragraphs, `bodySm` for metadata
- Landing `h1` is the one raw heading, styled with `--p-font-size-900/1000`
  because Polaris has no marketing display size.

## 4. Spacing and layout

- Vertical rhythm: `BlockStack gap="400"` inside cards, `"500"` between cards,
  `"600"`/`"800"` between page sections.
- Horizontal: `InlineStack` with `gap="200"`/`"300"`, `wrap` on anything that
  holds badges or metadata.
- Grids: `InlineGrid columns={{ xs: 1, lg: ['twoThirds','oneThird'] }}` for the
  standard content + sidebar page.
- Public pages use `.ow-container`; employer and admin pages use Polaris `Page`
  + `Layout`, because back-office tooling is where the admin scaffold belongs.

## 5. Navigation

Horizontal header composed from primitives (`.ow-header`), not
`Frame`/`Navigation`. A job marketplace reads as a website, not an admin; every
benchmark uses a top bar. Below `md` the nav collapses into a `Popover` +
`ActionList`. Active state is `aria-current="page"` from react-router
`NavLink`, styled with `--p-color-bg-surface-selected`.

Candidate nav: Home · Jobs · Saved · Applications · Profile.
Employer nav: Overview · Jobs · Candidates · Company.

## 5a. Header overflow rule

The inline nav is never clipped. It collapses to the menu at ≤1151px
(standard) and ≤1599px (Simplified / Large text); the account name shows only
at ≥1600px; and if a longer nav still cannot fit, the header wraps to a second
row. Measured at 1440px in both modes.

## 6. Forms

**Tap-to-select chips replace radio stacks and selects** wherever the options
fit on one or two lines (`ChoiceChips`: Polaris `Button pressed` in a labelled
`role="group"`, 40–48px targets, `aria-pressed`). Long option lists still use
`ChoiceList`. Multi-question forms are either one question per screen
(`Stepper`) or a two-column grid of compact question blocks — never a single
column of full-width cards. Measured: How I work best 8,581→3,650px; access
needs 5,245→2,741px; employer accessibility 5,914→2,830px.

`Form`, `FormLayout`, `TextField`, `Select`, `ChoiceList`, `Checkbox`. Every
field has a visible label; `labelHidden` is used only when an adjacent heading
is the label. Errors are Polaris inline errors next to the field, in plain
words that say what to do. Required fields use `requiredIndicator`. Long forms
are split into steps with `.ow-steps` progress and autosave to the store.

## 7. Product components

| Component | Built from | Purpose |
|---|---|---|
| `JobCard` | `article` + `BlockStack`/`InlineStack`/`Badge`/`Button` | Scannable listing: title, employer, pay, arrangement, type, 2–4 signals, save |
| `Signal` / `ReasonIcon` | Polaris icons + `--ow-match-*` | Icon + text state marker; never color alone |
| `MatchSummaryBadge` / `MatchStateBadge` | `Badge` | "Strong alignment" etc. Tone maps to state |
| `WhyThisMatches` | `Card` + `ul.ow-reason` | Grouped, sentence-level explanations |
| `WorkEnvironmentProfile` | `Card` + `dl.ow-env` | All 11 dimensions, gaps shown as gaps |
| `HiringProcess` | `Card` + `ol.ow-timeline` | Steps, durations, ways to demonstrate skills, adjustment route |
| `PreferenceControl` | `Box` + `ChoiceList` + `Select` ×2 | Answer + importance + visibility |
| `ApplicationStatusTimeline` | `ol.ow-timeline` | Real events only |
| `CompletenessMeter` | `ProgressBar` + `Text` | "8 of 11" with a reason |
| `VerificationBadge` | `Badge` + `Tooltip` | Three earned levels |
| `CompanyCard`, `EmployerLogo` | primitives | Company listing |
| `JobDetailContent` | composition of the above | One template for public page, split pane and employer preview |
| `EvidenceLine` / `StateSymbol` | `li.ow-evidence__row` + `.ow-symbol` | One accessibility fact: ✓ △ ✗ ? symbol (role="img" with label), status text, source, date, employer note |
| `JobAccessibilitySummary` | `Card` + `EvidenceLine` | Every known and not-known fact about a job's accessibility, grouped by need category; "Ask employer" on gaps |
| `WhyThisCouldWork` | `Card` + `ul.ow-reason` | Need-by-need comparison with sources; unknowns carry an Ask button |
| `AskEmployerButton` | `Button` + `Modal` | Turns a "?" into a question the employer answers on their dashboard |
| `PhysicalRequirements` / `CommunicationRequirements` / `TechnologyAccessibility` | `Card` + `dl.ow-env` | Employer-stated requirements; gaps shown as gaps |
| `AccessNeedsForm` | `Collapsible` + `Checkbox` + `Select` ×2 | Nine need categories, any combination, importance + visibility per need |
| `StrengthsPicker` | `ChoiceList` + `Tag` | Plain strengths vocabulary with custom entries |
| `AccommodationRequest` | `Card` + `ChoiceList` + `TextField` | Practical interview-accommodation selections from what the employer offers |
| `DisplaySettings` | `Popover` + `ChoiceList` | Standard / Simplified / Large text — same features in every mode |
| `ChoiceChips` | `Button pressed` in `role="group"` | Tap-to-select, single or multi; the default control for ≤8 options |
| `EvidencePicker` | `ChoiceChips` + `TextField` | One employer accessibility question: Yes / No / Contact us / Not sure + optional note |
| `Stepper` | `.ow-steps` + `Button` | One question per screen; focus moves to the heading; Back / Skip / Continue / Do this later |

## 8. States

Implemented and visible in the prototype:

- **Visitor** on any job: info banner inviting sign-in; card signals fall back
  to the job's own facts.
- **Candidate without preferences:** `WhyThisMatches` shows a single call to
  action instead of an empty list.
- **Employer gap:** `null` renders "Not provided by this employer" in a dashed
  `--ow-match-unknown` tile, and in the explanation list under its own heading.
- **Closed / draft job:** warning banner, Apply hidden, similar jobs shown.
- **Already applied:** card badge + "View your application" replaces Apply.
- **Empty search:** `EmptySearchResult` + "Clear all filters".
- **Empty saved / applications:** `EmptyState` with a single next action.
- **Selected** result in split view: `.ow-jobcard--selected`.
- **Withdrawn / not selected:** neutral badge, no color of blame.

## 9. Accessibility

- Skip link, `main` landmark, `nav aria-label="Primary"`, `role="search"`.
- Every icon carries `aria-hidden`; state is always also text
  (`Signal` prepends a visually-hidden "Aligned:" etc.).
- Step progress lists use `aria-current="step"`; timelines use `aria-current`.
- `ProgressBar` gets `ariaLabelledBy`.
- `prefers-reduced-motion` collapses all transitions globally.
- Focus rings come from Polaris tokens; `.ow-jobcard:focus-visible` adds one for
  the card link.
- Document titles are set per page (`useTitle`).
- Color pairs use Polaris text/surface tokens, which meet AA by construction.

## 9a. Display modes

`data-display` on `<html>` (set by the store): `simplified` collapses every
grid to one column, hides the split-view pane, and raises controls to 56px;
`largeText` moves every semantic type token one step up. Neither removes a
feature. Browser zoom, contrast and reduced-motion settings apply on top.

## 9a′. Filters

Facets are not a wall of chips and never open a popover over the results.
`NeedsSearch` is one typeahead (Polaris `Autocomplete`, multi-select, grouped
by need category and hiring group) over every need and hiring option, each
with a live count of jobs where the employer has **confirmed** it. Eight
quick picks appear until something is chosen; chosen items are removable
`Tag`s. Where / job type / experience / pay / posted are inline `Select`s in
one row (two per row on phone). The URL stays the single source of truth.

## 9b. Action bars

Every wizard (`Stepper`, job builder, apply, workplace accessibility) ends in
`.ow-actionbar`. On desktop it is static with top padding. Below 1024px it is
`position: sticky; bottom: 0` with a surface background, so Back / Continue /
Submit are always one tap away and never sit on the footer. Layout on phone:
Back + full-width primary on one row; Skip and "Do this later" as plain
links on a second row. `.ow-main` carries bottom padding so no page's last
element can touch the footer.

## 10. Responsive

- `/jobs` is a split view at ≥1024px; below that, selecting a result navigates
  to the full job page instead of a hidden pane.
- Phone (375) and tablet (768) are audited on every pass for: horizontal
  overflow, pointer targets <40px (standalone links become slim `Button`s;
  inline sentence links are exempt), sticky action bar in view, axe.
- Header at phone: brand + icon-only Display + menu, one row.
- Filters are pills + popovers on desktop and the same "All filters" `Modal`
  everywhere.
- Header nav collapses to a menu below 768px.
- Grids collapse to one column at `xs`; two-column `dl.ow-env` collapses at
  640px.
