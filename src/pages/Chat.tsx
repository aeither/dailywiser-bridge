'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ node, inline, className, children, ...props }: any) => {
                          return inline ? (
                            <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-gray-200 dark:bg-gray-700 p-3 rounded text-sm font-mono overflow-x-auto" {...props}>
                              {children}
                            </code>
                          );
                        },
                        a: ({ node, children, ...props }: any) => (
                          <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props}>
                            {children}
                          </a>
                        ),
                        ul: ({ node, children, ...props }: any) => (
                          <ul className="list-disc list-inside space-y-1" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ node, children, ...props }: any) => (
                          <ol className="list-decimal list-inside space-y-1" {...props}>
                            {children}
                          </ol>
                        ),
                        blockquote: ({ node, children, ...props }: any) => (
                          <blockquote className="border-l-4 border-blue-500 pl-3 italic text-gray-600 dark:text-gray-400" {...props}>
                            {children}
                          </blockquote>
                        ),
                        h1: ({ node, children, ...props }: any) => (
                          <h1 className="text-xl font-bold mt-4 mb-2" {...props}>{children}</h1>
                        ),
                        h2: ({ node, children, ...props }: any) => (
                          <h2 className="text-lg font-bold mt-3 mb-2" {...props}>{children}</h2>
                        ),
                        h3: ({ node, children, ...props }: any) => (
                          <h3 className="text-base font-bold mt-2 mb-1" {...props}>{children}</h3>
                        ),
                      }}
                    >
                      {part.text}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Dynamic tool calls */}
                {part.type === 'dynamic-tool' && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="font-mono text-sm font-semibold text-blue-600">
                      🔧 {part.toolName || 'Tool Call'}
                    </div>

                    {'input' in part && part.input && (
                      <div className="text-xs text-gray-500 mt-1">
                        Arguments: <pre className="inline">{JSON.stringify(part.input, null, 2)}</pre>
                      </div>
                    )}

                    {'output' in part && part.output && (
                      <details className="mt-2" open>
                        <summary className="cursor-pointer text-sm text-green-600">
                          ✅ View Result
                        </summary>
                        <div className="mt-2 text-sm bg-gray-50 p-2 rounded overflow-auto max-h-40">
                          {(part.output as any).content?.map((contentItem: any, contentIdx: number) => (
                            <div key={contentIdx}>
                              {contentItem.type === 'text' && (
                                <pre className="text-xs whitespace-pre-wrap">{contentItem.text}</pre>
                              )}
                            </div>
                          ))}
                        </div>
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
