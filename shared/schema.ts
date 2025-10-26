import { z } from "zod";

// Test Question Schema
export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
});

export type Question = z.infer<typeof questionSchema>;

// Test Schema
export const testSchema = z.object({
  id: z.string(),
  topic: z.string(),
  questions: z.array(questionSchema),
  createdAt: z.string(),
});

export type Test = z.infer<typeof testSchema>;

// Test Submission Schema
export const testSubmissionSchema = z.object({
  testId: z.string(),
  walletAddress: z.string(),
  answers: z.array(z.number()),
});

export type TestSubmission = z.infer<typeof testSubmissionSchema>;

// Test Result Schema
export const testResultSchema = z.object({
  testId: z.string(),
  topic: z.string(),
  score: z.number().min(0).max(5),
  level: z.enum(["Junior", "Middle", "Senior"]),
  correctAnswers: z.number(),
  totalQuestions: z.number(),
  solReward: z.number(),
  completedAt: z.string(),
});

export type TestResult = z.infer<typeof testResultSchema>;

// Certificate/NFT Schema
export const certificateSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  topic: z.string(),
  level: z.enum(["Junior", "Middle", "Senior"]),
  score: z.number(),
  nftMint: z.string().optional(),
  nftMetadataUri: z.string().optional(),
  earnedAt: z.string(),
});

export type Certificate = z.infer<typeof certificateSchema>;

// User Stats Schema
export const userStatsSchema = z.object({
  walletAddress: z.string(),
  totalTests: z.number(),
  totalCertificates: z.number(),
  successRate: z.number(),
  totalSolEarned: z.number(),
  certificates: z.array(certificateSchema),
});

export type UserStats = z.infer<typeof userStatsSchema>;

// API Request/Response Schemas
export const generateTestRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  walletAddress: z.string(),
  paymentSignature: z.string().min(1, "Payment signature required"), // Transaction signature for backend verification
});

export type GenerateTestRequest = z.infer<typeof generateTestRequestSchema>;

export const generateTestResponseSchema = z.object({
  test: testSchema,
  paymentRequired: z.boolean(),
  amount: z.number(),
});

export type GenerateTestResponse = z.infer<typeof generateTestResponseSchema>;
