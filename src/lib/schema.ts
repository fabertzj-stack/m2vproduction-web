/**
 * schema.ts — JSON-LD structured data generators.
 * Every function returns a plain object; pages serialize it via JSON.stringify inside
 * a <script type="application/ld+json"> tag. See src/layouts/BaseLayout.astro.
 */

import { siteMeta, contactDetails } from "@data/siteConfig";

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteMeta.name,
    description:
      "Film production company and film fixing service based in Dar es Salaam, Tanzania, serving international broadcasters, NGOs, agencies and brands.",
    url: siteMeta.url,
    // Phone/email intentionally omitted from structured data until Phase C item 11
    // (contact detail verification) is resolved — publishing unverified contact info
    // in schema is worse than omitting it, since it's what search engines surface directly.
    ...(contactDetails.email.verified ? { email: contactDetails.email.value } : {}),
    ...(contactDetails.emergencyLine.verified ? { telephone: contactDetails.emergencyLine.value } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: siteMeta.addressLocality,
      addressCountry: siteMeta.addressCountry,
    },
    areaServed: "Tanzania",
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageSchema(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.answer,
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string; // relative path, e.g. "/portfolio"
}

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteMeta.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
