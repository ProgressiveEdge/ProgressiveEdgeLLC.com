const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Asks Cloudflare whether a Turnstile token is valid and was solved on `expectedHostname`,
 * the host the form was posted to. Any network error, timeout or unexpected answer counts
 * as "not verified".
 */
export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string | null,
  expectedHostname: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteIp) body.append('remoteip', remoteIp);
  try {
    const res = await fetchImpl(SITEVERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: unknown; hostname?: unknown };
    return data.success === true && data.hostname === expectedHostname;
  } catch {
    return false;
  }
}
