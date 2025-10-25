import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Rocket, History } from 'lucide-react';
import { useTransactionPopup } from '@blockscout/app-sdk';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';

export function Header() {
  const { openPopup } = useTransactionPopup();
  const { address, chain } = useAccount();

  const handleViewHistory = () => {
    if (chain?.id) {
      openPopup({
        chainId: chain.id.toString(),
        address: address,
      });
    }
  };

  return (
    <header className="w-full py-3 sm:py-6 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center glow-effect">
            <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-primary whitespace-nowrap">
            DailyBridge
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {address && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewHistory}
              className="gap-2 text-xs sm:text-sm"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
          )}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
