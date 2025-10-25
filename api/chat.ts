import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { experimental_createMCPClient as createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { MCPTransport, UIMessage } from 'ai';
import { groq } from '@ai-sdk/groq';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  let mcpClient;

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    console.log('📥 Received messages:', messages);

    const httpTransport = new StreamableHTTPClientTransport(
      new URL('https://mcp.blockscout.com/mcp')
    );

    mcpClient = await createMCPClient({
      transport: httpTransport as any as MCPTransport,
    });

    const tools = await mcpClient.tools();
    console.log(`✅ Connected with ${Object.keys(tools).length} tools`);

    const modelMessages = convertToModelMessages(messages);

    // ✅ Updated for AI SDK v5
    const result = streamText({
      model: groq('moonshotai/kimi-k2-instruct'),
      tools,
      messages: modelMessages,
      toolChoice: 'auto',
      stopWhen: stepCountIs(5), // 🔥 Use stopWhen instead of maxSteps
      system: 'You are a helpful blockchain assistant. When using tools to answer questions, always provide clear, human-friendly explanations of the results.',
      onFinish: async ({ finishReason }) => {
        console.log('✅ Stream finished:', finishReason);

        if (mcpClient) {
          try {
            await mcpClient.close();
            console.log('🔌 MCP client closed');
          } catch (closeError) {
            console.error('❌ Error closing MCP client:', closeError);
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('❌ Error:', error);

    if (mcpClient) {
      try {
        await mcpClient.close();
      } catch (closeError) {
        console.error('Error closing MCP client:', closeError);
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
