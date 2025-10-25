import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { experimental_createMCPClient as createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Use Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 60; // Max execution time in seconds

export async function POST(req: Request) {
  let mcpClient;
  
  try {
    const { messages } = await req.json();

    // Create HTTP transport for Blockscout MCP
    const httpTransport = new StreamableHTTPClientTransport(
      new URL('https://mcp.blockscout.com/mcp')
    );

    // Create MCP client
    mcpClient = await createMCPClient({
      transport: httpTransport,
    });

    // Get tools from Blockscout MCP server
    const tools = await mcpClient.tools();
    
    console.log(`✅ Connected to Blockscout MCP with ${Object.keys(tools).length} tools`);

    // AI SDK 5.0 streamText with tools
    const result = streamText({
      model: openai('gpt-4o'),
      tools,
      messages,
      onFinish: async ({ finishReason }) => {
        console.log('Stream finished:', { finishReason });
      },
    });

    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error('❌ Blockscout MCP Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    // Clean up MCP client connection
    if (mcpClient) {
      try {
        await mcpClient.close();
        console.log('🔌 Blockscout MCP client closed');
      } catch (closeError) {
        console.error('Error closing MCP client:', closeError);
      }
    }
  }
}