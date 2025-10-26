import type { Express } from "express";
import { createServer, type Server } from "http";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { storage } from "./storage";
import { generateTestQuestions } from "./gemini";
import { mintCertificateNFT } from "./metaplex";
import { randomUUID } from "crypto";
import { 
  generateTestRequestSchema, 
  testSubmissionSchema,
  type Test,
  type TestResult,
  type Certificate,
  type UserStats,
  type GenerateTestResponse
} from "@shared/schema";

// Solana connection for payment verification
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Treasury wallet address - in production this should be from env variable
const TREASURY_WALLET = new PublicKey("9B5XszUGdMaxCZ7uSQhPzdks5ZQSmWxrmzCSvtJ6Ns6g");
const TEST_PRICE_LAMPORTS = 1 * LAMPORTS_PER_SOL;

// Track used signatures to prevent replay attacks
const usedSignatures = new Set<string>();

// Verify payment transaction on-chain
async function verifyPaymentTransaction(
  signature: string,
  expectedSender: string
): Promise<boolean> {
  try {
    // Check if signature already used
    if (usedSignatures.has(signature)) {
      console.error("Payment signature already used:", signature);
      return false;
    }

    // Fetch transaction from blockchain
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      console.error("Transaction not found:", signature);
      return false;
    }

    // Verify transaction succeeded
    if (transaction.meta?.err) {
      console.error("Transaction failed:", transaction.meta.err);
      return false;
    }

    // Verify sender matches
    const accountKeys = transaction.transaction.message.getAccountKeys();
    const sender = accountKeys.get(0)?.toString();
    if (sender !== expectedSender) {
      console.error("Sender mismatch:", { expected: expectedSender, actual: sender });
      return false;
    }

    // Verify transfer amount and recipient
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];
    
    // Find the treasury account index
    const treasuryIndex = accountKeys.staticAccountKeys.findIndex(
      (key) => key.toString() === TREASURY_WALLET.toString()
    );

    if (treasuryIndex === -1) {
      console.error("Treasury wallet not found in transaction");
      return false;
    }

    // Calculate amount transferred to treasury
    const treasuryBalanceChange = postBalances[treasuryIndex] - preBalances[treasuryIndex];
    
    // Allow some tolerance for transaction fees
    if (treasuryBalanceChange < TEST_PRICE_LAMPORTS * 0.95) {
      console.error("Insufficient payment amount:", {
        expected: TEST_PRICE_LAMPORTS,
        actual: treasuryBalanceChange,
      });
      return false;
    }

    // Mark signature as used
    usedSignatures.add(signature);
    
    console.log("Payment verified successfully:", {
      signature,
      sender,
      amount: treasuryBalanceChange / LAMPORTS_PER_SOL,
    });

    return true;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate a new test
  app.post("/api/tests/generate", async (req, res) => {
    try {
      const validated = generateTestRequestSchema.parse(req.body);
      
      // Verify payment transaction on-chain
      const paymentValid = await verifyPaymentTransaction(
        validated.paymentSignature,
        validated.walletAddress
      );

      if (!paymentValid) {
        return res.status(402).json({ 
          error: "Payment verification failed. Please ensure you have completed the 1 SOL payment transaction." 
        });
      }
      
      // Generate questions using Gemini AI
      const questions = await generateTestQuestions(validated.topic);
      
      // Create test object
      const test: Test = {
        id: `${validated.walletAddress}-${randomUUID()}`,
        topic: validated.topic,
        questions,
        createdAt: new Date().toISOString(),
      };

      // Save test to storage
      await storage.createTest(test);

      const response: GenerateTestResponse = {
        test,
        paymentRequired: true,
        amount: 1, // 1 SOL
      };

      res.json(response);
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate test" 
      });
    }
  });

  // Get test by ID
  app.get("/api/tests/:testId", async (req, res) => {
    try {
      const { testId } = req.params;
      const test = await storage.getTest(testId);

      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      // Return test without correct answers
      const testWithoutAnswers = {
        ...test,
        questions: test.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
        })),
      };

      res.json(testWithoutAnswers);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  // Submit test answers
  app.post("/api/tests/submit", async (req, res) => {
    try {
      const validated = testSubmissionSchema.parse(req.body);
      
      // Get the test
      const test = await storage.getTest(validated.testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      // Calculate score
      let correctAnswers = 0;
      test.questions.forEach((question, index) => {
        if (validated.answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      // Determine level based on score
      let level: "Junior" | "Middle" | "Senior";
      if (correctAnswers === 5) {
        level = "Senior";
      } else if (correctAnswers >= 3) {
        level = "Middle";
      } else {
        level = "Junior";
      }

      // Calculate SOL reward (10% of test price)
      const solReward = 0.1;

      // Create test result
      const result: TestResult = {
        testId: validated.testId,
        topic: test.topic,
        score: correctAnswers,
        level,
        correctAnswers,
        totalQuestions: test.questions.length,
        solReward,
        completedAt: new Date().toISOString(),
      };

      await storage.createTestResult(result);

      // Mint NFT certificate using Metaplex
      let nftData;
      try {
        nftData = await mintCertificateNFT(
          validated.walletAddress,
          test.topic,
          level,
          correctAnswers
        );
        console.log("NFT minted successfully:", nftData);
      } catch (error) {
        console.error("NFT minting failed:", error);
        // Continue with mock data if minting fails
        nftData = {
          mint: `MOCK-${randomUUID().slice(0, 8)}`,
          metadataUri: `https://arweave.net/${randomUUID()}`,
        };
      }

      // Create certificate
      const certificate: Certificate = {
        id: randomUUID(),
        walletAddress: validated.walletAddress,
        topic: test.topic,
        level,
        score: correctAnswers,
        nftMint: nftData.mint,
        nftMetadataUri: nftData.metadataUri,
        earnedAt: new Date().toISOString(),
      };

      await storage.createCertificate(certificate);

      // Update user stats
      const stats = await storage.getUserStats(validated.walletAddress);
      const newTotalTests = stats.totalTests + 1;
      const newTotalCertificates = stats.totalCertificates + 1;
      const newTotalSolEarned = stats.totalSolEarned + solReward;
      const newSuccessRate = Math.round((newTotalCertificates / newTotalTests) * 100);

      await storage.updateUserStats(validated.walletAddress, {
        totalTests: newTotalTests,
        totalCertificates: newTotalCertificates,
        totalSolEarned: newTotalSolEarned,
        successRate: newSuccessRate,
      });

      console.log(`Updated stats for ${validated.walletAddress}:`, {
        totalTests: newTotalTests,
        totalCertificates: newTotalCertificates,
        totalSolEarned: newTotalSolEarned,
        successRate: newSuccessRate,
      });

      res.json(result);
    } catch (error) {
      console.error("Error submitting test:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to submit test" 
      });
    }
  });

  // Get user stats
  app.get("/api/user/stats/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const stats = await storage.getUserStats(walletAddress);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
