import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2, Sparkles, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TEST_PRICE_SOL, TEST_PRICE_LAMPORTS, TREASURY_WALLET } from '@/lib/solana';
import { apiRequest } from '@/lib/queryClient';
import type { GenerateTestResponse, Category, GetCategoriesResponse } from '@shared/schema';

export default function Tests() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [, setLocation] = useLocation();
  
  // Category selection state
  const [step, setStep] = useState(1); // 1 = main, 2 = narrow, 3 = specific, 4 = payment
  const [mainCategory, setMainCategory] = useState('');
  const [narrowCategory, setNarrowCategory] = useState('');
  const [specificCategory, setSpecificCategory] = useState('');

  // Fetch categories for current step
  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useQuery<GetCategoriesResponse>({
    queryKey: ['/api/categories', step, mainCategory, narrowCategory],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/categories', {
        level: step,
        parentCategory: step === 2 ? mainCategory : step === 3 ? narrowCategory : undefined,
      });
      return response.json();
    },
    enabled: !!publicKey && step <= 3,
  });

  const generateTestMutation = useMutation({
    mutationFn: async (data: { 
      mainCategory: string; 
      narrowCategory: string; 
      specificCategory: string;
      walletAddress: string;
    }) => {
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

      // Step 2: Generate test after payment confirmed
      const response = await apiRequest('POST', '/api/tests/generate', {
        ...data,
        paymentSignature: signature,
      });
      const result = await response.json() as GenerateTestResponse;
      return result;
    },
    onSuccess: (data) => {
      if (data.test) {
        setLocation(`/test/${data.test.id}`);
      }
    },
  });

  const handleCategorySelect = (category: string) => {
    if (step === 1) {
      setMainCategory(category);
      setStep(2);
    } else if (step === 2) {
      setNarrowCategory(category);
      setStep(3);
    } else if (step === 3) {
      setSpecificCategory(category);
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setMainCategory('');
      } else if (step === 3) {
        setNarrowCategory('');
      } else if (step === 4) {
        setSpecificCategory('');
      }
    }
  };

  const handleGenerateTest = () => {
    if (!publicKey) return;

    generateTestMutation.mutate({
      mainCategory,
      narrowCategory,
      specificCategory,
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

  const stepTitles = {
    1: "Choose Main Category",
    2: "Choose Specialization",
    3: "Choose Specific Skill",
    4: "Confirm & Pay"
  };

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
              Select your skill area step by step, and our AI will create a custom 10-question test. Score 70+ to earn your NFT certificate!
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s === step 
                      ? 'bg-primary text-primary-foreground' 
                      : s < step 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <ChevronRight className={`h-5 w-5 mx-2 ${s < step ? 'text-green-500' : 'text-muted-foreground'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Breadcrumbs */}
          {(mainCategory || narrowCategory || specificCategory) && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Your selection:</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {mainCategory && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {mainCategory}
                  </span>
                )}
                {narrowCategory && (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {narrowCategory}
                    </span>
                  </>
                )}
                {specificCategory && (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {specificCategory}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Category Selection or Payment */}
          <Card className="p-8 sm:p-12 space-y-8 animate-scale-in border-card-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-serif text-center">
                {stepTitles[step as keyof typeof stepTitles]}
              </h2>

              {step <= 3 ? (
                <>
                  {loadingCategories ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3 text-muted-foreground">Loading categories...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categories?.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.name)}
                          className="p-4 text-left border-2 border-muted hover:border-primary rounded-lg transition-all hover:shadow-md bg-card"
                        >
                          <h3 className="font-semibold text-lg">{cat.name}</h3>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                    <h3 className="font-semibold text-lg">Test Details:</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Category:</span> {mainCategory} → {narrowCategory} → {specificCategory}</p>
                      <p><span className="font-medium">Questions:</span> 10 questions (10 points each)</p>
                      <p><span className="font-medium">Passing Score:</span> 70 points minimum</p>
                      <p><span className="font-medium">Levels:</span></p>
                      <ul className="ml-6 space-y-1">
                        <li>• 90-100 points: Senior</li>
                        <li>• 80-89 points: Middle</li>
                        <li>• 70-79 points: Junior</li>
                        <li>• Below 70: No certificate</li>
                      </ul>
                    </div>
                  </div>

                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Payment Required:</strong> {TEST_PRICE_SOL} SOL will be sent to the treasury wallet. 
                      You'll earn back 10-15% SOL as rewards based on your performance!
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleGenerateTest}
                    disabled={generateTestMutation.isPending}
                    className="w-full h-14 text-lg"
                    data-testid="button-generate-test"
                  >
                    {generateTestMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {generateTestMutation.isPending ? 'Processing Payment...' : 'Generating Test...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Pay {TEST_PRICE_SOL} SOL & Generate Test
                      </>
                    )}
                  </Button>

                  {generateTestMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {generateTestMutation.error instanceof Error 
                          ? generateTestMutation.error.message 
                          : 'Failed to generate test. Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Back Button */}
            {step > 1 && !generateTestMutation.isPending && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border-card-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold font-serif">10 Questions</h3>
              <p className="text-sm text-muted-foreground">
                Each question worth 10 points. Total 100 points possible.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-card-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <AlertCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold font-serif">Score 70+ to Pass</h3>
              <p className="text-sm text-muted-foreground">
                Get 7+ correct answers to earn your NFT certificate.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-card-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold font-serif">Earn SOL Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get back 10-15% SOL based on your performance level.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
