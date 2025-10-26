import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Link, useLocation } from 'wouter';
import { Award, User, Home, Trophy } from 'lucide-react';
import { formatSolBalance } from '@/lib/solana';

export function Header() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [location] = useLocation();

  const { data: balance } = useQuery({
    queryKey: ['solana-balance', publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) return null;
      const bal = await connection.getBalance(publicKey);
      return bal;
    },
    enabled: !!publicKey,
    refetchInterval: 10000,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover-elevate rounded-lg px-2 py-1" data-testid="link-home">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-chart-2">
                <Award className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-serif">SkillChain</span>
            </Link>

            {publicKey && (
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate ${
                    location === '/' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  }`} data-testid="link-nav-home">
                    <Home className="h-4 w-4" />
                    Home
                  </button>
                </Link>
                <Link href="/tests">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate ${
                    location === '/tests' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  }`} data-testid="link-nav-tests">
                    <Trophy className="h-4 w-4" />
                    Create Test
                  </button>
                </Link>
                <Link href="/profile">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate ${
                    location === '/profile' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  }`} data-testid="link-nav-profile">
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {publicKey && balance !== null && balance !== undefined && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-card-border" data-testid="text-wallet-balance">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-mono font-semibold">{formatSolBalance(balance)} SOL</span>
              </div>
            )}
            <WalletMultiButton className="!bg-primary !rounded-lg !h-10" data-testid="button-connect-wallet" />
          </div>
        </div>
      </div>
    </header>
  );
}
