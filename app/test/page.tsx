'use client';

import { useState, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function TestPage() {
  const [ready, setReady] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', {
          method: 'POST'
        });
        const { client_secret } = await res.json();
        setSecret(client_secret.substring(0, 20) + '...');
        return client_secret;
      }
    },
    workflowId: process.env.NEXT_PUBLIC_TOPIC_GEN_WORKFLOW_ID || ''
  });

  useEffect(() => {
    if (control) setReady(true);
  }, [control]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          ChatKit + Agent Builder Test
        </h1>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm">
            <strong>Status:</strong> {ready ? '✅ Ready' : '⏳ Initializing...'}
          </p>
          <p className="text-sm">
            <strong>Session:</strong> {secret || 'Not created yet'}
          </p>
          <p className="text-sm">
            <strong>Workflow:</strong> {process.env.NEXT_PUBLIC_TOPIC_GEN_WORKFLOW_ID?.substring(0, 20)}...
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg h-[600px]">
          {control && (
            <ChatKit
              control={control}
              className="h-full"
            />
          )}
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            <strong>Test:</strong> Type "Generate 4 LinkedIn hooks" and press Enter
          </p>
        </div>
      </div>
    </div>
  );
}
