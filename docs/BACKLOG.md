# Look-and-feel backlog — audit of 2026-09-25

Whole-site pass at 1440 / 768 / 375 as visitor, Rosa (candidate), Meridian (employer), trust team.
Theme is settled (UX Pilot). Items are ranked by how much they hurt, not by effort.

## A. Fix first — hierarchy and wrong messages

1. ✅ **Matches hero shows a job you already applied to**, with a primary button reading "Applied · view". The hero should be the best *open* match; applied jobs move to Applications. Button copy "Applied · view" → "View application".
2. ✅ **"Skills not yet compared — add skills to your profile"** appears for people who have skills. It fires when none overlap. Say "0 of 9 skills listed" or hide the line.
3. ✅ **Job page on phone puts Apply above the title.** You see two buttons before you know the job. Title block first, apply bar sticky at the bottom (same pattern as Apply page).
4. ✅ **Matches feed is a wall of black buttons**: 13 primary "Prepare application" on one screen. Cards should carry one primary at most in the hero; feed cards link through the title and show a quiet "Prepare" as secondary or on hover/focus.
5. ✅ **Apply page header on phone** wraps logo + title + subtitle into a broken two-column block. Stack it.
6. ✅ **"Sharing" / "Build or edit" / "Remove" on Profile** read as leftover labels. Use verbs with objects: "Edit sharing", "Edit résumé", "Remove résumé".

## B. Chip walls (standing rule violations)

7. ✅ **Discover**: strength chips with × plus an 8-item category chip row. Replace with the StrengthsPicker list and a single Select for kind of work.
8. ✅ **Employer → Candidates**: status filter is 8 chips in the rail. Make it a Select (or a short OptionCards list on desktop).
9. ✅ **Profile → Strengths / Skills**: two chip clouds. Show as a plain list with a remove control per row, or as compact pills without borders and no more than 2 lines before "Show all".
10. ✅ **Job cards / job detail** carry 3–4 pill badges per card (pay, arrangement, type, verification). Keep pay and arrangement as text in the meta line; keep one badge for verification only.

## C. Button walls and control noise (employer)

11. **Employer → Jobs**: every row has 5 buttons (Accepts auto-apply, Preview, Edit, Duplicate, Close). Row = title, meta, one status pill, one "Edit". Preview/Duplicate/Close go to a single overflow ActionList. Auto-apply becomes a toggle in the job builder step 6 and a small "Auto-apply on/off" text in the row.
12. **Employer → Workplace accessibility**: 70 buttons on one page (Yes / No / Contact us per question). Works, but on phone it is a 5,700px scroll. Group by area with an in-page area nav (Vision · Hearing · Mobility …) and collapse answered areas into a one-line summary row (still visible, not hidden content: title + answer count, tap to expand the questions).
13. **Overview stat tiles** each carry a "View" button. The tile itself should be the link.

## D. Empty pages and 40% width

14. **Saved (empty), Interviews (one row), Applications (one card), Settings, Employer sign-up**: a narrow column on an empty page. Give empty states a purpose block: for Saved, show 3 recommended jobs to save; for Interviews, show "what happens when you move someone to interview" with the next step. Settings and Employer sign-up should use the sheet (`.ow-sheet`) on the 880 narrow container so the page has a shape.
15. **Support** is a 2-column grid of eight identical cards with eight different button labels. Make it one FAQ list with anchor links and a single "Email support" block.

## E. Type scale drift

16. Off-scale sizes found live: 11px (Profile), 17px (Jobs cards ×15), 21px (Landing, Apply), 24px (Jobs, Matches, Employer overview stats), 56px hero. Scale is 28/20/18/16/14/13. Hero may keep one display size (48 or 56, define it once as `--ow-display`); everything else snaps.
17. **Line length**: How-it-works, job page footnote, and company About run past 100 characters. Cap prose at 72ch.

## F. Touch targets and nav

18. Header nav links are 20px tall text; footer links 20px; job titles in feeds 22px. WCAG 2.5.8 minimum is 24px; house rule is 44px for controls. Add padding to nav/footer links and make the card title a block-level link with padding.
19. **Tablet (768) hides the primary nav** for both candidate and employer and shows only the hamburger. There is room for the 5 candidate items at 768; the 7 employer items fit at 900+. Show nav from 768 for candidates, from 900 for employers.
20. Phone: Matches shows "How Openwork helps" button and a Sort select stacked above the digest banner. Move Sort into the feed header ("More recommended roles · Sort") and drop the button; the avatar menu already has it.

## G. Small polish

21. Job page "Source: Employer reported (Mar 2, 2026)" repeated on every evidence card. Show source once per section: "Employer reported, checked Mar 2026" with a per-card date only when it differs.
22. Company page verification list reads like a database dump. Group into Provided / On request / Not available, three short lists.
23. Landing "Hiring?" block at the very end is an afterthought. Either a proper split section with the employer hero card, or drop it (header already has For employers).
24. Log in page option cards: text is now left-aligned. Check onboarding option cards still look right after the alignment change.
25. Employer sign-up inputs: verified fine at zoom; no change.

## H. Getting employers to post (added 2026-09-26)

Done: "Post a job" in the visitor header and menu, For employers primary is "Post a job", employer sign-up lands in the job builder (step 1 of 7).

Built 2026-09-26: 1–4 below (`/post`, `/pricing`, `/claim`, `/employer/jobs/import` + `netlify/functions/import-jobs.mts`). Import needs the server; the page says so when it is absent.

Still to build, in the order other boards do it:
1. ✅ **Job-first sign-up**: write the job before the account. Account is created at the end from the contact email (Indeed, ZipRecruiter pattern). Draft lives in localStorage until then.
2. ✅ **Pricing page** for employers: Free listing / Featured / Unlimited, plus what "verified practices" costs (nothing, but takes a call). Every board has one; we have none.
3. ✅ **Claim your company page**: seed company profiles from public data, let the employer claim by work-email domain. This is how niche boards get their first 100 employers.
4. ✅ **ATS feed / import**: paste a Greenhouse, Lever or Workday careers URL and we import open roles, then ask only the accessibility questions. Removes the "retype my job" objection.
5. **Compliance angle**: US federal contractors must document outreach to people with disabilities (Section 503, OFCCP). Inclusive boards sell posting as documented outreach. One paragraph and a downloadable outreach record per job.
6. **Employer proof**: response-rate and candidate-quality stats on For employers, and a "posted here" logo row once real employers exist.

## Data and backend decision (2026-09-26)

- **Database: Netlify DB (Neon Postgres)** via `@netlify/neon` in Netlify Functions. Not Supabase. Until it exists, the app stays on localStorage (`openwork.v9`).
- Order of arrival: 1) link repo to a Netlify site (needs Hiram's OK: push = deploy there), 2) `netlify db init`, 3) tables `candidates`, `employers`, `jobs`, `applications`, `alerts` mirroring `src/lib/types.ts`, 4) functions replace the store's persistence one slice at a time, jobs first (public read), then applications (auth via Clerk user id).

## Not in scope this round
- Theme, font, palette (settled).
- Clerk and AI suggestions (need keys).
