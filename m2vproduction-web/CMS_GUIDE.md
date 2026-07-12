# Content Guide

This site has no headless CMS or admin panel — content lives as files in
`src/content/` and `src/data/siteConfig.ts`, edited directly (or via git) and deployed
through a normal build. This section explains how to work with it, and how to migrate
to a real CMS later if that becomes worthwhile.

## The golden rule: `verified: false` until it's actually confirmed

Every content type below has an `isVerified` (or `verified`) boolean field. Components
check this before rendering the value publicly. **Never set it to `true` as a
shortcut to "make it show up."** Set it to `true` only once the underlying fact,
quote, or permission has genuinely been confirmed. See `README.md`'s "Content Rules"
section and `M2VPRODUCTION_PhaseC_Missing_Information_Audit.docx`.

## Adding a project (case study)

1. Create a new `.mdx` file in `src/content/projects/`, filename = URL slug (e.g.
   `serengeti-documentary-2026.mdx` → `/portfolio/serengeti-documentary-2026`).
2. Fill in the frontmatter per the schema in `src/content/config.ts` — `title`,
   `service`, `location`, `heroImage`, `heroImageAlt` are required; the nine
   case-study fields (`challenge`, `timeline`, `crewSize`, etc.) are optional but
   recommended.
3. If naming a client, set `client` AND only set `clientPermissionConfirmed: true`
   once you have that in writing — see `ProjectCard.astro` / `[slug].astro` for how
   this gates what's shown.
4. Leave `isVerified: false` until every field has been checked against real records.
   Unverified projects still render (with an "Illustrative example" badge and
   `noindex`) rather than being hidden — see `src/content/projects/the-wildebeest-line.mdx`
   for the reference example.
5. Set `isVerified: true` only when ready to publish for real.

## Adding a journal post

Same pattern in `src/content/journal/` — see
`how-to-get-a-film-permit-in-tanzania.mdx` for the reference example. `category` must
be one of the enum values in `src/content/config.ts`.

## Adding/editing a testimonial

`src/content/testimonials/*.yaml` (data collection, not MDX — no frontmatter
delimiters, just plain YAML key/values). `clientName` should only be set if the client
has approved being named; `clientPermissionConfirmed` gates whether the name actually
renders even if present. `isVerified: false` hides the quote behind a "pending
verification" placeholder instead of publishing it — see `Testimonial.astro`.

## Adding/editing a team profile

`src/content/team/*.yaml` — same data-collection pattern. `photo` is optional; if
omitted, no image renders (no placeholder needed for optional fields).

## Editing sitewide facts (stats, clients, contact details)

All in `src/data/siteConfig.ts`:

- `companyStats` — the four homepage/about stats. Each has a `todo` explaining what to
  confirm. Note the flagged contradiction between "9+ Years Operating" and the "since
  2020" claim used elsewhere — resolve this before publishing either number.
- `coreClients` — the only client names allowed to render anywhere on the site.
  `unconfirmedExtendedClients` exists ONLY as a typed placeholder and must never be
  wired into a rendering component — those six names were never client-approved.
- `contactDetails` — email, emergency line, WhatsApp. The WhatsApp number is currently
  a placeholder; every WhatsApp CTA on the site is a dead link until a real number is
  supplied.

## Migrating to a headless CMS later

The Zod schemas in `src/content/config.ts` are written to double as the target schema
for a future Sanity/Storyblok integration (see Phase A "CMS Structure & Content
Model"). If that migration happens, the field names and types here should map
directly — Astro's Content Collections API can also be pointed at a remote CMS as a
data source with relatively small changes to `config.ts`, without needing to rewrite
the components that consume `getCollection()`.
