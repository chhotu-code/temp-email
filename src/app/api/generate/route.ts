import { NextResponse } from 'next/server';

const getPassword = (email: string) => email + "_Secr3t!";

export async function GET() {
  try {
    // 1. Get domain
    const dRes = await fetch('https://api.mail.tm/domains');
    if (!dRes.ok) throw new Error('Failed to fetch domains');
    const dData = await dRes.json();
    const domain = dData['hydra:member'][0].domain;

    // 2. Generate email
    const prefix = Math.random().toString(36).substring(2, 12);
    const address = `${prefix}@${domain}`;
    const password = getPassword(address);

    // 3. Create account
    const cRes = await fetch('https://api.mail.tm/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password })
    });

    if (!cRes.ok) {
      throw new Error(`Failed to create account: ${cRes.status}`);
    }

    return NextResponse.json({ email: address });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email' }, { status: 500 });
  }
}
