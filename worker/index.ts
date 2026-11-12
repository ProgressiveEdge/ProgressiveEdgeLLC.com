import { handleSubmission, type Env as FormEnv } from '../functions/_lib/handle';

/** The binding Cloudflare provides for the static files in dist/ (see wrangler.jsonc). */
interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface Env extends FormEnv {
  ASSETS: AssetsBinding;
}

// Cloudflare serves any request that matches a file in dist/ before this code runs.
// Everything else lands here: the two form endpoints, or the assets' 404 page.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') return handleSubmission(request, env, 'contact');
    if (pathname === '/api/support') return handleSubmission(request, env, 'support');
    return env.ASSETS.fetch(request);
  },
};
