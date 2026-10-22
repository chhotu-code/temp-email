import { NextResponse } from 'next/server';
import { MAIL_API_BASE, MAIL_COMMON_HEADERS, mailProxyHeaders, fetchMailTm } from '@/lib/mailtm';

export const dynamic = 'force-dynamic';

const getPassword = (email: string) => email + "_Secr3t!";

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

    // 2. Get Single Message
    const mRes = await fetchMailTm(`${MAIL_API_BASE}/messages/${id}`, {
      headers: { ...MAIL_COMMON_HEADERS, ...mailProxyHeaders(), 'Authorization': `Bearer ${token}` },
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
