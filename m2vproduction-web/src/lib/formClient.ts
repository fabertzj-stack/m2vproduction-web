/**
 * formClient.ts — shared client-side submit handler for both FixingEnquiryForm and
 * ContactForm. Centralizing this avoids duplicating fetch/error-rendering/success-state
 * logic across two near-identical forms (Code Quality requirement: no duplicated logic).
 *
 * This file runs in the browser (imported from inline <script type="module"> tags in
 * the two form components) — it does NOT run on the server. Server-side validation is
 * the real security boundary (see src/lib/validation.ts, called from the /api/* routes);
 * this only gives users instant feedback and posts the data along.
 */

export interface ApiErrorResponse {
  errors?: Record<string, string>;
  message?: string;
}

export interface SubmitFormOptions {
  form: HTMLFormElement;
  endpoint: string;
  onSuccess: () => void;
  onError: (errors: Record<string, string>, generalMessage?: string) => void;
}

export async function submitForm(options: SubmitFormOptions): Promise<void> {
  const { form, endpoint, onSuccess, onError } = options;
  const formData = new FormData(form);
  const payload: Record<string, string> = {};
  formData.forEach((value, key) => {
    payload[key] = String(value);
  });

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn instanceof HTMLButtonElement) {
    submitBtn.disabled = true;
    submitBtn.dataset.originalLabel = submitBtn.textContent ?? "";
    submitBtn.textContent = "Sending...";
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      onSuccess();
      return;
    }

    const data: ApiErrorResponse = await response.json().catch(() => ({}));
    if (response.status === 429) {
      onError({}, "Too many submissions from this connection. Please try again in a few minutes.");
    } else {
      onError(data.errors ?? {}, data.message ?? "Something went wrong. Please try again or email us directly.");
    }
  } catch {
    onError({}, "We couldn't reach the server. Check your connection and try again.");
  } finally {
    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalLabel ?? submitBtn.textContent;
    }
  }
}

export function renderFieldErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  form.querySelectorAll(".form-field").forEach((field) => {
    field.removeAttribute("data-invalid");
    const errorEl = field.querySelector(".field-error");
    if (errorEl) errorEl.textContent = "";
  });

  Object.entries(errors).forEach(([name, message]) => {
    const field = form.querySelector(`.form-field[data-field="${name}"]`);
    if (!field) return;
    field.setAttribute("data-invalid", "true");
    const errorEl = field.querySelector(".field-error");
    if (errorEl) errorEl.textContent = message;
  });
}
