import { NextResponse } from 'next/server';
import { fetchGuerrilla } from '@/lib/guerrillamail';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Start a session and get a randomly-assigned address + session token
    const addrRes = await fetchGuerrilla({ f: 'get_email_address' });
    if (!addrRes.ok) {
      const errText = await addrRes.text().catch(() => '');
      throw new Error(`Failed to get email address: ${addrRes.status} ${errText}`);
    }
    const addrData = await addrRes.json();
    const sidToken = addrData.sid_token;

    // 2. Give it a random login name instead of the auto-assigned one,
    // keeping the same session token.
    const prefix = Math.random().toString(36).substring(2, 12);
    const userRes = await fetchGuerrilla({ f: 'set_email_user', email_user: prefix, sid_token: sidToken });
    if (!userRes.ok) {
      const errText = await userRes.text().catch(() => '');
      throw new Error(`Failed to set email address: ${userRes.status} ${errText}`);
    }
    const userData = await userRes.json();

    return NextResponse.json({ email: userData.email_addr, token: userData.sid_token });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email' }, { status: 500 });
  }
}
