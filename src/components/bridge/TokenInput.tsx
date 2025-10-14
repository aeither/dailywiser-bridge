import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatUnits } from 'viem';

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
  balance?: bigint;
  label: string;
}

export function TokenInput({ value, onChange, balance, label }: TokenInputProps) {
  const formattedBalance = balance ? formatUnits(balance, 6) : '0';

  const handleMaxClick = () => {
    if (balance) {
      onChange(formatUnits(balance, 6));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        {balance !== undefined && (
          <span className="text-sm text-muted-foreground">
            Balance: {parseFloat(formattedBalance).toFixed(2)} USDC
          </span>
        )}
      </div>
      <div className="relative">
        <Input
          type="number"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 text-2xl font-semibold pr-24 bg-secondary/50 border-border"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMaxClick}
            className="text-primary hover:text-primary-glow"
          >
            MAX
          </Button>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background">
            <span className="text-xl">💵</span>
            <span className="font-semibold">USDC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
