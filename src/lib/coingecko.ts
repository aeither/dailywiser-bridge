/**
 * CoinGecko API utility for fetching real-time cryptocurrency prices
 */

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const DEFAULT_ETH_PRICE = 2500; // Fallback price if API fails
const DEFAULT_EDU_PRICE = 0.5; // Fallback price for EDU
const DEFAULT_POL_PRICE = 0.5; // Fallback price for POL/MATIC

export interface TokenPrices {
  eth: number;
  edu: number;
  pol: number;
}

export async function getTokenPrices(): Promise<TokenPrices> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=ethereum,edu-coin,polygon-ecosystem-token&vs_currencies=usd`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('CoinGecko API request failed:', response.statusText);
      return { eth: DEFAULT_ETH_PRICE, edu: DEFAULT_EDU_PRICE, pol: DEFAULT_POL_PRICE };
    }

    const data = await response.json();
    const ethPrice = data?.ethereum?.usd;
    const eduPrice = data?.['edu-coin']?.usd;
    const polPrice = data?.['polygon-ecosystem-token']?.usd;

    return {
      eth: typeof ethPrice === 'number' && ethPrice > 0 ? ethPrice : DEFAULT_ETH_PRICE,
      edu: typeof eduPrice === 'number' && eduPrice > 0 ? eduPrice : DEFAULT_EDU_PRICE,
      pol: typeof polPrice === 'number' && polPrice > 0 ? polPrice : DEFAULT_POL_PRICE,
    };
  } catch (error) {
    console.error('Failed to fetch token prices from CoinGecko:', error);
    return { eth: DEFAULT_ETH_PRICE, edu: DEFAULT_EDU_PRICE, pol: DEFAULT_POL_PRICE };
  }
}

export async function getEthPrice(): Promise<number> {
  const prices = await getTokenPrices();
  return prices.eth;
}
