import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSwitchChain, useSendTransaction } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChainSelector } from './ChainSelector';
import { TokenInput } from './TokenInput';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { SUPPORTED_CHAINS, USDC_ADDRESSES } from '@/config/wagmi';
import { toast } from 'sonner';
import { getAllStargateQuotes, formatUSDCAmount, type StargateQuote } from '@/lib/stargate';
import { parseUnits, formatUnits } from 'viem';
import { RouteSelector } from './RouteSelector';
import { getTokenPrices, type TokenPrices } from '@/lib/coingecko';
import { eduChain } from '@/config/wagmi';
import { useNotification } from '@blockscout/app-sdk';

interface ChainInfo {
  id: number;
  name: string;
}

export function BridgeCard() {
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { openTxToast } = useNotification();
  
  const chainInfoList: ChainInfo[] = SUPPORTED_CHAINS.map(c => ({ id: c.id, name: c.name }));
  const [fromChain, setFromChain] = useState<ChainInfo>(chainInfoList[2]); // Arbitrum
  const [toChain, setToChain] = useState<ChainInfo>(chainInfoList[5]); // EDU Chain
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [availableRoutes, setAvailableRoutes] = useState<StargateQuote[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<StargateQuote | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [showRouteSelector, setShowRouteSelector] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<TokenPrices>({ eth: 2500, edu: 0.5, pol: 0.5 });

  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: USDC_ADDRESSES[fromChain.id as keyof typeof USDC_ADDRESSES],
    chainId: fromChain.id,
  });

  // Fetch quotes when amount or chains change
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!address || !amount || parseFloat(amount) <= 0) {
        setAvailableRoutes([]);
        setSelectedRoute(null);
        return;
      }

      setIsFetchingQuote(true);
      try {
        const amountInUnits = parseUnits(amount, 6).toString();
        const routes = await getAllStargateQuotes(
          fromChain.id,
          toChain.id,
          address,
          address,
          amountInUnits
        );
        setAvailableRoutes(routes);
        // Auto-select fastest route (first one sorted by duration)
        if (routes.length > 0) {
          const fastest = [...routes].sort((a, b) => a.duration.estimated - b.duration.estimated)[0];
          setSelectedRoute(fastest);
        }
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
        setAvailableRoutes([]);
        setSelectedRoute(null);
      } finally {
        setIsFetchingQuote(false);
      }
    };

    const debounce = setTimeout(fetchQuotes, 500);
    return () => clearTimeout(debounce);
  }, [amount, fromChain.id, toChain.id, address]);

  // Fetch token prices on mount and refresh every 60 seconds
  useEffect(() => {
    const fetchPrices = async () => {
      const prices = await getTokenPrices();
      setTokenPrices(prices);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSwapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleBridge = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if user is on the correct chain
      if (chain?.id !== fromChain.id) {
        setCurrentStep('Switching network...');
        toast.info('Please switch to ' + fromChain.name);
        await switchChainAsync?.({ chainId: fromChain.id });
      }

      // Convert amount to USDC units (6 decimals)
      const amountInUnits = parseUnits(amount, 6).toString();

      // Use selected route
      if (!selectedRoute) {
        throw new Error('No route selected');
      }

      const quote = selectedRoute;

      toast.info('Bridge route found', {
        description: `${quote.route} - Estimated time: ${Math.round(quote.duration.estimated / 60)} minutes`,
      });

      // Execute each step in sequence
      for (let i = 0; i < quote.steps.length; i++) {
        const step = quote.steps[i];
        
        if (step.type === 'approve') {
          setCurrentStep('Approving USDC...');
          toast.info('Please approve USDC spending');
          
          const approveTxHash = await sendTransactionAsync({
            to: step.transaction.to as `0x${string}`,
            data: step.transaction.data as `0x${string}`,
            value: BigInt(0),
          });

          setCurrentStep('Approval confirmed!');
          toast.success('USDC spending approved');
          
          // Show Blockscout notification for approval
          try {
            await openTxToast(fromChain.id.toString(), approveTxHash);
          } catch (error) {
            console.error('Failed to open approval toast:', error);
          }
          
        } else if (step.type === 'bridge') {
          setCurrentStep('Executing bridge transaction...');
          toast.info('Please confirm bridge transaction');

          const bridgeTxHash = await sendTransactionAsync({
            to: step.transaction.to as `0x${string}`,
            data: step.transaction.data as `0x${string}`,
            value: BigInt(step.transaction.value || '0'),
          });

          setCurrentStep('Bridge transaction submitted!');
          toast.success('Bridge initiated successfully!', {
            description: `Bridging ${amount} USDC from ${fromChain.name} to ${toChain.name}. This may take a few minutes.`,
          });

          // Show Blockscout notification for bridge transaction
          try {
            await openTxToast(fromChain.id.toString(), bridgeTxHash);
          } catch (error) {
            console.error('Failed to open bridge toast:', error);
          }
        }
      }
      
      // Refresh balance after successful bridge
      await refetchBalance();
      
      setAmount('');
      setCurrentStep('');
    } catch (error: any) {
      console.error('Bridge error:', error);
      toast.error('Bridge transaction failed', {
        description: error?.message || 'Please try again',
      });
      setCurrentStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  const availableChains = chainInfoList.filter(c => c.id !== fromChain.id);

  return (
    <Card className="w-full max-w-lg glass-card border-border shadow-card p-6 space-y-6">
      <div className="space-y-4">
        <ChainSelector
          chains={chainInfoList}
          selectedChain={fromChain}
          onSelectChain={setFromChain}
          label="From"
        />

        <TokenInput
          value={amount}
          onChange={setAmount}
          balance={balance?.value}
          label="Amount"
        />
      </div>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwapChains}
          className="rounded-full bg-secondary hover:bg-secondary/80 hover:rotate-180 transition-all duration-300"
        >
          <ArrowDownUp className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <ChainSelector
          chains={availableChains}
          selectedChain={toChain}
          onSelectChain={setToChain}
          label="To"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">You'll receive</label>
          <div className="h-14 rounded-lg bg-secondary/50 border border-border flex items-center px-4">
            {isFetchingQuote ? (
              <span className="text-lg text-muted-foreground">Fetching quote...</span>
            ) : selectedRoute ? (
              <>
                <span className="text-2xl font-semibold">{formatUSDCAmount(selectedRoute.dstAmount)}</span>
                <span className="ml-2 text-muted-foreground">USDC</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-semibold">{amount || '0.00'}</span>
                <span className="ml-2 text-muted-foreground">USDC</span>
              </>
            )}
          </div>
          {availableRoutes.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRouteSelector(true)}
              className="w-full text-sm"
            >
              {selectedRoute?.route} • Change route
            </Button>
          )}
        </div>
      </div>

      {address ? (
        <div className="space-y-2">
          <Button
            variant="bridge"
            size="xl"
            onClick={handleBridge}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {currentStep || 'Processing...'}
              </>
            ) : (
              'Bridge USDC'
            )}
          </Button>
          {isProcessing && currentStep && (
            <p className="text-sm text-center text-muted-foreground">{currentStep}</p>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          Connect your wallet to start bridging
        </div>
      )}

      {amount && parseFloat(amount) > 0 && selectedRoute && (() => {
        // Determine native token based on source chain
        const getNativeTokenPrice = (chainId: number) => {
          if (chainId === eduChain.id) return tokenPrices.edu;
          if (chainId === 137) return tokenPrices.pol; // Polygon
          return tokenPrices.eth;
        };
        
        const nativeTokenPrice = getNativeTokenPrice(fromChain.id);
        const networkFeeAmount = parseFloat(formatUnits(BigInt(selectedRoute.fees[0]?.amount || '0'), 18));
        const bridgeFeeAmount = parseFloat(formatUSDCAmount(selectedRoute.srcAmount)) - parseFloat(formatUSDCAmount(selectedRoute.dstAmount));
        
        return (
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Route</span>
              <span className="font-medium">{selectedRoute.route}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated time</span>
              <span className="font-medium">
                {selectedRoute.duration.estimated < 60 
                  ? `${selectedRoute.duration.estimated}s` 
                  : `~${Math.round(selectedRoute.duration.estimated / 60)}m`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Message Fee</span>
              <span className="font-medium">${(networkFeeAmount * nativeTokenPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protocol Fee</span>
              <span className="font-medium">${bridgeFeeAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
              <span>Total fee</span>
              <span>
                ${(networkFeeAmount * nativeTokenPrice + bridgeFeeAmount).toFixed(2)}
              </span>
            </div>
          </div>
        );
      })()}

      <RouteSelector
        open={showRouteSelector}
        onOpenChange={setShowRouteSelector}
        routes={availableRoutes}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
        tokenPrices={tokenPrices}
        fromChainId={fromChain.id}
      />
    </Card>
  );
}
