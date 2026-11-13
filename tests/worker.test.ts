import { describe, it, expect } from 'vitest';
import worker, { type Env } from '../worker/index';

/** A Worker env whose ASSETS binding records which paths it was asked for. */
function makeEnv(assetResponse: () => Response = () => new Response('asset')) {
  const assetPaths: string[] = [];
  const env: Env = {
    TURNSTILE_SECRET_KEY: 'ts-secret',
    N8N_CONTACT_WEBHOOK_URL: 'https://n8n.test/webhook/website-contact',
    N8N_SUPPORT_WEBHOOK_URL: 'https://n8n.test/webhook/website-support',
    N8N_WEBHOOK_SECRET: 'hook-secret',
    ASSETS: {
      fetch: async (request: Request) => {
        assetPaths.push(new URL(request.url).pathname);
        return assetResponse();
      },
    },
  };
  return { env, assetPaths };
}

describe('worker', () => {
  it('sends /api/contact to the form handler', async () => {
    const { env, assetPaths } = makeEnv();
    const res = await worker.fetch(new Request('https://getproedge.org/api/contact'), env);
    expect(res.status).toBe(405); // a GET reaches the handler, which accepts only POST
    expect(res.headers.get('Allow')).toBe('POST');
    expect(assetPaths).toEqual([]);
  });

  it('sends /api/support to the form handler', async () => {
    const { env, assetPaths } = makeEnv();
    const res = await worker.fetch(new Request('https://getproedge.org/api/support'), env);
    expect(res.status).toBe(405);
    expect(assetPaths).toEqual([]);
  });

  it('hands every other path to the static assets', async () => {
    const { env, assetPaths } = makeEnv(() => new Response('not found', { status: 404 }));
    const res = await worker.fetch(new Request('https://getproedge.org/nope'), env);
    expect(res.status).toBe(404);
    expect(assetPaths).toEqual(['/nope']);
  });

  it('does not treat lookalike paths as form endpoints', async () => {
    const { env, assetPaths } = makeEnv();
    await worker.fetch(new Request('https://getproedge.org/api/contact/extra'), env);
    await worker.fetch(new Request('https://getproedge.org/api/contacts'), env);
    expect(assetPaths).toEqual(['/api/contact/extra', '/api/contacts']);
  });
});
