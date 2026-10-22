// Guerrilla Mail (https://www.guerrillamail.com) is used instead of mail.tm,
// which started rejecting requests from Vercel's IP range specifically
// (confirmed: identical requests succeed from any other IP, fail 100% of
// the time from the deployed app). Guerrilla Mail has no such block so far.
//
// Session model: get_email_address/set_email_user return a sid_token that
// acts as the session key for check_email/fetch_email. Unlike mail.tm there
// is no password to re-derive it from, so the token must be returned to the
// client and sent back on every subsequent request.

export const GUERRILLA_API_BASE = process.env.GUERRILLA_API_BASE_URL || 'https://api.guerrillamail.com/ajax.php';

export const GUERRILLA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

export async function fetchGuerrilla(params: Record<string, string>, retries = 2): Promise<Response> {
  const url = `${GUERRILLA_API_BASE}?${new URLSearchParams(params).toString()}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: GUERRILLA_HEADERS, cache: 'no-store' });
    if ((res.status !== 429 && res.status < 500) || attempt === retries) return res;
    await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
  }
  // Unreachable, but keeps TypeScript happy
  return fetch(url, { headers: GUERRILLA_HEADERS });
}
