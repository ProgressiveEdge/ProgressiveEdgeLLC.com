export type ForwardResult = { ok: true; data: Record<string, unknown> } | { ok: false };

/**
 * POSTs a form to an n8n webhook as multipart/form-data with the shared-secret header.
 * Success is a 2xx answer whose JSON body has ok === true. Anything else (redirect, non-JSON,
 * other JSON, non-2xx, network error, timeout) is { ok: false }. Never throws.
 */
export async function forwardToN8n(
  url: string,
  secret: string,
  body: FormData,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 20_000,
): Promise<ForwardResult> {
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'X-PE-Webhook-Secret': secret },
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { ok: false };
    const data: unknown = await res.json().catch(() => null);
    if (data === null || typeof data !== 'object' || (data as Record<string, unknown>).ok !== true) return { ok: false };
    return { ok: true, data: data as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}
