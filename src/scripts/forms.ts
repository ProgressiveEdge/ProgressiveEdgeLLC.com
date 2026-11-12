export interface SubmitResult {
  ok: boolean;
  data: Record<string, unknown>;
}

/** POSTs a form to one of our /api endpoints. Never throws. */
export async function postForm(endpoint: string, body: FormData): Promise<SubmitResult> {
  try {
    const res = await fetch(endpoint, { method: 'POST', body });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok && data.ok === true, data };
  } catch {
    return { ok: false, data: {} };
  }
}

const FOCUSABLE = '[data-focus], input:not([type="hidden"]):not([hidden]), select, textarea';

/** Marks the listed fields invalid and clears all others. Returns the first invalid control, or null. */
export function showFieldErrors(form: HTMLFormElement, invalid: readonly string[]): HTMLElement | null {
  let first: HTMLElement | null = null;
  for (const group of Array.from(form.querySelectorAll<HTMLElement>('[data-field]'))) {
    const bad = invalid.includes(group.dataset.field ?? '');
    group.classList.toggle('has-error', bad);
    for (const control of Array.from(group.querySelectorAll('input, select, textarea'))) {
      if (bad) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
    if (bad && first === null) first = group.querySelector<HTMLElement>(FOCUSABLE);
  }
  return first;
}

interface TurnstileApi {
  reset(widget?: string | HTMLElement): void;
}

/** Turnstile tokens are single-use: get a fresh one after a failed submit. */
export function resetTurnstile(form: HTMLFormElement): void {
  const widget = form.querySelector<HTMLElement>('.cf-turnstile');
  const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
  if (widget && api) api.reset(widget);
}
