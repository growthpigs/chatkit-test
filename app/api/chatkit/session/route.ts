import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Use Node.js runtime (not edge) - OpenAI SDK requires Node.js APIs
export const runtime = 'nodejs';

export async function POST() {
  try {
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
