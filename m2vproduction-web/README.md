# M2VPRODUCTION — Website

Production-ready Astro site for M2VPRODUCTION: film production, corporate media and
film fixing services in Tanzania.

This README is the entry point. For deeper detail see:

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — one-click Vercel deploy walkthrough, environment setup, build/test instructions
- [`CMS_GUIDE.md`](./CMS_GUIDE.md) — how to add/edit projects, journal posts, testimonials and team profiles
- [`M2VPRODUCTION_Final_QA_Report.docx`](./M2VPRODUCTION_Final_QA_Report.docx) — what's done, what's blocked, and what needs client input before launch

## Deploy this repo

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import that repository.
3. Vercel auto-detects Astro (via `vercel.json` + the `@astrojs/vercel` adapter already
   configured in `astro.config.mjs`) — click **Deploy**.

That's it for a first deploy. The site will build and go live with placeholder
content and unverified facts clearly marked (see "Content Rules" below) — it will
NOT look launch-ready until the steps in `DEPLOYMENT.md`'s pre-launch checklist are
done, but it will build and run correctly out of the box. Every subsequent push to
`main` redeploys automatically; every pull request gets its own preview URL. See
`DEPLOYMENT.md` for environment variables you'll want to set before forms can send
notification emails.

A `.github/workflows/ci.yml` also runs on every push/PR — type-checking and building
the project as a pre-merge safety net. It doesn't deploy anything; Vercel's own GitHub
integration handles that.

## Stack

- **Astro 4** (`output: "hybrid"`) — every page is static-prerendered at build time except
  `/api/*` form endpoints, which run on-demand via the `@astrojs/vercel` adapter.
- **TypeScript**, strict mode.
- **Astro Content Collections** (Zod-validated) for Projects, Journal, Testimonials, Team.
- **MDX** for long-form project/journal content.
- Plain CSS with a design-token system (`src/styles/tokens.css`) — no Tailwind, no CSS framework.
- No client-side framework (no React/Vue). All interactivity is vanilla `<script>` with
  progressive enhancement — every form, nav and accordion works with JavaScript
  disabled, just without the instant feedback.

## Quick start (local development)

```bash
npm install
cp .env.example .env   # fill in real values — see DEPLOYMENT.md
npm run dev
```

## Project structure

```
src/
  components/    UI components, grouped by domain (nav, layout, media, proof, forms, portfolio, faq)
  layouts/       BaseLayout.astro (head/meta/schema) and PageLayout.astro (nav+main+footer shell)
  lib/           Non-visual logic: seo.ts, schema.ts, validation.ts, rateLimit.ts, emailNotifier.ts, formClient.ts
  data/          siteConfig.ts — single source of truth for stats/clients/contact/nav, with a verified/TODO gate on every fact
  content/       Content Collections: projects/, journal/, testimonials/, team/
  pages/         Routes, including api/ (form endpoints), portfolio/[slug].astro, journal/[slug].astro, legal/
  styles/        tokens.css (design tokens) + global.css (reset/primitives)
  middleware.ts  Security headers for the on-demand /api/* routes
public/          Static assets — favicons and OG images are NOT yet populated, see below
.github/workflows/ci.yml   Build/type-check CI (not deployment — see "Deploy this repo")
vercel.json      Vercel project config: framework detection + security headers for static routes
```

## The Content Rules — read this before adding content

Every fact on this site (client names, statistics, testimonials, team bios, permits,
equipment) is represented as a typed object with a `verified: boolean` flag and, when
`false`, a `todo` string explaining exactly what needs confirming. Components check
`.verified` before rendering a claim publicly — see `src/data/siteConfig.ts` and
`src/content/config.ts` for the pattern.

**Do not flip `verified` to `true` without a real, confirmed source.** This is not a
formality — it's the mechanism that keeps unconfirmed claims (a stat that contradicts
another page, a client name that was never approved, a testimonial no one signed off
on) from silently going live. See `M2VPRODUCTION_PhaseC_Missing_Information_Audit.docx`
for the full list of what's currently unverified and why.

## What's NOT in this build yet

- **Real brand assets.** `public/favicons/` and `public/og/` are referenced by
  `BaseLayout.astro` but don't exist yet — see Phase B (Content Inventory) for the
  full asset list and DEPLOYMENT.md's pre-launch checklist.
- **Real photography/video.** Every image reference in content collections currently
  points at a `/TODO-...` placeholder path and renders a visible placeholder block
  (see `MediaBlock.astro`) rather than a broken image.
- **Confirmed facts.** Stats, client names/logos, testimonials, team bios and the one
  example case study are all placeholder/illustrative and marked `verified: false`.
  Nothing fabricated is presented as confirmed — see the Content Rules above.
- **Analytics.** GA4/GTM/Meta Pixel/LinkedIn Insight Tag are stubbed with TODOs in
  `BaseLayout.astro`, gated behind cookie consent, and intentionally not wired to real
  tracking IDs yet.
- **A compiled build in THIS session.** This sandbox has no npm registry access, so
  `npm install` / `astro build` / `astro check` have not been run here — see the Final
  QA report for the verification methodology used instead. Vercel's build step (or
  the GitHub Actions CI workflow) will be the first real compile of this code —
  resolve anything it surfaces before relying on the site being launch-ready.
