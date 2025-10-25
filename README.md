# DailyBridge

<br />
<div align="center">
    <img src="https://github.com/user-attachments/assets/4570bc9f-7835-44b8-a894-ad5be8e94b35" alt="Logo" width="600">
</div>

**Bridge Smarter with AI**

*AI-powered cross-chain USDC bridge with real-time blockchain intelligence*

---

## Description

DailyBridge is a next-generation cross-chain bridge application that seamlessly combines traditional DeFi functionality with AI-powered blockchain analytics. The platform enables users to bridge USDC tokens between EDU Chain and five major blockchains (Ethereum, Polygon, Arbitrum, Optimism, and Base) while providing instant transaction feedback and conversational blockchain intelligence.

### Core Features

**Smart Bridging Interface**
The application provides an intuitive bridge interface that leverages Stargate Protocol's cross-chain infrastructure to facilitate USDC transfers. Users can select source and destination chains, input amounts, and view multiple routing options with real-time fee calculations. The bridge supports:

- Multi-chain USDC transfers (6 chains supported)
- Dynamic route selection with time and cost optimization
- Real-time quote fetching with multiple route comparisons
- Automatic network switching and transaction approval flow
- Live balance updates and transaction status tracking

**Instant Explorer Feedback with Blockscout SDK**
Every transaction submitted through the bridge immediately triggers interactive notifications powered by Blockscout's SDK. When users approve USDC spending or execute bridge transactions, they receive instant toast notifications with direct links to Blockscout explorers, allowing them to:

- Track transaction confirmations in real-time
- View detailed transaction data on Blockscout
- Monitor cross-chain message status
- Access comprehensive block explorer information without leaving the app

This integration transforms the typical "transaction submitted" experience into an interactive, informative journey where users maintain full visibility into their on-chain activities.

**AI-Powered Blockchain Assistant**
The platform features a dedicated chat interface that connects users to an AI agent equipped with comprehensive blockchain analysis capabilities through Blockscout's Model Context Protocol (MCP) server. This conversational interface enables users to:

- Query blockchain data using natural language
- Analyze wallet activities and transaction histories
- Inspect smart contract code and ABIs
- Look up token information and NFT holdings
- Retrieve ENS names and address information
- Access multi-chain data across all networks supported by Blockscout

The AI assistant processes queries through 18 specialized MCP tools, including `get_transactions_by_address`, `inspect_contract_code`, `transaction_summary`, `get_token_transfers_by_address`, and more. Users can ask questions like "Show me recent transactions for 0x..." or "What tokens does this address hold?" and receive contextual, AI-interpreted responses rather than raw API data.

**Unified User Experience**
The application creates a cohesive workflow where users can bridge assets and immediately query the blockchain for transaction details, all within the same interface. After initiating a bridge transaction, users can switch to the chat interface and ask the AI to analyze their transaction, inspect the bridge contract, or monitor their token balances across chains—creating a self-contained DeFi experience enhanced by real-time blockchain intelligence.

---

## How it's Made

DailyBridge is architected as a modern React application that integrates multiple blockchain infrastructure layers to deliver a seamless user experience.

### Frontend Architecture

The application is built with **React 18** and **TypeScript**, using **Vite** as the build tool for optimal performance. The UI leverages **Shadcn/ui** components built on top of **Radix UI primitives**, providing accessible and customizable components styled with **Tailwind CSS**. The design system includes custom theming with dark mode support and glassmorphism effects for a modern aesthetic.

State management utilizes React hooks and **TanStack Query** (React Query) for efficient server state synchronization. The application features two main routes:

1. **Bridge Interface (`/`)** - The primary landing page with the bridging functionality
2. **AI Chat Interface (`/chat`)** - A dedicated chat page for blockchain queries

### Wallet Connectivity

User authentication and transaction signing are handled through **Wagmi v2** and **RainbowKit**, providing a polished wallet connection experience. The configuration supports all six chains (Ethereum, Polygon, Arbitrum, Optimism, Base, and EDU Chain) with automatic network switching capabilities. **Viem** is used for Ethereum interactions and utility functions like parsing/formatting units.

### Blockscout SDK Integration

The **Blockscout App SDK** (`@blockscout/app-sdk`) is integrated at the application root level through two provider components:

- `NotificationProvider` - Manages notification state and configuration
- `TransactionPopupProvider` - Handles transaction toast displays

In the bridge component (`BridgeCard.tsx`), the `useNotification` hook exposes the `openTxToast()` function, which is called immediately after both approval and bridge transactions are submitted (lines 155 and 177). This function accepts the chain ID and transaction hash, automatically generating interactive notifications with links to the appropriate Blockscout explorer for that network.

This implementation is particularly valuable because it provides instant feedback across multiple chains without requiring manual explorer URL construction. The SDK handles chain-specific explorer routing, ensuring users always land on the correct Blockscout instance for their transaction.

### Blockscout MCP Server Integration

The AI chat functionality is powered by a backend API route (`api/chat.ts`) that establishes a connection to Blockscout's Model Context Protocol server. The implementation uses:

- **Vercel AI SDK v5** - Manages streaming AI responses and tool orchestration
- **Groq AI** - Provides the language model (kimi-k2-instruct) for natural language understanding
- **MCP SDK** (`@modelcontextprotocol/sdk`) - Connects to Blockscout's MCP server via HTTP transport

The architecture works as follows:

1. User sends a message through the chat UI
2. The frontend calls `/api/chat` with the conversation history
3. The API establishes an MCP client connection to `https://mcp.blockscout.com/mcp` using `StreamableHTTPClientTransport`
4. The MCP client retrieves 18+ available tools from Blockscout's server
5. These tools are passed to the AI SDK's `streamText()` function alongside the user's messages
6. The AI model decides which tools to invoke based on the query
7. Responses stream back to the client with tool calls, inputs, outputs, and AI-generated explanations
8. The UI renders each message part differently (text, tool calls, reasoning, etc.)

The chat interface (`Chat.tsx`) implements a sophisticated rendering system that displays:
- **Dynamic tool calls** - Shows which Blockscout MCP tools were invoked with their arguments
- **Tool outputs** - Displays the raw blockchain data returned from each tool
- **AI reasoning** - Reveals the model's thought process (if available)
- **Contextual responses** - AI-interpreted summaries of the blockchain data

This approach transforms Blockscout's comprehensive API into a conversational interface, making blockchain data accessible to users who may not be familiar with block explorers or API endpoints.

### Cross-Chain Bridge Infrastructure

The bridging functionality integrates with **Stargate Protocol**, a composable liquidity transport protocol. The implementation (`lib/stargate.ts`) fetches quotes from Stargate's API, comparing multiple routing options based on duration and fees. When a user initiates a bridge:

1. The app fetches available routes via `getAllStargateQuotes()`
2. Routes are sorted by estimated duration, with the fastest auto-selected
3. Users can manually select alternative routes through a comparison modal
4. The selected route provides step-by-step transaction data
5. The app executes each step sequentially (approve → bridge)
6. After each transaction, Blockscout SDK notifications are triggered

### Price Feeds and UX Enhancements

Token price data is fetched from **CoinGecko API** (`lib/coingecko.ts`) and refreshed every 60 seconds to display USD-denominated fees. The bridge displays comprehensive cost breakdowns including:
- Message fees (in USD based on native token price)
- Protocol fees (USDC difference between source and destination amounts)
- Estimated transfer time
- Route information (e.g., "Stargate V2" or "Stargate V1")

### Technical Challenges and Solutions

**Challenge: MCP Client Connection Management**
The MCP client connection needed to be properly closed after streaming completed to avoid resource leaks. This was solved by implementing an `onFinish` callback in `streamText()` that ensures the MCP client is closed regardless of how the stream terminates (line 38-49 in `api/chat.ts`).

**Challenge: Multi-Chain Transaction Monitoring**
Supporting transaction notifications across six different chains required proper chain ID handling. The Blockscout SDK elegantly handles this by accepting chain ID as a parameter to `openTxToast()`, automatically routing to the correct explorer instance.

**Challenge: Route Selection and Fee Transparency**
Stargate can provide multiple routing options with varying speeds and costs. The solution involved creating a `RouteSelector` component that displays all available routes in a comparison table, showing duration, fees, and route type, empowering users to make informed decisions.

**Notable Implementation Details**
- Uses step counting (`stepCountIs(5)`) to limit AI reasoning iterations, preventing infinite loops while allowing sufficient tool chaining
- Implements debounced quote fetching (500ms) to reduce API calls while maintaining responsiveness
- Maintains proper transaction flow with sequential execution rather than parallel to ensure approvals complete before bridge transactions
- Renders different message part types (text, dynamic-tool, reasoning, file, etc.) based on AI SDK's response structure

The combination of Blockscout's SDK for transaction feedback and MCP for blockchain queries creates a powerful synergy where users can immediately verify and analyze their bridge transactions through the AI chat interface, all powered by Blockscout's infrastructure.

---

## Short Description

AI-enhanced USDC bridge with real-time Blockscout explorer feedback and blockchain intelligence

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dailywiser-bridge

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

---

## Technologies Used

**Frontend Framework**
- React 18.3 with TypeScript 5.8
- Vite 5.4 for blazing-fast builds
- React Router 6 for navigation

**Blockchain Infrastructure**
- Wagmi 2.17 - React hooks for Ethereum
- RainbowKit 2.2 - Wallet connection UI
- Viem 2.37 - Ethereum utilities
- Stargate Protocol - Cross-chain bridging

**Blockscout Integration**
- `@blockscout/app-sdk` - Transaction notifications and explorer integration
- Blockscout MCP Server - AI-accessible blockchain data

**AI & MCP**
- Vercel AI SDK 5.0 - Streaming AI responses
- `@modelcontextprotocol/sdk` - MCP client implementation
- Groq AI - Language model provider

**UI Components**
- Shadcn/ui - Component library
- Radix UI - Accessible primitives
- Tailwind CSS - Utility-first styling
- Lucide React - Icon system

---

## Features

### Bridge Interface
- Multi-chain USDC bridging across 6 networks
- Dynamic route selection with cost comparison
- Real-time fee calculations in USD
- Automatic network switching
- Live transaction status with Blockscout explorer links

### AI Chat Assistant
- Natural language blockchain queries
- Multi-chain data access via Blockscout MCP
- 18+ specialized blockchain analysis tools
- Transaction inspection and wallet analysis
- Smart contract code review
- Token and NFT lookups

### User Experience
- Instant transaction notifications with Blockscout SDK
- Dark mode interface with glassmorphism design
- Responsive layout for all devices
- Real-time balance updates
- Comprehensive error handling

---

## Blockscout MCP Tools

The AI assistant has access to 18 blockchain analysis tools:

- `__unlock_blockchain_analysis__` - Initialize analysis capabilities
- `get_block_info` - Retrieve block details
- `get_latest_block` - Fetch most recent block
- `get_address_by_ens_name` - Resolve ENS names
- `get_transactions_by_address` - Query address transaction history
- `get_token_transfers_by_address` - Analyze token movements
- `lookup_token_by_symbol` - Find token contracts
- `get_contract_abi` - Retrieve contract ABIs
- `inspect_contract_code` - View verified source code
- `read_contract` - Execute read-only contract calls
- `get_address_info` - Fetch address metadata
- `get_tokens_by_address` - List token holdings
- `transaction_summary` - Analyze transaction details
- `nft_tokens_by_address` - Query NFT collections
- `get_transaction_info` - Detailed transaction data
- `get_transaction_logs` - Retrieve event logs
- `get_chains_list` - List available networks
- `direct_api_call` - Custom Blockscout API queries

---

## License

MIT
