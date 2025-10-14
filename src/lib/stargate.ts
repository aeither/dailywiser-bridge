import { USDC_ADDRESSES } from '@/config/wagmi';

const CHAIN_KEYS: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
  41923: 'edu',
};

export interface StargateQuote {
  route: string;
  srcAddress: string;
  dstAddress: string;
  srcChainKey: string;
  dstChainKey: string;
  srcToken: string;
  dstToken: string;
  srcAmount: string;
  dstAmount: string;
  dstAmountMin: string;
  duration: {
    estimated: number;
  };
  fees: Array<{
    token: string;
    amount: string;
    type: string;
    chainKey: string;
  }>;
  steps: Array<{
    type: 'approve' | 'bridge';
    sender: string;
    chainKey: string;
    transaction: {
      data: string;
      to: string;
      from: string;
      value?: string;
    };
  }>;
}

interface StargateQuoteResponse {
  quotes: StargateQuote[];
}

export async function getStargateQuote(
  srcChainId: number,
  dstChainId: number,
  srcAddress: string,
  dstAddress: string,
  amount: string // Amount in token decimals (e.g., 1000000 for 1 USDC with 6 decimals)
): Promise<StargateQuote | null> {
  try {
    const srcToken = USDC_ADDRESSES[srcChainId as keyof typeof USDC_ADDRESSES];
    const dstToken = USDC_ADDRESSES[dstChainId as keyof typeof USDC_ADDRESSES];
    const srcChainKey = CHAIN_KEYS[srcChainId];
    const dstChainKey = CHAIN_KEYS[dstChainId];

    // Calculate minimum destination amount (95% of source amount for 5% slippage)
    const dstAmountMin = Math.floor(Number(amount) * 0.95).toString();

    const url = new URL('https://stargate.finance/api/v1/quotes');
    url.searchParams.set('srcToken', srcToken);
    url.searchParams.set('dstToken', dstToken);
    url.searchParams.set('srcChainKey', srcChainKey);
    url.searchParams.set('dstChainKey', dstChainKey);
    url.searchParams.set('srcAddress', srcAddress);
    url.searchParams.set('dstAddress', dstAddress);
    url.searchParams.set('srcAmount', amount);
    url.searchParams.set('dstAmountMin', dstAmountMin);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Stargate API error: ${response.statusText}`);
    }

    const data: StargateQuoteResponse = await response.json();

    if (!data.quotes || data.quotes.length === 0) {
      throw new Error('No routes available for this bridge');
    }

    // Return the first route (usually the fastest - taxi route)
    return data.quotes[0];
  } catch (error) {
    console.error('Failed to get Stargate quote:', error);
    return null;
  }
}

export async function getAllStargateQuotes(
  srcChainId: number,
  dstChainId: number,
  srcAddress: string,
  dstAddress: string,
  amount: string
): Promise<StargateQuote[]> {
  try {
    const srcToken = USDC_ADDRESSES[srcChainId as keyof typeof USDC_ADDRESSES];
    const dstToken = USDC_ADDRESSES[dstChainId as keyof typeof USDC_ADDRESSES];
    const srcChainKey = CHAIN_KEYS[srcChainId];
    const dstChainKey = CHAIN_KEYS[dstChainId];

    const dstAmountMin = Math.floor(Number(amount) * 0.95).toString();

    const url = new URL('https://stargate.finance/api/v1/quotes');
    url.searchParams.set('srcToken', srcToken);
    url.searchParams.set('dstToken', dstToken);
    url.searchParams.set('srcChainKey', srcChainKey);
    url.searchParams.set('dstChainKey', dstChainKey);
    url.searchParams.set('srcAddress', srcAddress);
    url.searchParams.set('dstAddress', dstAddress);
    url.searchParams.set('srcAmount', amount);
    url.searchParams.set('dstAmountMin', dstAmountMin);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Stargate API error: ${response.statusText}`);
    }

    const data: StargateQuoteResponse = await response.json();

    return data.quotes || [];
  } catch (error) {
    console.error('Failed to get Stargate quotes:', error);
    return [];
  }
}

export function formatUSDCAmount(amount: string): string {
  // Convert USDC amount (6 decimals) to readable format
  return (Number(amount) / 1_000_000).toFixed(2);
}
