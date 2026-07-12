/**
 * siteConfig.ts — the single source of truth for every value that appears more than
 * once across the site (stats, client roster, contact details, nav labels).
 *
 * IMPORTANT — Content Rules (per the Executive Director brief):
 * Every value below marked `verified: false` is UNVERIFIED and carries a TODO.
 * Do not remove a TODO or flip `verified` to `true` without a real, confirmed source —
 * see M2VPRODUCTION_PhaseC_Missing_Information_Audit.docx for the full checklist this
 * file implements. Components that render these values MUST check `verified` and render
 * nothing (or a build-time warning) rather than silently publishing an unconfirmed claim.
 */

export interface VerifiableStat {
  value: string;
  label: string;
  verified: boolean;
  todo?: string;
}

export const companyStats: VerifiableStat[] = [
  {
    value: "9+",
    label: "Years Operating",
    verified: false,
    todo: "TODO: Phase C item 1 — this contradicts the 'since 2020' claim used elsewhere in the approved copy. Confirm the real founding date before publishing either figure.",
  },
  {
    value: "120+",
    label: "Production Days",
    verified: false,
    todo: "TODO: Phase C item 4 — confirm real production-day count against internal records.",
  },
  {
    value: "15+",
    label: "Regions Covered",
    verified: false,
    todo: "TODO: Phase C item 4 — confirm real region count.",
  },
  {
    value: "40+",
    label: "Vetted Crew Network",
    verified: false,
    todo: "TODO: Phase C item 4 — confirm real crew network size.",
  },
];

export interface VerifiableClient {
  name: string;
  verified: boolean;
  todo?: string;
}

/**
 * CORE clients — six names supplied directly by the client (Joshua) with the instruction
 * to use them "wherever you have permission." Permission itself is still unconfirmed
 * per Phase C item 3 — logos must not render until that's resolved.
 */
export const coreClients: VerifiableClient[] = [
  { name: "BBC Media Action", verified: false, todo: "TODO: written logo/name usage permission not yet confirmed (Phase C item 3)." },
  { name: "Showmax", verified: false, todo: "TODO: written logo/name usage permission not yet confirmed (Phase C item 3)." },
  { name: "MultiChoice", verified: false, todo: "TODO: written logo/name usage permission not yet confirmed (Phase C item 3)." },
  { name: "UNDP", verified: false, todo: "TODO: written logo/name usage permission not yet confirmed (Phase C item 3)." },
  { name: "CRDB Bank", verified: false, todo: "TODO: written logo/name usage permission not yet confirmed (Phase C item 3)." },
  { name: "YAS", verified: false, todo: "TODO: written logo/name usage permission not yet confirmed (Phase C item 3)." },
];

/**
 * These six names were added during earlier copywriting phases to fill out a fuller
 * logo wall and were NEVER confirmed by the client. Phase C flagged this directly as
 * a process error, not a pending verification. They are listed here ONLY so the
 * Clients page component has a typed shape to render once/if real names replace them —
 * `verified: false` means the component MUST NOT render these publicly.
 */
export const unconfirmedExtendedClients: VerifiableClient[] = [
  { name: "Tanzania Tourist Board", verified: false, todo: "TODO: NOT client-provided. Do not publish without direct confirmation (Phase C flagged issue)." },
  { name: "Vodacom", verified: false, todo: "TODO: NOT client-provided. Do not publish without direct confirmation (Phase C flagged issue)." },
  { name: "Standard Chartered", verified: false, todo: "TODO: NOT client-provided. Do not publish without direct confirmation (Phase C flagged issue)." },
  { name: "WWF", verified: false, todo: "TODO: NOT client-provided. Do not publish without direct confirmation (Phase C flagged issue)." },
  { name: "Save the Children", verified: false, todo: "TODO: NOT client-provided. Do not publish without direct confirmation (Phase C flagged issue)." },
  { name: "Zanzibar Commission for Tourism", verified: false, todo: "TODO: NOT client-provided. Do not publish without direct confirmation (Phase C flagged issue)." },
];

export interface ContactChannel {
  label: string;
  value: string;
  verified: boolean;
  todo?: string;
}

export const contactDetails: Record<string, ContactChannel> = {
  email: {
    label: "Email",
    value: "info@m2vproduction.co.tz",
    verified: false,
    todo: "TODO: Phase C item 11 — confirm this is the real, live, monitored inbox before publishing as the primary contact method.",
  },
  emergencyLine: {
    label: "Emergency Production Line",
    value: "+255 658 112 239",
    verified: false,
    todo: "TODO: Phase C item 11 — confirm this is a real, staffed number. An emergency line that goes unanswered is worse than not having one.",
  },
  whatsapp: {
    label: "WhatsApp",
    value: "TODO: real WhatsApp Business number required — none has been supplied yet",
    verified: false,
    todo: "TODO: no WhatsApp number has ever been supplied in this engagement. Every WhatsApp CTA on the site is currently a dead link until this is provided.",
  },
};

export const responseTimePromise: VerifiableStat = {
  value: "24hr",
  label: "Response Time",
  verified: false,
  todo: "TODO: Phase C item 5 — confirm this SLA is one the business can actually commit to operationally before publishing it as a promise.",
};

export const navigation = {
  primary: [
    { label: "Film Production", href: "/film-production" },
    { label: "Corporate Media", href: "/corporate-media" },
    { label: "Film Fixing Tanzania", href: "/film-fixing-tanzania", flagship: true },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
    { label: "Equipment", href: "/equipment" },
    { label: "Clients", href: "/clients" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Journal", href: "/journal" },
  ],
  workDropdown: [
    { label: "Film Production", href: "/film-production" },
    { label: "Corporate Media", href: "/corporate-media" },
    { label: "Full Portfolio", href: "/portfolio" },
  ],
};

export const siteMeta = {
  name: "M2VPRODUCTION",
  url: "https://www.m2vproduction.co.tz", // TODO: confirm final production domain
  tagline: "International Productions. Local Expertise.",
  addressLocality: "Dar es Salaam",
  addressCountry: "TZ",
};
