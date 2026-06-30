import { NextRequest, NextResponse } from 'next/server';
import { pollinationsGenerateImage } from '@/lib/ai-engine/pollinations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model, size, negativePrompt, seed, enhance } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال النص' }, { status: 400 });
    }

    const images = await pollinationsGenerateImage({
      prompt: prompt.trim(),
      model: model || 'flux',
      size: size || '1024x1024',
      negativePrompt,
      seed,
      enhance,
    });

    return NextResponse.json({ data: images, provider: 'pollinations' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إنشاء الصورة' }, { status: 500 });
  }
}
