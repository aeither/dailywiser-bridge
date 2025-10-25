'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    error
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onFinish: ({ message }) => {
      console.log('✅ Chat finished:', message);
    },
    onError: (error) => {
      console.error('❌ Chat error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput('');
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-2">
              {message.role === 'user' ? '👤 You' : '🤖 AI'}
            </div>

            {/* Render message parts */}
            {message.parts.map((part, idx) => (
              <div key={idx}>
                {/* Text parts */}
                {part.type === 'text' && (
                  <div className="whitespace-pre-wrap">{part.text}</div>
                )}

                {/* Dynamic tool calls */}
                {part.type === 'dynamic-tool' && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="font-mono text-sm font-semibold text-blue-600">
                      🔧 {part.toolName || 'Tool Call'}
                    </div>
                    
                    {'args' in part && (
                      <div className="text-xs text-gray-500 mt-1">
                        Arguments: <pre className="inline">{JSON.stringify(part.args, null, 2)}</pre>
                      </div>
                    )}

                    {'result' in part && part.result && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-green-600">
                          ✅ View Result
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(part.result, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Reasoning parts */}
                {part.type === 'reasoning' && (
                  <details className="mt-2 p-3 bg-purple-50 rounded border border-purple-200">
                    <summary className="cursor-pointer text-sm font-semibold text-purple-700">
                      🧠 Reasoning Process
                    </summary>
                    <pre className="mt-2 text-xs whitespace-pre-wrap">
                      {part.text}
                    </pre>
                  </details>
                )}

                {/* File attachments */}
                {part.type === 'file' && (
                  <div className="mt-2">
                    {part.mediaType?.startsWith('image/') ? (
                      <img 
                        src={part.url} 
                        alt={part.filename || 'Attachment'} 
                        className="max-w-sm rounded border"
                      />
                    ) : (
                      <a 
                        href={part.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        📎 {part.filename || 'Download file'}
                      </a>
                    )}
                  </div>
                )}

                {/* Source URLs */}
                {part.type === 'source-url' && (
                  <div className="mt-2 text-sm">
                    <a 
                      href={part.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🔗 {part.title || new URL(part.url).hostname}
                    </a>
                  </div>
                )}

                {/* Source documents */}
                {part.type === 'source-document' && (
                  <div className="mt-2 text-sm text-gray-600">
                    📄 {part.title || `Document ${part.sourceId}`}
                  </div>
                )}

                {/* Step start */}
                {part.type === 'step-start' && (
                  <div className="mt-2 text-xs text-gray-500 italic">
                    ⚙️ Starting step...
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            ❌ Error: {error.message}
          </div>
        )}

        {isLoading && (
          <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="font-semibold mb-2">🤖 AI</div>
            <div className="text-gray-500">Thinking...</div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about blockchain data..."
          disabled={status !== 'ready'}
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={status !== 'ready'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '⏳ Querying...' : '📤 Send'}
        </button>
      </form>
    </div>
  );
}
