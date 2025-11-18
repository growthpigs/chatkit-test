import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get workflow ID from request body, fallback to env var
    const body = await request.json().catch(() => ({}));
    const workflowId = body.workflowId || process.env.NEXT_PUBLIC_TOPIC_GEN_WORKFLOW_ID;

    if (!workflowId) {
      return NextResponse.json(
        { error: 'No workflow ID provided' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1'
      },
      body: JSON.stringify({
        workflow: {
          id: workflowId
        },
        user: `user-${Date.now()}`
      })
    });

    const data = await response.json();

    // Check if OpenAI API call failed
    if (!response.ok) {
      console.error('[SESSION] OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: data
      });
      return NextResponse.json(
        { error: data.error?.message || `OpenAI API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Check if client_secret exists in response
    if (!data.client_secret) {
      console.error('[SESSION] No client_secret in response:', data);
      return NextResponse.json(
        { error: 'No client_secret returned from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      client_secret: data.client_secret
    });
  } catch (error: any) {
    console.error('[SESSION] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}
