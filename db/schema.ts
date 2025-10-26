import { pgTable, text, integer, timestamp, jsonb, serial, unique } from "drizzle-orm/pg-core";

export const tests = pgTable("tests", {
  id: text("id").primaryKey(),
  topic: text("topic").notNull(),
  mainCategory: text("main_category").notNull(),
  narrowCategory: text("narrow_category").notNull(),
  specificCategory: text("specific_category").notNull(),
  questions: jsonb("questions").notNull().$type<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
  }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  topic: text("topic").notNull(),
  score: integer("score").notNull(), // 0-100 points
  level: text("level").notNull(), // Junior, Middle, Senior, Failed
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull().default(10),
  totalPoints: integer("total_points").notNull().default(100),
  solReward: integer("sol_reward").notNull(), // Store as lamports or multiply by 1000 to avoid decimals
  passed: integer("passed").notNull().default(0), // 0 = failed, 1 = passed (SQLite uses integers for booleans)
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  topic: text("topic").notNull(),
  level: text("level").notNull(),
  score: integer("score").notNull(),
  nftMint: text("nft_mint"),
  nftMetadataUri: text("nft_metadata_uri"),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const userStats = pgTable("user_stats", {
  walletAddress: text("wallet_address").primaryKey(),
  totalTests: integer("total_tests").notNull().default(0),
  totalCertificates: integer("total_certificates").notNull().default(0),
  successRate: integer("success_rate").notNull().default(0),
  totalSolEarned: integer("total_sol_earned").notNull().default(0), // Store as lamports or multiply by 1000
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentSignatures = pgTable("payment_signatures", {
  id: serial("id").primaryKey(),
  signature: text("signature").notNull().unique(),
  walletAddress: text("wallet_address").notNull(),
  amount: integer("amount").notNull(), // lamports
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
