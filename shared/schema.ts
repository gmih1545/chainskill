import { z } from "zod";

// Test Question Schema - 10 questions, 10 points each
export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  points: z.number().default(10), // Each question worth 10 points
});

export type Question = z.infer<typeof questionSchema>;

// Category Schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(), // 1 = main, 2 = narrow, 3 = specific
});

export type Category = z.infer<typeof categorySchema>;

// Test Schema - now with categories
export const testSchema = z.object({
  id: z.string(),
  topic: z.string(),
  mainCategory: z.string(),
  narrowCategory: z.string(),
  specificCategory: z.string(),
  questions: z.array(questionSchema).length(10), // Always 10 questions
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

// Test Result Schema - updated for 100 point scale
export const testResultSchema = z.object({
  testId: z.string(),
  walletAddress: z.string(),
  topic: z.string(),
  score: z.number().min(0).max(100), // 0-100 points
  level: z.enum(["Junior", "Middle", "Senior", "Failed"]), // Failed if < 70
  correctAnswers: z.number(),
  totalQuestions: z.number().default(10),
  totalPoints: z.number().default(100),
  solReward: z.number(),
  completedAt: z.string(),
  passed: z.boolean(), // true if score >= 70
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

// Category Request/Response Schemas
export const getCategoriesRequestSchema = z.object({
  level: z.number().min(1).max(3), // 1 = main, 2 = narrow, 3 = specific
  parentCategory: z.string().optional(), // Required for level 2 and 3
});

export type GetCategoriesRequest = z.infer<typeof getCategoriesRequestSchema>;

export const getCategoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
});

export type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;

// API Request/Response Schemas
export const generateTestRequestSchema = z.object({
  mainCategory: z.string().min(1, "Main category is required"),
  narrowCategory: z.string().min(1, "Narrow category is required"),
  specificCategory: z.string().min(1, "Specific category is required"),
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
