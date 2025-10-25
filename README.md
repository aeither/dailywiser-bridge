# Dailywiser Bridge

A cross-chain USDC bridge application that enables seamless transfers between EDU Chain and other major blockchains including Ethereum, Polygon, Arbitrum, Optimism, and Base. Built with modern web technologies and powered by Stargate Protocol for secure, low-fee transactions.

## Development

### Prerequisites

Make sure you have Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd dailywiser-bridge

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn/ui** - Modern UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Stargate Protocol** - Cross-chain bridge infrastructure

## Features

- Cross-chain USDC transfers between EDU Chain and major blockchains
- Support for Ethereum, Polygon, Arbitrum, Optimism, and Base
- Modern wallet connection with RainbowKit
- Responsive design optimized for all devices
- Real-time transaction tracking
- Low-fee transfers powered by Stargate Protocol

## MCP Tools

📋 Available tools: [
  '__unlock_blockchain_analysis__',
  'get_block_info',
  'get_latest_block',
  'get_address_by_ens_name',
  'get_transactions_by_address',
  'get_token_transfers_by_address',
  'lookup_token_by_symbol',
  'get_contract_abi',
  'inspect_contract_code',
  'read_contract',
  'get_address_info',
  'get_tokens_by_address',
  'transaction_summary',
  'nft_tokens_by_address',
  'get_transaction_info',
  'get_transaction_logs',
  'get_chains_list',
  'direct_api_call'
]