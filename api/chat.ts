import { streamText, convertToModelMessages, gateway } from 'ai';
import { experimental_createMCPClient as createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { MCPTransport, UIMessage } from 'ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  let mcpClient;

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    console.log('📥 Received messages:', messages);

    // Create MCP client (ENS tool available)
    const httpTransport = new StreamableHTTPClientTransport(
      new URL('https://mcp.blockscout.com/mcp')
    );

    mcpClient = await createMCPClient({
      transport: httpTransport as any as MCPTransport,
    });

    const tools = await mcpClient.tools();
    console.log(`✅ Connected with ${Object.keys(tools).length} tools`);
    console.log('📋 Available tools:', Object.keys(tools));

    // Convert UI to model messages
    const modelMessages = convertToModelMessages(messages);

    // Stream via Gemini on AI Gateway
    const result = streamText({
      model: gateway('google/gemini-2.5-flash'),
      tools,
      messages: modelMessages,
      toolChoice: 'auto',
      onFinish: ({ finishReason }) => {
        console.log('✅ Stream finished:', finishReason);
      },
    });

    // Use stream response
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('❌ Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    if (mcpClient) {
      try {
        await mcpClient.close();
      } catch (closeError) {
        console.error('Error closing MCP client:', closeError);
      }
    }
  }
}
