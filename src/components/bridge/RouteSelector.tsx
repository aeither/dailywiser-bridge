import { StargateQuote, formatUSDCAmount } from '@/lib/stargate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatUnits } from 'viem';
import { Check, Zap, TrendingDown } from 'lucide-react';
import { TokenPrices } from '@/lib/coingecko';
import { eduChain } from '@/config/wagmi';

interface RouteSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routes: StargateQuote[];
  selectedRoute: StargateQuote | null;
  onSelectRoute: (route: StargateQuote) => void;
  tokenPrices: TokenPrices;
  fromChainId: number;
}

export function RouteSelector({ open, onOpenChange, routes, selectedRoute, onSelectRoute, tokenPrices, fromChainId }: RouteSelectorProps) {
  if (!routes.length) return null;

  // Sort by duration (fastest first)
  const sortedRoutes = [...routes].sort((a, b) => a.duration.estimated - b.duration.estimated);
  const fastestRoute = sortedRoutes[0];
  const recommended = [fastestRoute];
  const others = sortedRoutes.slice(1);

  const calculateTotalFee = (route: StargateQuote) => {
    const getNativeTokenPrice = (chainId: number) => {
      if (chainId === eduChain.id) return tokenPrices.edu;
      if (chainId === 137) return tokenPrices.pol; // Polygon
      return tokenPrices.eth;
    };
    
    const nativeTokenPrice = getNativeTokenPrice(fromChainId);
    const gasFeeNative = parseFloat(formatUnits(BigInt(route.fees[0]?.amount || '0'), 18));
    const messageFeeUSD = gasFeeNative * nativeTokenPrice;
    const protocolFeeUSD = parseFloat(formatUSDCAmount(route.srcAmount)) - parseFloat(formatUSDCAmount(route.dstAmount));
    return { messageFeeUSD, protocolFeeUSD, total: messageFeeUSD + protocolFeeUSD };
  };

  const RouteCard = ({ route, isRecommended }: { route: StargateQuote; isRecommended?: boolean }) => {
    const fees = calculateTotalFee(route);
    const isSelected = selectedRoute?.route === route.route;
    const durationInSeconds = route.duration.estimated;
    const durationText = durationInSeconds < 60 ? `${durationInSeconds}s` : `${Math.round(durationInSeconds / 60)}m`;

    return (
      <button
        onClick={() => {
          onSelectRoute(route);
          onOpenChange(false);
        }}
        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
          isSelected 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 bg-card'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{route.route}</span>
            {isRecommended && (
              <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Fast
              </span>
            )}
          </div>
          {isSelected && <Check className="h-5 w-5 text-primary" />}
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-2xl font-bold">{formatUSDCAmount(route.dstAmount)} USDC</div>
            <div className="text-sm text-muted-foreground">
              1 USDC ≈ {(parseFloat(formatUSDCAmount(route.dstAmount)) / parseFloat(formatUSDCAmount(route.srcAmount))).toFixed(4)} USDC
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">💣</span>
              <span>${fees.messageFeeUSD.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">💰</span>
              <span>${fees.protocolFeeUSD.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">⏱️</span>
              <span>{durationText}</span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Route</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recommended */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-primary">Recommended</h3>
            </div>
            <div className="space-y-2">
              {recommended.map((route) => (
                <RouteCard key={route.route} route={route} isRecommended />
              ))}
            </div>
          </div>

          {/* Others */}
          {others.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Others</h3>
              <div className="space-y-2">
                {others.map((route) => (
                  <RouteCard key={route.route} route={route} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
