import { Header } from '@/components/bridge/Header';
import { BridgeCard } from '@/components/bridge/BridgeCard';
import { ArrowRight } from 'lucide-react';
import FloatingChat from '@/components/FloatingChat';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="max-w-2xl w-full space-y-8 text-center mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Bridge USDC on EDU Chain
            </h1>
            <p className="text-lg text-primary font-semibold">
              Bridge Smarter with AI
            </p>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Transfer USDC in and out of EDU Chain seamlessly. Connect EDU Chain to Ethereum, Polygon, Arbitrum, Optimism, and Base with low fees.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Low fees</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>Fast transfers</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary-glow animate-pulse" />
              <span>5+ chains</span>
            </div>
          </div>
        </div>

        <BridgeCard />
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>DailyBridge • Powered by Stargate Protocol • EDU Chain USDC bridging</p>
      </footer>

      <FloatingChat />
    </div>
  );
};

export default Index;
