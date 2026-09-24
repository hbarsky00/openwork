# Openwork design system

Polaris underneath. Openwork on top. This document is the contract between the
two.

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
exception is `EmployerLogo`, whose colour is employer **data**, not a token.

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
| `Signal` / `ReasonIcon` | Polaris icons + `--ow-match-*` | Icon + text state marker; never colour alone |
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
- **Withdrawn / not selected:** neutral badge, no colour of blame.

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
- Colour pairs use Polaris text/surface tokens, which meet AA by construction.

## 9a. Display modes

`data-display` on `<html>` (set by the store): `simplified` collapses every
grid to one column, hides the split-view pane, and raises controls to 56px;
`largeText` moves every semantic type token one step up. Neither removes a
feature. Browser zoom, contrast and reduced-motion settings apply on top.

## 9a′. Filters

Filter options are chips, never checkbox lists. On desktop each pill opens a
`Popover` with `fluidContent`; uneven groups (the nine need categories) are
packed with CSS multicol (`.ow-packed`) so 24 options fit in four columns
without scrolling, and the popover's inline height cap is lifted for
`.ow-filter-pop`. Below 1024px the same pill opens the full-screen Filters
sheet (`Modal size="large"`) scrolled to that section — a popover is the
wrong container on a phone.

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
