import { NextResponse } from 'next/server';
import { MAIL_API_BASE, mailProxyHeaders } from '@/lib/mailtm';

export const dynamic = 'force-dynamic';

const getPassword = (email: string) => email + "_Secr3t!";

const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, application/ld+json',
};

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 || attempt === retries) return res;

    const retryAfter = Number(res.headers.get('retry-after'));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 2000)
      : 300 * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return fetch(url, options);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const id = searchParams.get('id');

  if (!email || !id) {
    return NextResponse.json({ error: 'Email and ID are required' }, { status: 400 });
  }

  const password = getPassword(email);

  try {
    // 1. Get Token
    const tRes = await fetchWithRetry(`${MAIL_API_BASE}/token`, {
      method: 'POST',
      headers: { ...COMMON_HEADERS, ...mailProxyHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password }),
      cache: 'no-store',
    });

    if (!tRes.ok) {
      const errText = await tRes.text().catch(() => '');
      console.error(`Mail.tm token error (${tRes.status}):`, errText);
      throw new Error(`Failed to get token: ${tRes.status} ${errText}`);
    }
    const tData = await tRes.json();
    const token = tData.token;

    // 2. Get Single Message
    const mRes = await fetchWithRetry(`${MAIL_API_BASE}/messages/${id}`, {
      headers: { ...COMMON_HEADERS, ...mailProxyHeaders(), 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!mRes.ok) {
      const errText = await mRes.text().catch(() => '');
      console.error(`Mail.tm message detail error (${mRes.status}):`, errText);
      throw new Error(`Failed to fetch message details: ${mRes.status} ${errText}`);
    }
    const m = await mRes.json();

    const htmlContent = Array.isArray(m.html) ? m.html[0] : (typeof m.html === 'string' ? m.html : '');

    const message = {
      id: m.id,
      from: typeof m.from === 'object' ? (m.from.address || m.from.name) : (m.from || ''),
      subject: m.subject || '',
      date: m.createdAt,
      textBody: m.text || '',
      htmlBody: htmlContent
    };

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error fetching message details:', error);
    return NextResponse.json({ error: error.message || 'Failed to read message' }, { status: 500 });
  }
}
