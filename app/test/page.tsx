'use client';

import { useState, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function TestPage() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        try {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!res.ok) {
            throw new Error(`Session creation failed: ${res.status}`);
          }

          const { client_secret, error } = await res.json();

          if (error) {
            throw new Error(error);
          }

          console.log('✅ Client secret obtained');
          return client_secret;
        } catch (err: any) {
          console.error('❌ Session error:', err);
          setError(err.message);
          throw err;
        }
      }
    }
  });

  useEffect(() => {
    if (control) {
      setReady(true);
      console.log('✅ ChatKit ready');
    }
  }, [control]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          ChatKit + Agent Builder Test
        </h1>
        <p className="text-gray-600 mb-6">
          Testing OpenAI AgentKit integration
        </p>

        {/* Status Panel */}
        <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              {ready ? (
                <span className="text-green-600">✅ Ready</span>
              ) : error ? (
                <span className="text-red-600">❌ Error</span>
              ) : (
                <span className="text-yellow-600">⏳ Initializing...</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Workflow:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_TOPIC_GEN_WORKFLOW_ID?.substring(0, 20)}...
              </code>
            </div>

            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700 font-semibold">Error:</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* ChatKit Component */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {control ? (
            <ChatKit
              control={control}
              className="h-[600px] w-full"
            />
          ) : (
            <div className="h-[600px] flex items-center justify-center text-gray-500">
              {error ? 'Failed to initialize ChatKit' : 'Loading ChatKit...'}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Wait for "Status: ✅ Ready"</li>
            <li>Type: "Generate 4 LinkedIn hooks for SaaS marketing"</li>
            <li>Press Enter</li>
            <li>Watch Agent Builder workflow execute</li>
            <li>Verify AI response appears</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
