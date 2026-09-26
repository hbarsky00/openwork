# Openwork design system

Polaris 13 underneath, Openwork on top. The look is the **UX Pilot export** (settled 2026-09-25): Inter, slate ink, near-black primary buttons, blue only for links, focus and the active nav item. This file is the contract. If a screen breaks a rule here, the screen is wrong. Older reasoning lives in `docs/archive/`.

## 1. Rules that override everything

1. **First field above the fold.** On any form or wizard step, the first input starts within 320px of the top of the viewport at 1440×900 (header included). Header of a step = one 13px step line, a 4px progress bar, a 28px left-aligned title, one line of 14px help. No banners above the first field.
2. **Nothing hidden, nothing empty.** No collapsed content, no popovers or modals for filters, no section rendered when it has no items. Secondary *actions* may live in an overflow menu; *content* may not.
3. **No chip walls.** Picked items render as rows with one remove control. Filters are Selects (desktop rail ≥1024, compact strip under 1024). Pills are for status only: verification, Applied, Quick apply, Draft/Published.
4. **One primary per screen.** Everything else is secondary, plain, or in an overflow.
5. **Six text sizes**: 28 / 20 / 18 / 16 / 14 / 13. One display size for the landing headline (`--ow-display-size`). Nothing else.
6. **Controls are 44px** tall (inputs, selects, buttons, nav links, list rows). Slim buttons inside cards may be 40px. Nothing interactive under 24px.
7. **Prose measure 72ch.** Paragraphs never run wider (`.ow-prose`, automatic inside `.ow-article`).
8. **Plain US English, verbs with objects.** "Log in", "Sign up", "Edit résumé", "Review and send". Never "Sign in", "Create account", "Submit" alone, never a diagnosis word anywhere.
9. **Employer questions are required when present**; jobs may have none. Never invent facts in generated text.
10. **Mobile and tablet are audited every pass.** Candidate phone nav is the bottom bar. Nav collapses to a menu under 768px (candidates and visitors) and under 1152px for the seven-item employer nav.

11. **Overlays are part of the page.** Menus, typeaheads and tooltips use the page type (16px rows, 44px tall, 14px meta) and paint above the sticky header. Polaris wraps portals in its own theme container, so every token block in `product.css` targets `#PolarisPortalsContainer .Polaris-ThemeProvider--themeContainer` as well as `:root`. A popover that is clipped, covered, or smaller than the page is a bug.
12. **Vertical rhythm is fixed.** 24px from the header to the first block, 16px between stacked blocks, 24px between page sections. Controls that fit side by side never stack: filters are one row from 768px up and 2×2 only on phones. No block of air taller than 32px anywhere.
13. **Tone is slate and blue only.** No purple, no "magic" tone, no gradients. Status colours are success green and warning amber.

## 2. Tokens (`src/styles/product.css` `:root`)

| Token | Value | Use |
|---|---|---|
| `--ow-ink` | `#0f172a` | Text, primary buttons |
| `--ow-ink-2` | `#475569` | Secondary text, labels, meta lines |
| `--ow-ink-3` | `#94a3b8` | Placeholder, disabled |
| `--ow-paper` | `#f8fafc` | Page background |
| `--ow-paper-2` | `#f1f5f9` | Default pill, progress track |
| `--ow-line` / `--ow-line-2` | `#e2e8f0` / `#cbd5e1` | Hairlines / hover borders |
| `--ow-accent` / `--ow-accent-hover` | `#2563eb` / `#1d4ed8` | Links, active nav, focus ring, selected option border |
| `--ow-accent-tint` | `#eff6ff` | Selected option fill, "why" panels, suggestion rows |
| success / warning | `#10b981` / `#f59e0b` (+ `-tint`, `-ink`) | Match states, status pills |
| `--ow-radius` / `--ow-radius-lg` | 6px / 10px | Controls, pills / sheets |
| `--ow-control-height` | 44px | All controls |
| `--ow-control-height-slim` | 40px | Slim buttons in cards |
| `--ow-display-size(-lg)` | 44px / 56px | Landing headline only |

Type: Inter, weights 450 / 500 / 600 / 700 / 800. Polaris variants map to the scale: `heading2xl` 28, `headingXl` and `headingLg` 20, `headingMd` and `bodyLg` 18, `headingSm` and `bodyMd` 16, `bodySm` 14, `bodyXs` 13. Headings track −0.02em.

Spacing uses Polaris steps only: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40. Sheet padding 20 (phone) / 24 (desktop). Wizard sheet 24 / 28–40. Gap between page sections 24; between fields 16; between a label and its control 6.

## 3. Layout (`1c` in the archive for history)

- **Containers**: `.ow-container` 1440 max; `--narrow` 880 for forms, settings, sign-in, support; `--fluid` for the jobs board.
- **Sheets**: `.ow-sheet` is the only card: white, 1px `--ow-line`, radius 10, shadow 0 1px 2px. Polaris `Card` is being retired in favour of it.
- **Two columns**: `.ow-cols` = `minmax(0,1fr) 360px` at ≥1024 with a sticky `.ow-aside`. Under 1024 the aside cards follow the article; the apply card becomes a sticky bottom bar (`.ow-aside__card--apply`).
- **Jobs board**: `.ow-jobs` = 280px filter rail + results at ≥1024; `.ow-filterstrip` (two rows of Selects + needs typeahead, ~150px) below.
- **Page head**: `.ow-pagehead` = back link left, one action right, 16px under it.
- **Wizard**: `.ow-onboard--form` (employer builder, left-aligned) and `.ow-onboard` (candidate setup, centered, six steps). Footer `.ow-onboard__foot`: Back left, "Save draft" plain + primary right.

## 4. Components

| Component | File | Rule |
|---|---|---|
| Apply control | `QuickApplyButton` | One control everywhere. Quick apply (no questions) · Prepare application · Review and send (prepared) · View application (sent) · Closed. `applyHint()` is the one line under it. |
| Match card | `MatchCard` | Hero: label, title, meta line, "Why this is a great fit" panel, primary apply, Save. Feed: same without primary; title is the link. |
| Job card | `JobCard` | Logo, title (block link, 44px), company · location, one meta line (pay · arrangement · type), up to three ✓ facts, posted line. Star is the only icon action. |
| Fit panel | `FitPanel` / `evidenceLines()` | Three lines: Career · Work · Accessibility. Zero is stated ("None of the 9 listed skills…"), never "not compared". |
| Evidence | `EvidenceLine`, `.ow-evcard`, `.ow-factlist` | Fact + status + note. Source and date once per section, per card only when sources differ. Company page groups into Provided / On request / Not available. |
| Option cards | `OptionCard`, `OptionGrid` | Radio or checkbox semantics, 2px border, tint when selected, left-aligned text. Used for every choice with ≤8 options. |
| Picked list | `PickedList` | Rows with an × per item. Replaces every tag cloud. |
| Strengths | `StrengthsPicker` | Typeahead over the shared list, 8 rows max, "Add … as your own", then `PickedList`. |
| Area nav | `.ow-areanav` | Pill anchors with counts for long single-page forms (workplace accessibility, support). |
| Stat tile | `.ow-stat` | The tile is the link. No "View" buttons. |
| Overflow | `Popover` + `ActionList` | For secondary row actions only (employer job rows). |
| Menu / popover | `.ow-menu` | 12px padding, 320–340px wide, `headingSm` title, option cards for choices (Display settings), 44px rows. Never a raw Polaris `ChoiceList` in a popover. |
| Typeahead list | `Autocomplete` + `.ow-opt` | List is at least 400px wide regardless of the input, 44px rows, label left and count right in tabular figures, section titles 16px semibold slate. |
| Suggest rewrites | `SuggestRewrite` | Slim magic button; three options in tint rows; "Use this" / "Keep my words"; honest offline sentence. |

## 5. Patterns

- **Accounts**: `/signin` is one option card per account; `/signup` is two fields and one button into setup. Clerk when `VITE_CLERK_PUBLISHABLE_KEY` is set (`src/auth/clerk.tsx`); demo accounts always work.
- **Employers get in three ways**: `/post` (write the job first, account at the end, draft in `openwork.postDraft`), `/claim` (work-email domain match on a listed company), `/employer/jobs/import` (careers-page import via `/api/import-jobs`). Pricing at `/pricing`: Free / Growth $149 / Enterprise, proposal until launch.
- **Openwork applies for you**: Review / Assist / Auto ↔ Free / Plus / Pro. Rules on `/passport/assist`; Ready-to-send queue on Applications; employer opt-out per job.
- **Empty states** say what to do next and show something useful (Saved shows three jobs worth saving; Interviews shows the three-step path). Never a lone illustration in a narrow column.
- **Help**: Support is one FAQ list with anchor pills and one email block.

## 6. Responsive

Breakpoints: 768 (tablet, nav), 1024 (rail and columns), 1152 (employer nav), 1440 (container). Phone: bottom nav 64px for candidates (`--ow-bottomnav-height`), sticky action bars sit above it. Tablet shows the full candidate nav.

## 7. Accessibility

axe (wcag2a/aa, 2.1aa, 2.2aa, best-practice) must report zero violations on every page before a push. Landmarks: one `main`, `nav` labelled, `aside` only for true complementary content. Every custom control has a role, name and 44px target. Pressed chips carry tint + ring + check icon (3.45:1 was not enough). Focus ring is the accent, 2px, offset 2px. Display settings offer Large text and Simplified; both re-run the nav collapse at 1600px.

## 8. Decisions log

- 2026-09-25 — Theme settled on UX Pilot export after a live three-way switch. Do not revisit.
- 2026-09-25 — Type scale fixed at six sizes; `headingXl` remapped to 20 on 2026-09-26.
- 2026-09-26 — Auth words Log in / Sign up; one-click account cards.
- 2026-09-26 — Chip walls removed (Discover, Profile, employer Candidates); badges reduced to status only.
- 2026-09-26 — Employer rows: Edit + overflow. Workplace accessibility folds answered areas to a summary with area nav.
- 2026-09-26 — Wizard header compacted so the first field is above the fold. Purple "magic" tone removed from step labels.
- 2026-09-26 — Popovers were 13px and slid under the header (Polaris portal theme reset). Rule 11 added; portal theme container now receives every token block.
- 2026-09-26 — Jobs page on tablet stacked filters in four rows under 60px of air. Rule 12 added; strip is one row from 768px, container top padding 24px.
- 2026-09-26 — Display popover rebuilt on option cards; needs typeahead widened to 400px with label/count rows; wizard action row now shares the sheet's 960px and sits 12px above it. Overlay spec added to §4.
- 2026-09-26 — Density sweep of every form. Apply: readiness panel became a one-line strip and the logo left the header. Résumé: template is a Select in the toolbar. Import intro cut to one sentence. All forms now put the first field under 320px at 1440.
- 2026-09-26 — Database will be Netlify DB (Neon) via Netlify Functions, not Supabase.
