import { describe, it, expect } from 'vitest';
import { forwardToN8n } from '../../functions/_lib/forward';
import { fakeFetch } from '../helpers';

const URL_ = 'https://n8n.test/webhook/website-contact';

describe('forwardToN8n', () => {
  it('POSTs the form with the shared-secret header', async () => {
    const f = fakeFetch(() => Response.json({ ok: true }));
    const body = new FormData();
    body.append('name', 'Pat');
    await forwardToN8n(URL_, 'hook-secret', body, f.impl);
    expect(f.calls[0].url).toBe(URL_);
    expect(f.calls[0].init.method).toBe('POST');
    expect(new Headers(f.calls[0].init.headers).get('X-PE-Webhook-Secret')).toBe('hook-secret');
    expect(f.calls[0].init.body).toBe(body);
    expect(f.calls[0].init.redirect).toBe('manual');
  });

  it('returns the JSON answer on success', async () => {
    const f = fakeFetch(() => Response.json({ ok: true, ticketNumber: '10042' }));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({
      ok: true,
      data: { ok: true, ticketNumber: '10042' },
    });
  });

  it('fails on a non-JSON 2xx answer', async () => {
    const f = fakeFetch(() => new Response('Workflow was started'));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: false });
  });

  it('fails on a 2xx JSON answer without ok: true', async () => {
    const f = fakeFetch(() => Response.json({ received: true }));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: false });
  });

  it('fails on a redirect', async () => {
    const f = fakeFetch(() => new Response(null, { status: 302, headers: { Location: 'https://elsewhere.test/' } }));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: false });
  });

  it('fails on a non-2xx answer', async () => {
    const f = fakeFetch(() => new Response('error', { status: 500 }));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: false });
  });

  it('fails when the request throws', async () => {
    const f = fakeFetch(() => {
      throw new Error('connection refused');
    });
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: false });
  });

  it('fails when n8n does not answer before the timeout', async () => {
    const f = fakeFetch(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl, 20)).toEqual({ ok: false });
  });
});
