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

    const messages = (data.list || []).map((m: any) => {
      let isoDate = new Date().toISOString();
      if (m.mail_timestamp && Number(m.mail_timestamp) > 0) {
        isoDate = new Date(Number(m.mail_timestamp) * 1000).toISOString();
      } else if (m.mail_date) {
        const parsed = new Date(m.mail_date);
        if (!isNaN(parsed.getTime())) {
          isoDate = parsed.toISOString();
        } else {
          // If it's a time string (e.g., "09:44:33"), merge with today's date
          const today = new Date().toISOString().split('T')[0];
          const combined = new Date(`${today}T${m.mail_date}Z`);
          if (!isNaN(combined.getTime())) {
            isoDate = combined.toISOString();
          }
        }
      }

      return {
        id: String(m.mail_id),
        from: m.mail_from || 'Unknown Sender',
        subject: m.mail_subject || '(No Subject)',
        date: isoDate,
      };
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}
