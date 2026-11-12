export type ForwardResult = { ok: true; data: Record<string, unknown> } | { ok: false };

/**
 * POSTs a form to an n8n webhook as multipart/form-data with the shared-secret header.
 * Never throws: a network error, timeout or non-2xx answer is { ok: false }.
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
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { ok: false };
    const data: unknown = await res.json().catch(() => ({}));
    return { ok: true, data: data !== null && typeof data === 'object' ? (data as Record<string, unknown>) : {} };
  } catch {
    return { ok: false };
  }
}
