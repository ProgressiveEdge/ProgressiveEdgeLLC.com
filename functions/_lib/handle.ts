import { forwardToN8n } from './forward';
import { verifyTurnstile } from './turnstile';
import {
  CONTACT_FIELDS,
  MAX_BODY_BYTES,
  SUPPORT_FIELDS,
  attachedFiles,
  textFields,
  validateContact,
  validateSupport,
} from './validate';

export interface Env {
  TURNSTILE_SECRET_KEY?: string;
  N8N_CONTACT_WEBHOOK_URL?: string;
  N8N_SUPPORT_WEBHOOK_URL?: string;
  N8N_WEBHOOK_SECRET?: string;
}

export type FormKind = 'contact' | 'support';

const json = (status: number, body: unknown): Response =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

/**
 * One form submission, start to finish. Never logs what the visitor typed or attached.
 * Order: method → size → honeypot → config → Turnstile (valid, and solved on this host) → validation → n8n.
 */
export async function handleSubmission(
  request: Request,
  env: Env,
  kind: FormKind,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json(413, { error: 'too_large' });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'validation', fields: [] });
  }

  // Bots fill the hidden "website" field. Pretend it worked and drop it.
  const honeypot = form.get('website');
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return json(200, { ok: true });

  const webhookUrl = kind === 'contact' ? env.N8N_CONTACT_WEBHOOK_URL : env.N8N_SUPPORT_WEBHOOK_URL;
  if (!env.TURNSTILE_SECRET_KEY || !env.N8N_WEBHOOK_SECRET || !webhookUrl) {
    return json(500, { error: 'config' });
  }

  const token = form.get('cf-turnstile-response');
  const human = await verifyTurnstile(
    typeof token === 'string' ? token : '',
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP'),
    new URL(request.url).hostname,
    fetchImpl,
  );
  if (!human) return json(400, { error: 'verification' });

  const fields = textFields(form, kind === 'contact' ? CONTACT_FIELDS : SUPPORT_FIELDS);
  const files = kind === 'support' ? attachedFiles(form) : [];
  const invalid = kind === 'contact' ? validateContact(fields) : validateSupport(fields, files);
  if (invalid.length > 0) return json(400, { error: 'validation', fields: invalid });

  const outgoing = new FormData();
  for (const [name, value] of Object.entries(fields)) outgoing.append(name, value);
  outgoing.append('submitted_at', new Date().toISOString());
  files.forEach((file, index) => outgoing.append(`attachment_${index + 1}`, file, file.name));

  const result = await forwardToN8n(webhookUrl, env.N8N_WEBHOOK_SECRET, outgoing, fetchImpl);
  if (!result.ok) return json(502, { error: 'upstream' });
  if (kind === 'contact') return json(200, { ok: true });

  const ticketNumber = result.data.ticketNumber;
  return typeof ticketNumber === 'string' || typeof ticketNumber === 'number'
    ? json(200, { ok: true, ticketNumber: String(ticketNumber) })
    : json(200, { ok: true });
}
