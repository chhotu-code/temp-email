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
  // Unreachable, but keeps TypeScript happy
  return fetch(url, options);
}

export async function GET() {
  try {
    // 1. Get domain
    const dRes = await fetchWithRetry(`${MAIL_API_BASE}/domains`, {
      headers: { ...COMMON_HEADERS, ...mailProxyHeaders() },
      next: { revalidate: 300 },
    });

    if (!dRes.ok) {
      const errText = await dRes.text().catch(() => '');
      console.error(`Mail.tm domains error (${dRes.status}):`, errText);
      throw new Error(`Failed to fetch domains: ${dRes.status} ${errText}`);
    }

    const dData = await dRes.json();
    const domainList = Array.isArray(dData) ? dData : (dData['hydra:member'] || []);

    if (!domainList || domainList.length === 0) {
      throw new Error('No available domains found from mail.tm');
    }

    const domain = domainList[0].domain;

    // 2. Generate email
    const prefix = Math.random().toString(36).substring(2, 12);
    const address = `${prefix}@${domain}`;
    const password = getPassword(address);

    // 3. Create account
    const cRes = await fetchWithRetry(`${MAIL_API_BASE}/accounts`, {
      method: 'POST',
      headers: { ...COMMON_HEADERS, ...mailProxyHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });

    if (!cRes.ok) {
      const errText = await cRes.text().catch(() => '');
      console.error(`Mail.tm create account error (${cRes.status}):`, errText);
      throw new Error(`Failed to create account: ${cRes.status} ${errText}`);
    }

    return NextResponse.json({ email: address });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email' }, { status: 500 });
  }
}
