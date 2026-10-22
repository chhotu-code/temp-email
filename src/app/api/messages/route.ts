import { NextResponse } from 'next/server';
import { fetchGuerrilla } from '@/lib/guerrillamail';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    // get_email_list returns the persistent inbox state; check_email instead
    // behaves like a draining notification queue (returns each message only
    // once per session, even with seq=0), which made messages vanish after
    // the first refresh.
    const res = await fetchGuerrilla({ f: 'get_email_list', offset: '0', sid_token: token });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch messages: ${res.status} ${errText}`);
    }
    const data = await res.json();

    const messages = (data.list || []).map((m: any) => ({
      id: m.mail_id,
      from: m.mail_from,
      subject: m.mail_subject,
      date: m.mail_timestamp ? new Date(m.mail_timestamp * 1000).toISOString() : m.mail_date,
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}
