// Base URL for the mail.tm API. Point this at a proxy (MAIL_API_BASE_URL env var)
// to avoid Vercel's shared IPs getting rate-limited by mail.tm directly.
export const MAIL_API_BASE = process.env.MAIL_API_BASE_URL || 'https://api.mail.tm';

// Shared secret forwarded to the proxy so only this app can use it.
// Has no effect when talking to api.mail.tm directly.
export function mailProxyHeaders(): Record<string, string> {
  const secret = process.env.MAIL_PROXY_SECRET;
  return secret ? { 'X-Proxy-Secret': secret } : {};
}

export const MAIL_COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, application/ld+json',
};

// mail.tm is a free, flaky API: retry on rate-limiting (429) and transient
// server errors (5xx), since it occasionally bounces those under load.
export async function fetchMailTm(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if ((res.status !== 429 && res.status < 500) || attempt === retries) return res;

    const retryAfter = Number(res.headers.get('retry-after'));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 2000)
      : 300 * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  // Unreachable, but keeps TypeScript happy
  return fetch(url, options);
}
