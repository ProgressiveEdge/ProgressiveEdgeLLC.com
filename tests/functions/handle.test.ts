import { describe, it, expect } from 'vitest';
import { handleSubmission, type Env } from '../../functions/_lib/handle';
import { fakeFetch } from '../helpers';

const ENV: Env = {
  TURNSTILE_SECRET_KEY: 'ts-secret',
  N8N_CONTACT_WEBHOOK_URL: 'https://n8n.test/webhook/website-contact',
  N8N_SUPPORT_WEBHOOK_URL: 'https://n8n.test/webhook/website-support',
  N8N_WEBHOOK_SECRET: 'hook-secret',
};

const CONTACT: Record<string, string> = {
  name: 'Pat Doe',
  email: 'pat@example.com',
  company: 'Acme',
  phone: '',
  service: 'Not sure yet',
  message: 'Hello there',
  'cf-turnstile-response': 'tok',
  website: '',
};

const SUPPORT: Record<string, string> = {
  name: 'Pat Doe',
  company: 'Acme',
  email: 'pat@example.com',
  phone: '989-555-0100',
  preferred_contact_method: 'Phone',
  category: 'Hardware',
  priority: 'Critical',
  subject: 'Server down',
  description: 'Nobody can sign in.',
  issue_started: 'This morning',
  users_affected: 'Everyone',
  troubleshooting_attempted: 'Restarted it',
  best_contact_time: 'Any time',
  remote_support_permission: 'yes',
  'cf-turnstile-response': 'tok',
  website: '',
};

function post(
  fields: Record<string, string>,
  files: File[] = [],
  headers: Record<string, string> = {},
  url = 'https://getproedge.org/api/test',
): Request {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.append(name, value);
  for (const file of files) body.append('attachments', file);
  return new Request(url, {
    method: 'POST',
    body,
    headers: { 'CF-Connecting-IP': '203.0.113.9', ...headers },
  });
}

/**
 * siteverify answers `turnstile` for a token solved on `solvedOn`; every other URL is n8n
 * and answers `n8n()`. post() sends to getproedge.org, so that is the default.
 */
function upstream(turnstile = true, n8n: () => Response = () => Response.json({ ok: true }), solvedOn = 'getproedge.org') {
  return fakeFetch((url) =>
    url.includes('siteverify') ? Response.json({ success: turnstile, hostname: solvedOn }) : n8n(),
  );
}

async function read(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe('handleSubmission', () => {
  it('rejects anything but POST', async () => {
    const res = await handleSubmission(new Request('https://getproedge.org/api/contact'), ENV, 'contact', upstream().impl);
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
  });

  it('rejects bodies over 25 MB', async () => {
    const req = post(CONTACT, [], { 'content-length': String(26 * 1024 * 1024) });
    expect(await read(await handleSubmission(req, ENV, 'contact', upstream().impl))).toEqual({
      status: 413,
      body: { error: 'too_large' },
    });
  });

  it('quietly accepts and drops a filled honeypot', async () => {
    const up = upstream();
    const res = await handleSubmission(post({ ...CONTACT, website: 'http://spam.example' }), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 200, body: { ok: true } });
    expect(up.calls).toHaveLength(0);
  });

  it('reports missing configuration', async () => {
    const res = await handleSubmission(post(CONTACT), { ...ENV, N8N_WEBHOOK_SECRET: '' }, 'contact', upstream().impl);
    expect(await read(res)).toEqual({ status: 500, body: { error: 'config' } });
  });

  it('rejects a failed Turnstile check without contacting n8n', async () => {
    const up = upstream(false);
    const res = await handleSubmission(post(CONTACT), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 400, body: { error: 'verification' } });
    expect(up.calls).toHaveLength(1);
    expect((up.calls[0].init.body as FormData).get('remoteip')).toBe('203.0.113.9');
  });

  it('rejects a token solved on another site without contacting n8n', async () => {
    const up = upstream(true, undefined, 'elsewhere.example');
    const res = await handleSubmission(post(CONTACT), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 400, body: { error: 'verification' } });
    expect(up.calls).toHaveLength(1);
  });

  it('accepts a token solved on the host the form was posted to', async () => {
    const up = upstream(true, undefined, 'preview.example.workers.dev');
    const req = post(CONTACT, [], {}, 'https://preview.example.workers.dev/api/contact');
    expect(await read(await handleSubmission(req, ENV, 'contact', up.impl))).toEqual({ status: 200, body: { ok: true } });
  });

  it('marks its JSON answers no-store and nosniff', async () => {
    const res = await handleSubmission(post(CONTACT), ENV, 'contact', upstream().impl);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('returns the invalid field names without contacting n8n', async () => {
    const up = upstream();
    const res = await handleSubmission(post({ ...CONTACT, email: 'not-an-email', message: '' }), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 400, body: { error: 'validation', fields: ['email', 'message'] } });
    expect(up.calls).toHaveLength(1);
  });

  it('forwards a valid contact form to the contact webhook', async () => {
    const up = upstream();
    const res = await handleSubmission(post(CONTACT), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 200, body: { ok: true } });
    const n8n = up.calls[1];
    expect(n8n.url).toBe(ENV.N8N_CONTACT_WEBHOOK_URL);
    expect(new Headers(n8n.init.headers).get('X-PE-Webhook-Secret')).toBe('hook-secret');
    const sent = n8n.init.body as FormData;
    expect(sent.get('name')).toBe('Pat Doe');
    expect(sent.get('message')).toBe('Hello there');
    expect(sent.get('submitted_at')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(sent.has('cf-turnstile-response')).toBe(false);
    expect(sent.has('website')).toBe(false);
  });

  it('forwards support files as attachment_N and returns the ticket number', async () => {
    const up = upstream(true, () => Response.json({ ok: true, ticketNumber: 31001 }));
    const files = [
      new File(['png-bytes'], 'screen.png', { type: 'image/png' }),
      new File(['log'], 'error.txt', { type: 'text/plain' }),
    ];
    const res = await handleSubmission(post(SUPPORT, files), ENV, 'support', up.impl);
    expect(await read(res)).toEqual({ status: 200, body: { ok: true, ticketNumber: '31001' } });
    expect(up.calls[1].url).toBe(ENV.N8N_SUPPORT_WEBHOOK_URL);
    const sent = up.calls[1].init.body as FormData;
    expect((sent.get('attachment_1') as File).name).toBe('screen.png');
    expect((sent.get('attachment_2') as File).name).toBe('error.txt');
    expect(sent.get('priority')).toBe('Critical');
  });

  it('still succeeds when n8n returns no ticket number', async () => {
    const up = upstream(true, () => Response.json({ ok: true }));
    expect(await read(await handleSubmission(post(SUPPORT), ENV, 'support', up.impl))).toEqual({
      status: 200,
      body: { ok: true },
    });
  });

  it('rejects a disallowed attachment', async () => {
    const res = await handleSubmission(post(SUPPORT, [new File(['x'], 'run.exe')]), ENV, 'support', upstream().impl);
    expect(await read(res)).toEqual({ status: 400, body: { error: 'validation', fields: ['attachments'] } });
  });

  it('reports an upstream failure', async () => {
    const up = upstream(true, () => new Response('down', { status: 500 }));
    expect(await read(await handleSubmission(post(CONTACT), ENV, 'contact', up.impl))).toEqual({
      status: 502,
      body: { error: 'upstream' },
    });
  });
});
