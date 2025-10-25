// src/components/BlockchainChat.tsx
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    error
  } = useChat({
    onFinish: ({ message, isError }) => {
      console.log('✅ Chat finished:', message);
      if (isError) {
        console.error('⚠️ Finished with error');
      }
    },
    onError: (error) => {
      console.error('❌ Chat error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
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
                {part.type === 'text' && (
                  <div className="whitespace-pre-wrap">{part.text}</div>
                )}

                {part.type.startsWith('tool-') && 'state' in part && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="font-mono text-sm font-semibold text-blue-600">
                      🔧 {part.type.replace('tool-', '')}
                    </div>

                    {part.state === 'input-streaming' && (
                      <div className="text-xs text-yellow-600 mt-1">
                        ⏳ Streaming input...
                      </div>
                    )}

                    {part.state === 'input-available' && 'input' in part && (
                      <div className="text-xs text-gray-500 mt-1">
                        Arguments: {JSON.stringify(part.input, null, 2)}
                      </div>
                    )}

                    {(part.state === 'streaming' || part.state === 'done' || part.state === 'output-available') && 'output' in part && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-green-600">
                          ✅ View Result
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(part.output, null, 2)}
                        </pre>
                      </details>
                    )}

                    {part.state === 'output-error' && 'errorText' in part && (
                      <div className="text-xs text-red-600 mt-1">
                        ❌ Error: {part.errorText}
                      </div>
                    )}
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
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about blockchain data (addresses, tokens, NFTs, transactions)..."
          disabled={isLoading}
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳ Querying...' : '📤 Send'}
        </button>
      </form>
    </div>
  );
}
