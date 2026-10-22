import { NextResponse } from 'next/server';
import { MAIL_API_BASE, mailProxyHeaders } from '@/lib/mailtm';

const getPassword = (email: string) => email + "_Secr3t!";

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
      headers: { 'Content-Type': 'application/json', ...mailProxyHeaders() },
      body: JSON.stringify({ address: email, password })
    });

    if (!tRes.ok) {
      const body = await tRes.text().catch(() => '');
      throw new Error(`Failed to get token: ${tRes.status} ${body}`);
    }
    const tData = await tRes.json();
    const token = tData.token;

    // 2. Get Messages
    const mRes = await fetchWithRetry(`${MAIL_API_BASE}/messages`, {
      headers: { 'Authorization': `Bearer ${token}`, ...mailProxyHeaders() }
    });

    if (!mRes.ok) {
      const body = await mRes.text().catch(() => '');
      throw new Error(`Failed to fetch messages: ${mRes.status} ${body}`);
    }
    const mData = await mRes.json();
    
    const messages = mData['hydra:member'].map((m: any) => ({
        id: m.id,
        from: m.from.address || m.from.name,
        subject: m.subject,
        date: m.createdAt
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}
