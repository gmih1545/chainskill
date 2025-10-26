import { randomUUID } from "crypto";
import type { Test, TestResult, Certificate, UserStats } from "@shared/schema";

export interface IStorage {
  // Test management
  createTest(test: Test): Promise<Test>;
  getTest(id: string): Promise<Test | undefined>;
  
  // Test results and certificates
  createTestResult(result: TestResult): Promise<TestResult>;
  createCertificate(certificate: Certificate): Promise<Certificate>;
  
  // User stats
  getUserStats(walletAddress: string): Promise<UserStats>;
  updateUserStats(walletAddress: string, stats: Partial<UserStats>): Promise<void>;
}

export class MemStorage implements IStorage {
  private tests: Map<string, Test>;
  private testResults: Map<string, TestResult[]>;
  private certificates: Map<string, Certificate[]>;
  private userStats: Map<string, UserStats>;

  constructor() {
    this.tests = new Map();
    this.testResults = new Map();
    this.certificates = new Map();
    this.userStats = new Map();
  }

  async createTest(test: Test): Promise<Test> {
    this.tests.set(test.id, test);
    return test;
  }

  async getTest(id: string): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async createTestResult(result: TestResult): Promise<TestResult> {
    const walletAddress = result.testId.split('-')[0]; // Extract wallet from testId
    const results = this.testResults.get(walletAddress) || [];
    results.push(result);
    this.testResults.set(walletAddress, results);
    return result;
  }

  async createCertificate(certificate: Certificate): Promise<Certificate> {
    const certs = this.certificates.get(certificate.walletAddress) || [];
    certs.push(certificate);
    this.certificates.set(certificate.walletAddress, certs);
    return certificate;
  }

  async getUserStats(walletAddress: string): Promise<UserStats> {
    const existing = this.userStats.get(walletAddress);
    if (existing) {
      // Update certificates array
      const certs = this.certificates.get(walletAddress) || [];
      existing.certificates = certs;
      return existing;
    }

    const newStats: UserStats = {
      walletAddress,
      totalTests: 0,
      totalCertificates: 0,
      successRate: 0,
      totalSolEarned: 0,
      certificates: [],
    };

    this.userStats.set(walletAddress, newStats);
    return newStats;
  }

  async updateUserStats(walletAddress: string, updates: Partial<UserStats>): Promise<void> {
    const stats = await this.getUserStats(walletAddress);
    const updated = { ...stats, ...updates };
    this.userStats.set(walletAddress, updated);
  }
}

export const storage = new MemStorage();
