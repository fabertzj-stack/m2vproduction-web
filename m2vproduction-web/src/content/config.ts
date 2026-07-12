import { defineCollection, z } from "astro:content";

/**
 * Content Collections schema — per Phase A "CMS Structure & Content Model".
 * Zod validation means a malformed entry fails the build loudly instead of shipping
 * broken content silently. This is also the schema a future headless CMS integration
 * (Sanity/Storyblok, per Phase A) should target.
 */

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    client: z.string().optional(), // omit entirely if client permission isn't confirmed
    clientPermissionConfirmed: z.boolean().default(false),
    service: z.enum(["Commercials", "Documentary", "Corporate Films", "NGO & Development", "TV", "Photography"]),
    location: z.enum(["Zanzibar", "Serengeti", "Dar es Salaam", "Kilimanjaro", "Ngorongoro", "Multiple Locations"]),
    heroImage: z.string(), // path under /public or a CDN URL
    heroImageAlt: z.string(),
    // The nine structured fields from the Phase 2 Project Detail Template / Phase D framework.
    challenge: z.string().optional(),
    timeline: z.string().optional(),
    crewSize: z.string().optional(),
    locationsDetail: z.string().optional(),
    permitsSecured: z.string().optional(),
    equipmentUsed: z.string().optional(),
    clientOutcome: z.string().optional(),
    lessonsLearned: z.string().optional(),
    // Never publish without explicit client sign-off — see Phase D and Phase C.
    budgetScope: z.string().optional(),
    budgetScopeApproved: z.boolean().default(false),
    isVerified: z.boolean().default(false), // gate: unverified projects render with a draft badge, never on production nav
    publishedDate: z.date(),
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
  }),
});

const journal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.enum(["Permits", "Locations", "Case Study", "Industry Perspective"]),
    coverImage: z.string(),
    coverImageAlt: z.string(),
    publishedDate: z.date(),
    isVerified: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  type: "data",
  schema: z.object({
    quote: z.string(),
    attribution: z.string(), // role/title only unless the named individual has approved attribution
    clientName: z.string().optional(),
    clientPermissionConfirmed: z.boolean().default(false),
    isVerified: z.boolean().default(false),
  }),
});

const team = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    photo: z.string().optional(),
    photoAlt: z.string().optional(),
    isVerified: z.boolean().default(false),
  }),
});

export const collections = { projects, journal, testimonials, team };
