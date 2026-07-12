/**
 * emailNotifier.ts — sends a notification email when a form is submitted.
 *
 * Provider choice: Resend (https://resend.com) is used as the concrete default because
 * it has a simple single-call HTTP API well-suited to a serverless endpoint, a
 * generous free tier, and first-class Astro/Node compatibility. This is an
 * infrastructure/engineering decision, not a factual claim about M2VPRODUCTION's
 * business — it is NOT gated by the Content Rules verification requirement. It CAN be
 * swapped for Postmark, SendGrid, or a CRM webhook by editing only this file; nothing
 * in the API routes needs to change (they only call `sendFormNotification`).
 *
 * Required env vars (see .env.example): EMAIL_PROVIDER_API_KEY, FORM_NOTIFICATION_EMAIL_TO,
 * FORM_NOTIFICATION_EMAIL_FROM. Until real values are set, sendFormNotification() logs a
 * clear warning and returns { sent: false } instead of throwing — a missing/placeholder
 * API key must never crash form submission for the end user; the submission itself is
 * still captured in the server response/logs either way.
 */

export interface FormNotificationInput {
  subject: string;
  formName: "Fixing Enquiry" | "Contact";
  fields: Record<string, string>;
}

export interface FormNotificationResult {
  sent: boolean;
  reason?: string;
}

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.trim().length === 0 || value.startsWith("TODO");
}

function renderPlainTextBody(input: FormNotificationInput): string {
  const lines = Object.entries(input.fields)
    .filter(([key]) => key !== "company_website") // never echo the honeypot field
    .map(([key, value]) => `${key}: ${value}`);
  return `New ${input.formName} submission from m2vproduction.co.tz\n\n${lines.join("\n")}`;
}

export async function sendFormNotification(
  input: FormNotificationInput
): Promise<FormNotificationResult> {
  const apiKey = import.meta.env.EMAIL_PROVIDER_API_KEY;
  const to = import.meta.env.FORM_NOTIFICATION_EMAIL_TO;
  const from = import.meta.env.FORM_NOTIFICATION_EMAIL_FROM;

  if (isPlaceholder(apiKey) || isPlaceholder(to) || isPlaceholder(from)) {
    console.warn(
      `[emailNotifier] Skipped sending "${input.formName}" notification — ` +
        `EMAIL_PROVIDER_API_KEY / FORM_NOTIFICATION_EMAIL_TO / FORM_NOTIFICATION_EMAIL_FROM ` +
        `are not yet configured with real values. See .env.example.`
    );
    return { sent: false, reason: "email_not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        text: renderPlainTextBody(input),
      }),
    });

    if (!response.ok) {
      console.error(`[emailNotifier] Provider returned ${response.status}`);
      return { sent: false, reason: `provider_error_${response.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[emailNotifier] Network/send error:", err);
    return { sent: false, reason: "network_error" };
  }
}
