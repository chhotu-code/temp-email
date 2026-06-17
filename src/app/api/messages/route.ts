import { NextResponse } from 'next/server';

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
    const tRes = await fetch('https://api.mail.tm/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password })
    });
    
    if (!tRes.ok) throw new Error('Failed to get token');
    const tData = await tRes.json();
    const token = tData.token;

    // 2. Get Messages
    const mRes = await fetch('https://api.mail.tm/messages', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!mRes.ok) throw new Error('Failed to fetch messages');
    const mData = await mRes.json();
    
    const messages = mData['hydra:member'].map((m: any) => ({
        id: m.id,
        from: m.from.address || m.from.name,
        subject: m.subject,
        date: m.createdAt
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}
