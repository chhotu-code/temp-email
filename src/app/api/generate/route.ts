import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getPassword = (email: string) => email + "_Secr3t!";

const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, application/ld+json',
};

export async function GET() {
  try {
    // 1. Get domain
    const dRes = await fetch('https://api.mail.tm/domains', {
      headers: COMMON_HEADERS,
      cache: 'no-store'
    });

    if (!dRes.ok) {
      const errText = await dRes.text();
      console.error(`Mail.tm domains error (${dRes.status}):`, errText);
      throw new Error(`Failed to fetch domains: HTTP ${dRes.status}`);
    }

    const dData = await dRes.json();
    const domainList = Array.isArray(dData)
      ? dData
      : (dData['hydra:member'] || []);

    if (!domainList || domainList.length === 0) {
      throw new Error('No available domains found from mail.tm');
    }

    const domain = domainList[0].domain;

    // 2. Generate email
    const prefix = Math.random().toString(36).substring(2, 12);
    const address = `${prefix}@${domain}`;
    const password = getPassword(address);

    // 3. Create account
    const cRes = await fetch('https://api.mail.tm/accounts', {
      method: 'POST',
      headers: {
        ...COMMON_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address, password }),
      cache: 'no-store'
    });

    if (!cRes.ok) {
      const errText = await cRes.text();
      console.error(`Mail.tm create account error (${cRes.status}):`, errText);
      throw new Error(`Failed to create account: HTTP ${cRes.status}`);
    }

    return NextResponse.json({ email: address });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email' }, { status: 500 });
  }
}
