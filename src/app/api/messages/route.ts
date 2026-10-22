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

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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

    // 2. Get Messages
    const mRes = await fetchWithRetry(`${MAIL_API_BASE}/messages`, {
      headers: { ...COMMON_HEADERS, ...mailProxyHeaders(), 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!mRes.ok) {
      const errText = await mRes.text().catch(() => '');
      console.error(`Mail.tm messages error (${mRes.status}):`, errText);
      throw new Error(`Failed to fetch messages: ${mRes.status} ${errText}`);
    }
    const mData = await mRes.json();

    const memberList = Array.isArray(mData) ? mData : (mData['hydra:member'] || []);

    const messages = memberList.map((m: any) => ({
      id: m.id,
      from: typeof m.from === 'object' ? (m.from.address || m.from.name) : (m.from || ''),
      subject: m.subject || '',
      date: m.createdAt
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}
