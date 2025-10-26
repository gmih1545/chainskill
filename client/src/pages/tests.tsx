import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TEST_PRICE_SOL, TEST_PRICE_LAMPORTS, TREASURY_WALLET } from '@/lib/solana';
import { apiRequest } from '@/lib/queryClient';
import type { GenerateTestResponse } from '@shared/schema';

export default function Tests() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [, setLocation] = useLocation();
  const [topic, setTopic] = useState('');

  const generateTestMutation = useMutation({
    mutationFn: async (data: { topic: string; walletAddress: string }) => {
      if (!publicKey) throw new Error('Wallet not connected');

      // Step 1: Create and send SOL payment transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: TEST_PRICE_LAMPORTS,
        })
      );

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction and wait for confirmation
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log('Payment confirmed:', signature);

      // Step 2: Generate test after payment confirmed, include signature for backend verification
      const response = await apiRequest<GenerateTestResponse>('POST', '/api/tests/generate', {
        ...data,
        paymentSignature: signature,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.test) {
        setLocation(`/test/${data.test.id}`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !topic.trim()) return;

    generateTestMutation.mutate({
      topic: topic.trim(),
      walletAddress: publicKey.toString(),
    });
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold font-serif">Wallet Not Connected</h2>
          <p className="text-muted-foreground">
            Please connect your Phantom wallet to create and take tests.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Test Generation
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif">
              Generate Your <span className="gradient-text">Skill Test</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter any skill or topic, and our AI will create a custom 5-question test for you. Pass to earn your NFT certificate!
            </p>
          </div>

          {/* Test Generation Form */}
          <Card className="p-8 sm:p-12 space-y-8 animate-scale-in border-card-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-lg font-semibold">
                  What skill do you want to test?
                </Label>
                <Input
                  id="topic"
                  type="text"
                  placeholder="e.g., React Hooks, Solana Smart Contracts, Python Data Science..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-14 text-lg"
                  disabled={generateTestMutation.isPending}
                  data-testid="input-test-topic"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  Be specific! The more detailed your topic, the better the questions.
                </p>
              </div>

              {generateTestMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {generateTestMutation.error instanceof Error
                      ? generateTestMutation.error.message
                      : 'Failed to generate test. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 h-14 text-lg gap-2"
                  disabled={!topic.trim() || generateTestMutation.isPending}
                  data-testid="button-generate-test"
                >
                  {generateTestMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Test...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Test • {TEST_PRICE_SOL} SOL
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border-card-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <span className="text-2xl font-bold text-purple-400">5</span>
              </div>
              <h3 className="font-bold font-serif text-lg">Questions</h3>
              <p className="text-sm text-muted-foreground">
                Each test has 5 carefully crafted questions
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-card-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-bold font-serif text-lg">AI Generated</h3>
              <p className="text-sm text-muted-foreground">
                Instant test creation powered by Gemini AI
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-card-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <Award className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-bold font-serif text-lg">NFT Reward</h3>
              <p className="text-sm text-muted-foreground">
                Earn certificate NFT + SOL rewards
              </p>
            </Card>
          </div>

          {/* Scoring Guide */}
          <Card className="p-8 space-y-6 bg-card/50 border-card-border">
            <h3 className="text-2xl font-bold font-serif text-center">Level Achievement Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 font-bold text-sm">
                  JUNIOR
                </div>
                <p className="text-3xl font-bold">1-2</p>
                <p className="text-sm text-muted-foreground">correct answers</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 font-bold text-sm">
                  MIDDLE
                </div>
                <p className="text-3xl font-bold">3-4</p>
                <p className="text-sm text-muted-foreground">correct answers</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 font-bold text-sm">
                  SENIOR
                </div>
                <p className="text-3xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">correct answers</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Award({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
