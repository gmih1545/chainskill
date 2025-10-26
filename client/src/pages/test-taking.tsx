import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { getLevelBadgeColor, TEST_PRICE_SOL } from '@/lib/solana';
import type { Test, TestResult } from '@shared/schema';

export default function TestTaking() {
  const { testId } = useParams<{ testId: string }>();
  const { publicKey } = useWallet();
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const { data: test, isLoading, error } = useQuery<Test>({
    queryKey: ['/api/tests', testId],
    queryFn: async () => {
      console.log(`Fetching test with ID: ${testId}`);
      const response = await fetch(`/api/tests/${testId}`);
      if (!response.ok) {
        console.error(`Failed to fetch test ${testId}: ${response.status} ${response.statusText}`);
        throw new Error('Failed to fetch test');
      }
      const data = await response.json();
      console.log(`Test loaded successfully:`, data);
      return data;
    },
    enabled: !!testId,
    retry: 3, // Retry up to 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });

  const submitTestMutation = useMutation({
    mutationFn: async (data: { testId: string; walletAddress: string; answers: number[] }) => {
      const response = await apiRequest('POST', '/api/tests/submit', data);
      const result = await response.json() as TestResult;
      return result;
    },
    onSuccess: (result) => {
      setTestResult(result);
      setShowResult(true);
    },
  });

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (test?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!publicKey || !test) return;

    submitTestMutation.mutate({
      testId: test.id,
      walletAddress: publicKey.toString(),
      answers: selectedAnswers,
    });
  };

  const allQuestionsAnswered = selectedAnswers.length === test?.questions.length && 
    selectedAnswers.every(answer => answer !== undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center space-y-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold font-serif">Test Not Found</h2>
          <Button onClick={() => setLocation('/tests')} data-testid="button-back-to-tests">
            Back to Tests
          </Button>
        </Card>
      </div>
    );
  }

  if (showResult && testResult) {
    const passed = testResult.passed;
    const scorePercentage = (testResult.score / testResult.totalPoints) * 100;

    return (
      <div className="min-h-screen py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-8 animate-scale-in">
            <Card className="p-8 sm:p-12 text-center space-y-8 border-card-border">
              <div className="space-y-4">
                <div className="flex justify-center">
                  {passed ? (
                    <Trophy className="h-20 w-20 text-primary" />
                  ) : (
                    <XCircle className="h-20 w-20 text-destructive" />
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-serif">
                  {passed ? 'Test Passed!' : 'Test Not Passed'}
                </h1>
                <p className="text-lg text-muted-foreground">{testResult.topic}</p>
              </div>

              <div className="space-y-6 py-6">
                {passed && (
                  <div className="flex justify-center">
                    <div className={`px-6 py-3 rounded-full border font-bold text-lg ${getLevelBadgeColor(testResult.level)}`}>
                      {testResult.level.toUpperCase()}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-card space-y-2">
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-3xl font-bold">
                      {testResult.score}/{testResult.totalPoints}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testResult.correctAnswers} correct out of {testResult.totalQuestions}
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-card space-y-2">
                    <p className="text-sm text-muted-foreground">Reward</p>
                    <p className={`text-3xl font-bold ${passed ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {passed ? `+${testResult.solReward} SOL` : '0 SOL'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {passed ? `${(testResult.solReward / TEST_PRICE_SOL * 100).toFixed(0)}% of fee` : 'Need 70+ to earn'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Score</span>
                    <span className="font-semibold">{scorePercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={scorePercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>70 (Junior)</span>
                    <span>80 (Middle)</span>
                    <span>90 (Senior)</span>
                    <span>100</span>
                  </div>
                </div>

                {passed ? (
                  <Alert className="border-primary/30 bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary">
                      🎉 Congratulations! Your NFT certificate is being minted on Solana devnet!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need at least 70 points to earn an NFT certificate. Try again to improve your score!
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/tests')}
                  className="flex-1"
                  data-testid="button-take-another"
                >
                  {passed ? 'Take Another Test' : 'Try Again'}
                </Button>
                {passed && (
                  <Button
                    onClick={() => setLocation('/profile')}
                    className="flex-1"
                    data-testid="button-view-certificates"
                  >
                    View My Certificates
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/tests')}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <Card className="p-6 space-y-4 border-card-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif">{test.topic}</h2>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {test.questions.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{TEST_PRICE_SOL} SOL</p>
                  <p className="text-xs text-muted-foreground">Test fee</p>
                </div>
              </div>
              <Progress value={progress} className="h-2" data-testid="progress-test" />
            </Card>
          </div>

          {/* Question Card */}
          <Card className="p-8 sm:p-12 space-y-8 animate-fade-in border-card-border">
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-semibold leading-relaxed">
                {question.question}
              </h3>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all hover-elevate ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                    data-testid={`option-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          selectedAnswers[currentQuestion] === index
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="h-3 w-3 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span className="text-lg">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
              data-testid="button-previous"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentQuestion === test.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered || submitTestMutation.isPending}
                className="gap-2 min-w-[140px]"
                data-testid="button-submit-test"
              >
                {submitTestMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Test
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="gap-2 min-w-[140px]"
                data-testid="button-next"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {submitTestMutation.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {submitTestMutation.error instanceof Error
                  ? submitTestMutation.error.message
                  : 'Failed to submit test. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
