// Base URL for the mail.tm API. Point this at a proxy (MAIL_API_BASE_URL env var)
// to avoid Vercel's shared IPs getting rate-limited by mail.tm directly.
export const MAIL_API_BASE = process.env.MAIL_API_BASE_URL || 'https://api.mail.tm';

// Shared secret forwarded to the proxy so only this app can use it.
// Has no effect when talking to api.mail.tm directly.
export function mailProxyHeaders(): Record<string, string> {
  const secret = process.env.MAIL_PROXY_SECRET;
  return secret ? { 'X-Proxy-Secret': secret } : {};
}
