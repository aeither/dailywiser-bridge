import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChainInfo {
  id: number;
  name: string;
}

interface ChainSelectorProps {
  chains: ChainInfo[];
  selectedChain: ChainInfo;
  onSelectChain: (chain: ChainInfo) => void;
  label: string;
}

const chainLogos: Record<number, string> = {
  1: '🔷', // Ethereum
  137: '🟣', // Polygon
  42161: '🔵', // Arbitrum
  10: '🔴', // Optimism
  8453: '🔵', // Base
};

export function ChainSelector({ chains, selectedChain, onSelectChain, label }: ChainSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (chain: ChainInfo) => {
    onSelectChain(chain);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-14 text-base"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{chainLogos[selectedChain.id]}</span>
              <span className="font-medium">{selectedChain.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2 glass-card border-border">
          <div className="space-y-1">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleSelect(chain)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors",
                  selectedChain.id === chain.id && "bg-secondary"
                )}
              >
                <span className="text-2xl">{chainLogos[chain.id]}</span>
                <span className="font-medium flex-1 text-left">{chain.name}</span>
                {selectedChain.id === chain.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
