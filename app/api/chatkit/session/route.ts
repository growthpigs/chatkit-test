import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  try {
    // Dynamic import to avoid build-time execution
    const { default: OpenAI } = await import('openai');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const session = await openai.chatkit.sessions.create({
      user: 'test-user-' + Date.now(),
      metadata: {
        test: true
      }
    });

    return NextResponse.json({
      client_secret: session.client_secret
    });
  } catch (error: any) {
    console.error('[SESSION] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
