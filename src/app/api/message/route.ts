import { NextResponse } from 'next/server';

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
    const tRes = await fetch('https://api.mail.tm/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password })
    });
    
    if (!tRes.ok) throw new Error('Failed to get token');
    const tData = await tRes.json();
    const token = tData.token;

    // 2. Get Single Message
    const mRes = await fetch(`https://api.mail.tm/messages/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!mRes.ok) throw new Error('Failed to fetch message details');
    const m = await mRes.json();
    
    const message = {
        id: m.id,
        from: m.from.address || m.from.name,
        subject: m.subject,
        date: m.createdAt,
        textBody: m.text || '',
        htmlBody: m.html ? m.html[0] : ''
    };

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error fetching message details:', error);
    return NextResponse.json({ error: error.message || 'Failed to read message' }, { status: 500 });
  }
}
