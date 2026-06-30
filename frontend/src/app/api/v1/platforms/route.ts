import { NextResponse } from 'next/server';

const platforms = [
  { id: 'messenger', name: 'Facebook Messenger', type: 'messenger', connected: true, icon: 'MessageCircle' },
  { id: 'facebook', name: 'Facebook Page', type: 'facebook', connected: true, icon: 'Facebook' },
  { id: 'whatsapp', name: 'WhatsApp', type: 'whatsapp', connected: false, icon: 'Phone' },
  { id: 'instagram', name: 'Instagram', type: 'instagram', connected: false, icon: 'Instagram' },
  { id: 'telegram', name: 'Telegram', type: 'telegram', connected: false, icon: 'Send' },
];

export async function GET() {
  return NextResponse.json({ data: platforms });
}
