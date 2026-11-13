export interface FetchCall {
  url: string;
  init: RequestInit;
}

/** A stand-in for fetch that records each call and answers with `respond`. */
export function fakeFetch(respond: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: FetchCall[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { url: String(input), init: init ?? {} };
    calls.push(call);
    return respond(call.url, call.init);
  }) as typeof fetch;
  return { impl, calls };
}
