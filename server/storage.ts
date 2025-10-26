import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { tests, testResults, certificates, userStats, paymentSignatures } from "../db/schema";
import type { Test, TestResult, Certificate, UserStats } from "@shared/schema";

export interface IStorage {
  createTest(test: Test): Promise<Test>;
  getTest(id: string): Promise<Test | undefined>;
  
  createTestResult(result: TestResult): Promise<TestResult>;
  createCertificate(certificate: Certificate): Promise<Certificate>;
  
  getUserStats(walletAddress: string): Promise<UserStats>;
  updateUserStats(walletAddress: string, stats: Partial<UserStats>): Promise<void>;
  
  isPaymentSignatureUsed(signature: string): Promise<boolean>;
  markPaymentSignatureUsed(signature: string, walletAddress: string, amount: number): Promise<void>;
}

export class PostgresStorage implements IStorage {
  async createTest(test: Test): Promise<Test> {
    await db.insert(tests).values({
      id: test.id,
      topic: test.topic,
      mainCategory: test.mainCategory,
      narrowCategory: test.narrowCategory,
      specificCategory: test.specificCategory,
      questions: test.questions,
    });
    return test;
  }

  async getTest(id: string): Promise<Test | undefined> {
    const result = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
    if (!result || !Array.isArray(result) || result.length === 0) return undefined;
    
    const row = result[0];
    return {
      id: row.id,
      topic: row.topic,
      mainCategory: row.mainCategory,
      narrowCategory: row.narrowCategory,
      specificCategory: row.specificCategory,
      questions: row.questions as Array<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        points: number;
      }>,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createTestResult(result: TestResult): Promise<TestResult> {
    await db.insert(testResults).values({
      testId: result.testId,
      walletAddress: result.walletAddress,
      topic: result.topic,
      score: result.score,
      level: result.level,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      totalPoints: result.totalPoints,
      solReward: Math.round(result.solReward * 1000),
      passed: result.passed ? 1 : 0,
    });
    return result;
  }

  async createCertificate(certificate: Certificate): Promise<Certificate> {
    await db.insert(certificates).values({
      id: certificate.id,
      walletAddress: certificate.walletAddress,
      topic: certificate.topic,
      level: certificate.level,
      score: certificate.score,
      nftMint: certificate.nftMint,
      nftMetadataUri: certificate.nftMetadataUri,
    });
    return certificate;
  }

  async getUserStats(walletAddress: string): Promise<UserStats> {
    const stats = await db.select()
      .from(userStats)
      .where(eq(userStats.walletAddress, walletAddress))
      .limit(1);

    const userCerts = await db.select()
      .from(certificates)
      .where(eq(certificates.walletAddress, walletAddress));

    const certsData: Certificate[] = (userCerts && Array.isArray(userCerts) ? userCerts : []).map(c => ({
      id: c.id,
      walletAddress: c.walletAddress,
      topic: c.topic,
      level: c.level as "Junior" | "Middle" | "Senior",
      score: c.score,
      nftMint: c.nftMint || undefined,
      nftMetadataUri: c.nftMetadataUri || undefined,
      earnedAt: c.earnedAt.toISOString(),
    }));

    if (!stats || !Array.isArray(stats) || stats.length === 0) {
      const newStats: UserStats = {
        walletAddress,
        totalTests: 0,
        totalCertificates: 0,
        successRate: 0,
        totalSolEarned: 0,
        certificates: certsData,
      };

      await db.insert(userStats).values({
        walletAddress,
        totalTests: 0,
        totalCertificates: 0,
        successRate: 0,
        totalSolEarned: 0,
      });

      return newStats;
    }

    const stat = stats[0];
    return {
      walletAddress: stat.walletAddress,
      totalTests: stat.totalTests,
      totalCertificates: stat.totalCertificates,
      successRate: stat.successRate,
      totalSolEarned: stat.totalSolEarned / 1000,
      certificates: certsData,
    };
  }

  async updateUserStats(walletAddress: string, updates: Partial<UserStats>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.totalTests !== undefined) {
      dbUpdates.totalTests = updates.totalTests;
    }
    if (updates.totalCertificates !== undefined) {
      dbUpdates.totalCertificates = updates.totalCertificates;
    }
    if (updates.successRate !== undefined) {
      dbUpdates.successRate = updates.successRate;
    }
    if (updates.totalSolEarned !== undefined) {
      dbUpdates.totalSolEarned = Math.round(updates.totalSolEarned * 1000);
    }

    await db.update(userStats)
      .set(dbUpdates)
      .where(eq(userStats.walletAddress, walletAddress));
  }

  async isPaymentSignatureUsed(signature: string): Promise<boolean> {
    try {
      const result = await db.select()
        .from(paymentSignatures)
        .where(eq(paymentSignatures.signature, signature))
        .limit(1);
      
      return result && Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error("Error checking payment signature:", error);
      // If there's an error checking, assume signature is not used (safer to allow payment)
      return false;
    }
  }

  async markPaymentSignatureUsed(signature: string, walletAddress: string, amount: number): Promise<void> {
    try {
      await db.insert(paymentSignatures).values({
        signature,
        walletAddress,
        amount,
      });
    } catch (error) {
      console.error("Error marking payment signature as used:", error);
      // Log but don't throw - the payment was verified on-chain, so it's safe to proceed
    }
  }
}

export const storage = new PostgresStorage();
