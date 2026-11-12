import { handleSubmission, type Env } from '../_lib/handle';

// Cloudflare Pages Function for /api/support. Every method reaches the handler, which answers 405 to non-POST.
export const onRequest = (context: { request: Request; env: Env }): Promise<Response> =>
  handleSubmission(context.request, context.env, 'support');
