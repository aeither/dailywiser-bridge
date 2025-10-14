import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
} from 'wagmi/chains';
import { defineChain } from 'viem';

export const eduChain = defineChain({
  id: 41923,
  testnet: false,
  name: "EDU Chain",
  nativeCurrency: {
    decimals: 18,
    name: "EDU",
    symbol: "EDU",
  },
  rpcUrls: {
    public: { http: ['https://rpc.edu-chain.raas.gelato.cloud'] },
    default: { http: ['https://rpc.edu-chain.raas.gelato.cloud'] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://educhain.blockscout.com",
    },
  },
});

export const config = getDefaultConfig({
  appName: 'Dailywiser Bridge',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [mainnet, polygon, arbitrum, optimism, base, eduChain],
  ssr: false,
});

export const USDC_ADDRESSES = {
  [mainnet.id]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [polygon.id]: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Native USDC
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Native USDC
  [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // Native USDC
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [eduChain.id]: '0x12a272A581feE5577A5dFa371afEB4b2F3a8C2F8', // USDC.e
} as const;

export const SUPPORTED_CHAINS = [mainnet, polygon, arbitrum, optimism, base, eduChain];
