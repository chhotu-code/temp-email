import { NextResponse } from 'next/server';
import { MAIL_API_BASE, MAIL_COMMON_HEADERS, mailProxyHeaders, fetchMailTm } from '@/lib/mailtm';

export const dynamic = 'force-dynamic';

const getPassword = (email: string) => email + "_Secr3t!";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const password = getPassword(email);

  try {
    // 1. Get Token
    const tRes = await fetchMailTm(`${MAIL_API_BASE}/token`, {
      method: 'POST',
      headers: { ...MAIL_COMMON_HEADERS, ...mailProxyHeaders(), 'Content-Type': 'application/json' },
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
    const mRes = await fetchMailTm(`${MAIL_API_BASE}/messages`, {
      headers: { ...MAIL_COMMON_HEADERS, ...mailProxyHeaders(), 'Authorization': `Bearer ${token}` },
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
