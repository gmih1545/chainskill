import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Solana devnet configuration
export const NETWORK = 'devnet';
export const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

// Test pricing in SOL (approximately $20 at average SOL price)
export const TEST_PRICE_SOL = 0.15;
export const TEST_PRICE_LAMPORTS = TEST_PRICE_SOL * LAMPORTS_PER_SOL;

// Reward percentage
export const REWARD_PERCENTAGE = 0.1; // 10% reward

// Treasury wallet (for receiving test payments)
export const TREASURY_WALLET = new PublicKey('9B5XszUGdMaxCZ7uSQhPzdks5ZQSmWxrmzCSvtJ6Ns6g');

// Helper functions
export const formatSolBalance = (lamports: number): string => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const getLevelFromScore = (score: number): 'Junior' | 'Middle' | 'Senior' => {
  if (score === 5) return 'Senior';
  if (score >= 3) return 'Middle';
  return 'Junior';
};

export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'Senior':
      return 'from-purple-500 to-pink-500';
    case 'Middle':
      return 'from-blue-500 to-cyan-500';
    case 'Junior':
      return 'from-green-500 to-emerald-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export const getLevelBadgeColor = (level: string): string => {
  switch (level) {
    case 'Senior':
      return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30';
    case 'Middle':
      return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30';
    case 'Junior':
      return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};
