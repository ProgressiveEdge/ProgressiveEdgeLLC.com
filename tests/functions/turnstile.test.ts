import { describe, it, expect } from 'vitest';
import { verifyTurnstile } from '../../functions/_lib/turnstile';
import { fakeFetch } from '../helpers';

describe('verifyTurnstile', () => {
  it('is false for an empty token without calling Cloudflare', async () => {
    const f = fakeFetch(() => Response.json({ success: true }));
    expect(await verifyTurnstile('', 'secret', '203.0.113.9', f.impl)).toBe(false);
    expect(f.calls).toHaveLength(0);
  });

  it('posts the secret, token and IP to siteverify and returns true on success', async () => {
    const f = fakeFetch(() => Response.json({ success: true }));
    expect(await verifyTurnstile('tok', 'secret', '203.0.113.9', f.impl)).toBe(true);
    expect(f.calls[0].url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(f.calls[0].init.method).toBe('POST');
    const body = f.calls[0].init.body as FormData;
    expect(body.get('secret')).toBe('secret');
    expect(body.get('response')).toBe('tok');
    expect(body.get('remoteip')).toBe('203.0.113.9');
  });

  it('omits remoteip when the IP is unknown', async () => {
    const f = fakeFetch(() => Response.json({ success: true }));
    await verifyTurnstile('tok', 'secret', null, f.impl);
    expect((f.calls[0].init.body as FormData).has('remoteip')).toBe(false);
  });

  it('is false when Cloudflare rejects the token', async () => {
    const f = fakeFetch(() => Response.json({ success: false, 'error-codes': ['invalid-input-response'] }));
    expect(await verifyTurnstile('tok', 'secret', null, f.impl)).toBe(false);
  });

  it('is false on a non-2xx answer', async () => {
    const f = fakeFetch(() => new Response('unavailable', { status: 503 }));
    expect(await verifyTurnstile('tok', 'secret', null, f.impl)).toBe(false);
  });

  it('is false when the request fails', async () => {
    const f = fakeFetch(() => {
      throw new Error('offline');
    });
    expect(await verifyTurnstile('tok', 'secret', null, f.impl)).toBe(false);
  });
});
