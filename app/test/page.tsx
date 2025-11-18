'use client';

import { useState, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

// Define available workflows
const WORKFLOWS = [
  {
    id: 'wf_691b16f6c53481909a9c097291421894069b305b446643df',
    name: 'LinkedIn Hook Generator',
    description: 'Generate compelling LinkedIn hooks for any topic'
  },
  // Add more workflows here as you create them
  // {
  //   id: 'wf_another_workflow_id',
  //   name: 'Email Subject Lines',
  //   description: 'Generate email subject line variations'
  // },
];

function ChatKitWrapper({ workflow, onReady, onError }: {
  workflow: typeof WORKFLOWS[0],
  onReady: () => void,
  onError: (err: string) => void
}) {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        try {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              workflowId: workflow.id
            })
          });

          if (!res.ok) {
            throw new Error(`Session creation failed: ${res.status}`);
          }

          const { client_secret, error } = await res.json();

          if (error) {
            throw new Error(error);
          }

          console.log('✅ Client secret obtained for:', workflow.name);
          return client_secret;
        } catch (err: any) {
          console.error('❌ Session error:', err);
          onError(err.message);
          throw err;
        }
      }
    }
  });

  useEffect(() => {
    if (control) {
      onReady();
      console.log('✅ ChatKit ready');
    }
  }, [control, onReady]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {control ? (
        <ChatKit
          control={control}
          className="h-[480px] w-full"
        />
      ) : (
        <div className="h-[480px] flex items-center justify-center text-gray-500 text-sm">
          Loading ChatKit...
        </div>
      )}
    </div>
  );
}

export default function TestPage() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(WORKFLOWS[0]);
  const [sessionKey, setSessionKey] = useState(0); // Force re-mount on workflow change

  // Handle workflow change
  const handleWorkflowChange = (workflowId: string) => {
    const workflow = WORKFLOWS.find(w => w.id === workflowId);
    if (workflow) {
      setSelectedWorkflow(workflow);
      setReady(false);
      setError(null);
      setSessionKey(prev => prev + 1); // Force re-mount
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 80% scale container */}
      <div className="max-w-5xl mx-auto" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
        <h1 className="text-2xl font-bold mb-1">
          ChatKit + Agent Builder Test
        </h1>
        <p className="text-gray-600 text-sm mb-4">
          Testing OpenAI workflow execution
        </p>

        {/* Workflow Selector */}
        <div className="mb-3 p-3 bg-white border rounded-lg shadow-sm">
          <label className="block text-sm font-semibold mb-2">Select Workflow:</label>
          <select
            value={selectedWorkflow.id}
            onChange={(e) => handleWorkflowChange(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            {WORKFLOWS.map(workflow => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name} - {workflow.description}
              </option>
            ))}
          </select>
        </div>

        {/* Status Panel */}
        <div className="mb-3 p-3 bg-white border rounded-lg shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Status:</span>
              {ready ? (
                <span className="text-green-600">✅ Ready</span>
              ) : error ? (
                <span className="text-red-600">❌ Error</span>
              ) : (
                <span className="text-yellow-600">⏳ Initializing...</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Workflow:</span>
              <span className="text-blue-600 font-medium">{selectedWorkflow.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">ID:</span>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {selectedWorkflow.id.substring(0, 30)}...
              </code>
            </div>

            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-700 font-semibold">Error:</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* ChatKit Component */}
        <ChatKitWrapper
          key={sessionKey}
          workflow={selectedWorkflow}
          onReady={() => setReady(true)}
          onError={(err) => setError(err)}
        />

        {/* Instructions */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 text-sm mb-1.5">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-0.5 text-xs text-blue-800">
            <li>Select a workflow from the dropdown above</li>
            <li>Wait for "Status: ✅ Ready"</li>
            <li>Type: "Generate 4 LinkedIn hooks for SaaS marketing"</li>
            <li>Press Enter and watch the workflow execute</li>
            <li>Try switching workflows to test different agents</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
