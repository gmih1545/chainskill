import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Award, Trophy, TrendingUp, Coins, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { shortenAddress, getLevelBadgeColor } from '@/lib/solana';
import type { UserStats } from '@shared/schema';

export default function Profile() {
  const { publicKey } = useWallet();

  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats', publicKey?.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/user/stats/${publicKey?.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return response.json();
    },
    enabled: !!publicKey,
  });

  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold font-serif">Wallet Not Connected</h2>
          <p className="text-muted-foreground">
            Please connect your Phantom wallet to view your profile.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Profile Header */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 border-4 border-background shadow-xl">
                <User className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold font-serif">My Profile</h1>
              <p className="text-lg font-mono text-muted-foreground" data-testid="text-wallet-address">
                {shortenAddress(publicKey.toString(), 8)}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-6 space-y-3 hover-elevate transition-all border-card-border" data-testid="card-stat-certificates">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Award className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold" data-testid="text-certificates-count">{stats?.totalCertificates || 0}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-3 hover-elevate transition-all border-card-border" data-testid="card-stat-tests">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <Trophy className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold" data-testid="text-tests-taken">{stats?.totalTests || 0}</p>
                  <p className="text-sm text-muted-foreground">Tests Taken</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-3 hover-elevate transition-all border-card-border" data-testid="card-stat-success">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold" data-testid="text-success-rate">{stats?.successRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-3 hover-elevate transition-all border-card-border" data-testid="card-stat-earnings">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                  <Coins className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold" data-testid="text-sol-earned">{stats?.totalSolEarned?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-muted-foreground">SOL Earned</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Certificates Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif">My Certificates</h2>
              <div className="px-4 py-2 rounded-full bg-card border border-card-border">
                <span className="text-sm font-semibold" data-testid="text-total-certificates">
                  {stats?.certificates?.length || 0} Total
                </span>
              </div>
            </div>

            {stats?.certificates && stats.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.certificates.map((cert, index) => (
                  <Card
                    key={cert.id}
                    className="group overflow-hidden hover-elevate transition-all border-card-border"
                    data-testid={`card-certificate-${index}`}
                  >
                    <div className={`h-48 bg-gradient-to-br ${cert.level === 'Senior' ? 'from-purple-600 to-pink-600' : cert.level === 'Middle' ? 'from-blue-600 to-cyan-600' : 'from-green-600 to-emerald-600'} p-8 flex flex-col items-center justify-center text-center space-y-4`}>
                      <Award className="h-16 w-16 text-white opacity-90" />
                      <div className="space-y-2">
                        <div className={`px-4 py-2 rounded-full border font-bold text-sm ${getLevelBadgeColor(cert.level)}`}>
                          {cert.level.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="font-bold font-serif text-lg line-clamp-2" data-testid={`text-cert-topic-${index}`}>
                        {cert.topic}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-bold" data-testid={`text-cert-score-${index}`}>{cert.score}/5</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Earned</span>
                        <span className="text-muted-foreground">
                          {new Date(cert.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {cert.nftMint && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            NFT: {cert.nftMint.slice(0, 8)}...{cert.nftMint.slice(-8)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center space-y-6 border-dashed border-card-border">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Award className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif">No Certificates Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Take your first test to earn a certificate and showcase your skills.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function User({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
