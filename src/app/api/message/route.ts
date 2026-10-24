import { NextResponse } from 'next/server';
import { fetchGuerrilla } from '@/lib/guerrillamail';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  if (!token || !id) {
    return NextResponse.json({ error: 'Token and ID are required' }, { status: 400 });
  }

  try {
    const res = await fetchGuerrilla({ f: 'fetch_email', email_id: id, sid_token: token });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch message details: ${res.status} ${errText}`);
    }
    const m = await res.json();

    // Guerrilla Mail always returns mail_body as HTML-safe markup (even
    // plain-text messages come wrapped in <pre>), so render it via the
    // iframe path rather than splitting on content_type.
    const message = {
      id: m.mail_id,
      from: m.mail_from,
      subject: m.mail_subject,
      date: m.mail_timestamp ? new Date(m.mail_timestamp * 1000).toISOString() : m.mail_date,
      textBody: '',
      htmlBody: m.mail_body || '',
    };

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error fetching message details:', error);
    return NextResponse.json({ error: error.message || 'Failed to read message' }, { status: 500 });
  }
}
