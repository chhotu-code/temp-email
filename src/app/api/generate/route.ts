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
  // Unreachable, but keeps TypeScript happy
  return fetch(url, options);
}

export async function GET() {
  try {
    // 1. Get domain
    const dRes = await fetchWithRetry(`${MAIL_API_BASE}/domains`, {
      headers: mailProxyHeaders(),
      next: { revalidate: 300 },
    });
    if (!dRes.ok) {
      const body = await dRes.text().catch(() => '');
      throw new Error(`Failed to fetch domains: ${dRes.status} ${body}`);
    }
    const dData = await dRes.json();
    const domain = dData['hydra:member'][0].domain;

    // 2. Generate email
    const prefix = Math.random().toString(36).substring(2, 12);
    const address = `${prefix}@${domain}`;
    const password = getPassword(address);

    // 3. Create account
    const cRes = await fetchWithRetry(`${MAIL_API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...mailProxyHeaders() },
      body: JSON.stringify({ address, password })
    });

    if (!cRes.ok) {
      const body = await cRes.text().catch(() => '');
      throw new Error(`Failed to create account: ${cRes.status} ${body}`);
    }

    return NextResponse.json({ email: address });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email' }, { status: 500 });
  }
}
