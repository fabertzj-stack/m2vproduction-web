/**
 * validation.ts — shared server-side validation for both form endpoints.
 * Client-side validation (in FixingEnquiryForm.astro / ContactForm.astro) exists purely
 * for instant UX feedback. This file is the real security/data-integrity boundary —
 * per the Final Executive Audit and Phase 3 QA report, client-side validation alone is
 * never sufficient.
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFixingEnquiry(data: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {};

  // Name/email are required in addition to the three production-scoping fields below —
  // without them there is no way to respond to the enquiry at all. This was implicit in
  // the original form design but not enforced in earlier drafts of this function; added
  // here as a structural completeness fix, not a copy/content change.
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Please enter your name so we know who we're speaking with.";
  }
  if (!data.email || !EMAIL_RE.test(data.email.trim())) {
    errors.email = "Please enter a valid email address so we can respond.";
  }
  if (!data.dates || data.dates.trim().length === 0) {
    errors.dates = "Please enter your shooting dates so we can check crew and permit availability.";
  }
  if (!data.location || data.location.trim().length === 0) {
    errors.location = "Please select at least one location — choose “Not sure yet” if you haven't decided.";
  }
  if (!data.budget || data.budget.trim().length === 0) {
    errors.budget = "Please choose a budget range so we can scope the right team and equipment.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateContact(data: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Please enter your name so we know who we're speaking with.";
  }
  if (!data.email || !EMAIL_RE.test(data.email.trim())) {
    errors.email = "Please enter a valid email address so we can respond.";
  }
  if (!data.message || data.message.trim().length === 0) {
    errors.message = "Please add a short message so we can route your enquiry to the right team.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Honeypot check — a hidden field ("company_website" by convention below) that real
 * users never see or fill in, but naive bots reliably do. Any non-empty value here
 * means the submission is almost certainly spam.
 */
export function isHoneypotTriggered(data: Record<string, string>): boolean {
  return Boolean(data.company_website && data.company_website.trim().length > 0);
}
