/**
 * seo.ts — per-page metadata helper.
 *
 * This is the direct fix for the Phase 3/4 Critical finding: every page route in this
 * project is prerendered to static HTML at build time (see astro.config.mjs — output:
 * "hybrid" prerenders everything except the /api/* routes, which opt out explicitly),
 * so whatever this function returns is present in the actual HTML response a crawler or
 * social-media unfurler receives — not injected client-side after the fact, the way
 * the old prototype's updateMeta() JS function worked.
 */

export interface PageSeo {
  title: string;
  description: string;
  path: string; // e.g. "/film-fixing-tanzania" — root is "/"
  ogImage?: string; // defaults to the site-wide fallback if omitted
  noindex?: boolean;
}

const SITE_URL = "https://www.m2vproduction.co.tz"; // TODO: confirm final production domain
const DEFAULT_OG_IMAGE = "/og/default-1200x630.jpg"; // TODO: real asset — see Phase B Open Graph Images tab

export function resolveCanonical(path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `${SITE_URL}${clean}`;
}

export function resolveOgImage(path: string, ogImage?: string): string {
  return `${SITE_URL}${ogImage ?? DEFAULT_OG_IMAGE}`;
}

/**
 * Central registry of page-level SEO for every route in the site. Keeping this here
 * (rather than scattered per-page frontmatter) makes it trivial to audit every page's
 * title/description in one file — directly useful for the kind of SEO review done in
 * Phase 3 and Phase G.
 */
export const pageSeoRegistry: Record<string, PageSeo> = {
  home: {
    title: "M2VPRODUCTION | Film Production & Film Fixing Services in Tanzania",
    description:
      "M2VPRODUCTION is a Dar es Salaam production company and film fixer for international crews shooting commercials, documentaries and corporate media across Tanzania. Permits, crew and locations, handled end to end.",
    path: "/",
  },
  filmFixing: {
    title: "Film Fixer Tanzania | Permits, Locations & Crew for International Productions — M2VPRODUCTION",
    description:
      "Tanzania's dedicated film fixing service for international crews. Permits, location scouting, vetted crew and full production logistics — one point of contact, 24-hour response.",
    path: "/film-fixing-tanzania",
  },
  filmProduction: {
    title: "Film Production Services Tanzania | Commercials, Documentary & TV — M2VPRODUCTION",
    description:
      "Broadcast-standard film production in Tanzania. Commercials, documentaries and photography for international brands and broadcasters, produced by a Dar es Salaam-based crew.",
    path: "/film-production",
  },
  corporateMedia: {
    title: "Corporate Media & Event Production Tanzania | Live Streaming, Hybrid Events — M2VPRODUCTION",
    description:
      "Conference production, hybrid events and live streaming for NGOs, government and corporates in Tanzania — full AV, camera and edit teams for multi-day events.",
    path: "/corporate-media",
  },
  portfolio: {
    title: "Portfolio | Film & Production Work in Tanzania — M2VPRODUCTION",
    description:
      "Browse M2VPRODUCTION's portfolio of commercials, documentaries, corporate media and international film fixing work across Tanzania, filterable by service and location.",
    path: "/portfolio",
  },
  about: {
    title: "About M2VPRODUCTION | Production Company & Film Fixer Based in Dar es Salaam",
    description:
      "M2VPRODUCTION is a Tanzania-based production company and film fixing service serving international broadcasters, NGOs, agencies and brands.",
    path: "/about",
  },
  equipment: {
    title: "Production Equipment Tanzania | Camera, Lighting & Drone Rental — M2VPRODUCTION",
    description:
      "RED and ARRI camera packages, lighting, drone and grip equipment available for productions filming in Tanzania — owned and partner-network gear.",
    path: "/equipment",
  },
  clients: {
    title: "Clients | International Broadcasters, NGOs & Brands — M2VPRODUCTION",
    description:
      "See the international broadcasters, NGOs, agencies and brands M2VPRODUCTION has produced film and production work for across Tanzania.",
    path: "/clients",
  },
  contact: {
    title: "Contact M2VPRODUCTION | Tanzania Production Company & Film Fixer",
    description:
      "Get in touch with M2VPRODUCTION for film production, corporate media or film fixing support in Tanzania. We reply within 24 hours.",
    path: "/contact",
  },
  faq: {
    title: "FAQ | Filming & Production in Tanzania — M2VPRODUCTION",
    description:
      "Answers to common questions about filming in Tanzania — permits, costs, equipment, locations and working with M2VPRODUCTION.",
    path: "/faq",
  },
  journal: {
    title: "Journal | Field Notes on Production in Tanzania — M2VPRODUCTION",
    description: "Field notes on permits, locations and production in Tanzania.",
    path: "/journal",
  },
};
