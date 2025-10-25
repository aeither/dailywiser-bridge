'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function FloatingChat() {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Floating Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[400px] h-[600px] flex flex-col shadow-2xl border-primary/20 z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-primary p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">AI Blockchain Assistant</h3>
              <p className="text-white/80 text-xs">Powered by Blockscout MCP</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Ask me anything about blockchain data!</p>
                <p className="text-xs mt-2">Try: "Show me recent transactions for an address"</p>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-70">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>

                  {/* Render message parts */}
                  {message.parts.map((part, idx) => (
                    <div key={idx}>
                      {/* Text parts */}
                      {part.type === 'text' && (
                        <div className="text-sm whitespace-pre-wrap">{part.text}</div>
                      )}

                      {/* Dynamic tool calls */}
                      {part.type === 'dynamic-tool' && (
                        <div className="mt-2 p-2 bg-background/50 rounded border text-xs">
                          <div className="font-mono font-semibold text-primary">
                            🔧 {part.toolName || 'Tool Call'}
                          </div>

                          {'input' in part && part.input && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <pre className="text-[10px] overflow-x-auto">{JSON.stringify(part.input, null, 2)}</pre>
                            </div>
                          )}

                          {'output' in part && part.output && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-primary">
                                ✅ View Result
                              </summary>
                              <div className="mt-1 text-xs bg-background p-2 rounded overflow-auto max-h-32">
                                {(part.output as any).content?.map((contentItem: any, contentIdx: number) => (
                                  <div key={contentIdx}>
                                    {contentItem.type === 'text' && (
                                      <pre className="text-[10px] whitespace-pre-wrap">{contentItem.text}</pre>
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
                        <details className="mt-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                          <summary className="cursor-pointer text-xs font-semibold text-purple-700 dark:text-purple-300">
                            🧠 Reasoning
                          </summary>
                          <pre className="mt-1 text-[10px] whitespace-pre-wrap">
                            {part.text}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                ❌ Error: {error.message}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                  <div className="text-xs font-semibold mb-1 opacity-70">AI Assistant</div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-muted-foreground text-xs">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about blockchain data..."
                disabled={status !== 'ready'}
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <Button
                type="submit"
                disabled={status !== 'ready' || !input.trim()}
                size="sm"
              >
                {isLoading ? '⏳' : '📤'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold animate-pulse">
                {messages.length}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
