import { NextResponse } from 'next/server';
import { MAIL_API_BASE, MAIL_COMMON_HEADERS, mailProxyHeaders, fetchMailTm } from '@/lib/mailtm';

export const dynamic = 'force-dynamic';

const getPassword = (email: string) => email + "_Secr3t!";

export async function GET() {
  try {
    // 1. Get domain
    const dRes = await fetchMailTm(`${MAIL_API_BASE}/domains`, {
      headers: { ...MAIL_COMMON_HEADERS, ...mailProxyHeaders() },
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
    const cRes = await fetchMailTm(`${MAIL_API_BASE}/accounts`, {
      method: 'POST',
      headers: { ...MAIL_COMMON_HEADERS, ...mailProxyHeaders(), 'Content-Type': 'application/json' },
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
