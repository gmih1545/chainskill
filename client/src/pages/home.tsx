import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'wouter';
import { Award, Shield, Zap, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzgwODBmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-40" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Powered by Solana Devnet
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif tracking-tight">
              Professional Credentials{' '}
              <span className="gradient-text">on the Blockchain</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Prove your skills with verifiable NFT certificates on Solana. Take tests, earn credentials, and build your professional reputation on the blockchain.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {publicKey ? (
                <>
                  <Link href="/tests">
                    <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-6" data-testid="button-browse-tests">
                      <Trophy className="h-5 w-5" />
                      Create Test
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-6" data-testid="button-view-profile">
                      View Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <WalletMultiButton className="!bg-primary !rounded-lg !text-base !px-8 !py-6" data-testid="button-connect-wallet-hero">
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect Wallet to Get Started
                </WalletMultiButton>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif">Why SkillChain?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The future of professional credentials is decentralized, verifiable, and owned by you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 space-y-4 hover-elevate transition-all duration-300 border-card-border" data-testid="card-feature-nft">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Award className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold font-serif">Earn NFT Certificates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Take professional skill tests and receive blockchain-verified NFT certificates as proof of your achievements.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover-elevate transition-all duration-300 border-card-border" data-testid="card-feature-blockchain">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Shield className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold font-serif">Blockchain Verified</h3>
              <p className="text-muted-foreground leading-relaxed">
                All certificates are minted as NFTs on Solana, providing immutable and verifiable proof of your skills.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover-elevate transition-all duration-300 border-card-border" data-testid="card-feature-solana">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <Zap className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold font-serif">Solana Powered</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built on Solana devnet for fast transactions and low costs. Pay 0.15 SOL (~$20) per test attempt.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-32 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold font-serif">Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Phantom wallet to get started with SkillChain.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold font-serif">Take Test (0.15 SOL)</h3>
              <p className="text-muted-foreground">
                Choose a test and pay 0.15 SOL (~$20) to attempt. Pass to earn your certificate.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold font-serif">Earn NFT Certificate</h3>
              <p className="text-muted-foreground">
                Receive a unique NFT certificate minted on Solana devnet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
