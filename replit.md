# SkillChain - Blockchain-Based Professional Certification Platform

## Overview

SkillChain is a Web3 application built on the Solana blockchain that enables users to earn verifiable NFT certificates by taking skill assessment tests. The platform gamifies professional certification by requiring users to pay 0.15 SOL (~$20) to generate AI-powered tests, take the assessment, and receive an NFT certificate representing their achievement level (Junior/Middle/Senior) stored in Solana ecosystem via Metaplex. Users can earn back a portion of their payment as rewards based on test performance.

The application combines educational testing with blockchain technology to create immutable proof of professional skills, targeting a user experience inspired by modern Web3 platforms (Phantom, Magic Eden) and educational platforms (Duolingo, Coursera).

**Current Environment:** The project is now fully configured and running on Replit.

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL database connection (automatically provided by Replit)
- `GEMINI_API_KEY` - Google Gemini API key for AI test generation

Optional:
- `TREASURY_WALLET` - Solana wallet address for receiving test payments (defaults to demo wallet)
- `METAPLEX_PRIVATE_KEY` - Base58-encoded private key for NFT minting (if not set, uses mock NFTs)
  - To enable real NFT minting on Solana:
    1. Create a Solana devnet wallet
    2. Fund it with devnet SOL (use https://faucet.solana.com/)
    3. Export the private key in base58 format
    4. Add as METAPLEX_PRIVATE_KEY secret

## Recent Changes (October 26, 2025)

### Latest Updates - Import and Bug Fixes

**1. Expanded Category Selection (10/15/20 categories)**
- **Change:** Increased category count at all levels for more diverse testing
- **Implementation:**
  - Level 1: 10 main professional categories (was 8)
  - Level 2: 15 narrow subcategories (was 6)
  - Level 3: 20 specific skills (was 5)
- **Files Changed:**
  - `server/gemini.ts` - Updated category generation counts
- **Impact:** Much wider selection of skills and topics for users to test

**2. Test Not Found Bug Fix**
- **Problem:** Users reported "Test not found" error after payment
- **Solution:**
  - Added database verification after test creation
  - Added retry logic (3 attempts, 1s delay) in frontend
  - Enhanced logging for debugging
- **Files Changed:**
  - `server/routes.ts` - Added verification step after test creation
  - `client/src/pages/test-taking.tsx` - Added retry logic to test fetching
- **Impact:** More reliable test creation and loading

**3. NFT Metaplex Integration Status**
- **Current State:** Metaplex NFT minting is ALREADY implemented!
- **How to Enable Real NFTs:**
  1. Create a Solana devnet wallet (use Phantom or solana-keygen)
  2. Fund it with devnet SOL: https://faucet.solana.com/
  3. Export the private key in base58 format
  4. Add it as `METAPLEX_PRIVATE_KEY` secret in Replit
- **Files:** `server/metaplex.ts` - Full Metaplex integration ready
- **Current Behavior:** Uses mock NFTs if METAPLEX_PRIVATE_KEY not set

## Recent Changes (October 26, 2025) - Initial Setup

### Major System Improvements - Complete Redesign

**1. Category-Based Test Selection System**
- **Change:** Replaced free-text topic input with AI-generated category selection
- **Implementation:** 
  - Level 1: Select main category (8 options from AI)
  - Level 2: Select narrow subcategory (6 options from AI)
  - Level 3: Select specific skill (5 options from AI)
  - All categories generated dynamically by Gemini AI
- **Files Changed:**
  - `client/src/pages/tests.tsx` - Complete UI redesign with step-by-step category selection
  - `server/gemini.ts` - Added `generateCategories()` function
  - `server/routes.ts` - Added `/api/categories` endpoint
  - `shared/schema.ts` - Added category schemas
- **Impact:** More structured skill assessment with guided navigation through skill trees

**2. Expanded Test from 5 to 10 Questions**
- **Change:** Tests now have 10 questions instead of 5, each worth 10 points (100 total)
- **Implementation:**
  - Updated Gemini prompts to generate 10 questions
  - Each question worth 10 points
  - Questions progress from easier to harder
- **Files Changed:**
  - `server/gemini.ts` - Updated `generateTestQuestions()` to create 10 questions
  - `shared/schema.ts` - Updated schemas for 10 questions and points field
  - `db/schema.ts` - Added points field to question structure
- **Impact:** More comprehensive skill assessment with finer-grained scoring

**3. New Scoring System (70-100 Scale)**
- **Previous:** 5 questions, simple passing threshold
- **New System:**
  - 90-100 points: Senior level (15% SOL reward)
  - 80-89 points: Middle level (12% SOL reward)
  - 70-79 points: Junior level (10% SOL reward)
  - Below 70: Failed (no certificate, no reward)
- **Files Changed:**
  - `server/routes.ts` - Updated scoring logic in `/api/tests/submit`
  - `client/src/pages/test-taking.tsx` - Updated result display with progress bar
  - `shared/schema.ts` - Added `passed` boolean and updated score range
  - `db/schema.ts` - Added `passed`, `totalPoints`, updated score column
- **Impact:** Clearer achievement tiers with graduated rewards

**4. PostgreSQL Database Integration**
- **Change:** Migrated from in-memory storage to PostgreSQL with Drizzle ORM
- **Implementation:**
  - Created database schema with proper tables
  - Added payment signature tracking to prevent replay attacks
  - Persistent storage for tests, results, certificates, and user stats
- **Files Changed:**
  - `db/schema.ts` - Database schema definition
  - `db/client.ts` - Neon database connection
  - `server/storage.ts` - Complete rewrite using Drizzle ORM
  - `server/routes.ts` - Updated to use database for signature tracking
  - `drizzle.config.ts` - Updated schema path
- **Impact:** Data persistence across server restarts, improved security

**5. Enhanced NFT Certificate Metadata**
- **Change:** Improved NFT metadata for better visibility in Solana ecosystem
- **Implementation:**
  - Enhanced description with formatted details
  - More comprehensive attributes (10 total)
  - Dynamic image generation using DiceBear API
  - Added achievement tiers (Elite, Advanced, Professional)
  - Emoji indicators for levels
- **Files Changed:**
  - `server/metaplex.ts` - Updated `mintCertificateNFT()` with enhanced metadata
- **Impact:** NFT certificates now display beautifully in Solana wallets and marketplaces

**6. Vite Configuration for Replit**
- **Change:** Configured Vite to allow all hosts for Replit proxy
- **Implementation:**
  - Added `host: "0.0.0.0"`, `port: 5000`, `allowedHosts: true`
  - Ensures users can access the app through Replit's iframe proxy
- **Files Changed:**
  - `vite.config.ts` - Added server configuration
- **Impact:** App now accessible to users in Replit environment

**7. Environment Variables & Security**
- **Change:** Moved treasury wallet to environment variable
- **Implementation:**
  - Treasury wallet now uses `process.env.TREASURY_WALLET` with fallback
  - GEMINI_API_KEY properly configured
  - DATABASE_URL automatically provided by Replit
- **Files Changed:**
  - `server/routes.ts` - Updated to use env var for treasury wallet
- **Impact:** Better security and easier configuration management

### Replit Environment Setup
- Installed all npm dependencies
- Configured workflow to run development server on port 5000
- Added GEMINI_API_KEY secret for AI test generation
- Created PostgreSQL database and pushed schema
- Set up deployment configuration for production (autoscale with build step)
- Created .gitignore file with proper Node.js/TypeScript exclusions

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing instead of React Router

**UI Component System:**
- shadcn/ui component library (New York style) with Radix UI primitives for accessible, headless components
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming with light/dark mode support
- Custom design system defined in `design_guidelines.md` featuring Inter and Space Grotesk typography

**State Management:**
- TanStack Query (React Query) for server state management, caching, and data fetching
- Local React state for UI-specific concerns
- Custom hooks pattern for reusable logic

**Solana Integration:**
- `@solana/wallet-adapter-react` for wallet connection abstraction
- `@solana/wallet-adapter-phantom` for Phantom wallet support
- `@solana/web3.js` for blockchain interactions (transactions, balance queries)
- Connection to Solana Devnet for development/testing

**Key Design Patterns:**
- Component composition with shadcn/ui's slot pattern
- Custom hooks for cross-cutting concerns (mobile detection, toasts, wallet state)
- Path aliases (`@/`, `@shared/`) for clean imports
- Separation of UI components, pages, and utility functions

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express.js for the HTTP server
- TypeScript throughout for type safety across frontend and backend
- ESM modules (not CommonJS) as indicated by `"type": "module"`

**API Design:**
- RESTful API endpoints under `/api` prefix
- Zod schemas in `shared/schema.ts` for request/response validation shared between client and server
- Payment verification through on-chain transaction validation before test generation
- Signature-based replay attack prevention using a Set to track used transaction signatures

**Key API Flows:**

1. **Test Generation Flow:**
   - User pays 0.15 SOL (~$20) to treasury wallet via Solana transaction
   - Backend verifies payment on-chain using transaction signature
   - AI generates 5 multiple-choice questions via Gemini API
   - Test stored in memory storage with unique ID
   - Test ID returned to client for navigation

2. **Test Submission Flow:**
   - User answers are submitted with wallet address
   - Backend calculates score and determines level (Junior/Middle/Senior)
   - Certificate NFT minting initiated (currently mock implementation)
   - SOL reward calculated and stored in user stats

**AI Integration:**
- Google Gemini AI (gemini-2.5-flash model) for generating test questions
- Structured JSON output using Gemini's schema-based generation
- System prompts ensure consistent, high-quality question format

**NFT/Blockchain Features:**
- Metaplex SDK integration for NFT minting (foundation laid, currently returns mock data)
- Certificate metadata includes topic, level, score, and blockchain attributes
- NFT serves as immutable proof of skill certification

### Data Storage

**Current Implementation:**
- In-memory storage using JavaScript Maps (`MemStorage` class)
- No database persistence in current build
- Data structures:
  - Tests: Map of test ID to Test object
  - Test Results: Map of wallet address to TestResult array
  - Certificates: Map of wallet address to Certificate array
  - User Stats: Map of wallet address to aggregated statistics

**Database Configuration (Prepared but Not Active):**
- Drizzle ORM configured for PostgreSQL
- Neon Database serverless driver ready (`@neondatabase/serverless`)
- Schema defined in `shared/schema.ts` with Zod validation
- Migration directory configured (`./migrations`)
- Database currently requires explicit provisioning (DATABASE_URL env var)

**Data Models:**
- `Test`: Contains topic, questions array, and metadata
- `Question`: Question text, 4 options, correct answer index
- `TestResult`: Score, level, completion time, rewards
- `Certificate`: NFT details including mint address and metadata URI
- `UserStats`: Aggregated metrics (tests taken, average score, total earned)

### External Dependencies

**Blockchain Services:**
- Solana Devnet RPC endpoints via `clusterApiUrl("devnet")`
- Treasury wallet for receiving test payments (currently hardcoded public key)
- Metaplex protocol for NFT minting and metadata standards

**AI Services:**
- Google Gemini API (gemini-2.5-flash) for test question generation
- Requires `GEMINI_API_KEY` environment variable
- Structured output with JSON schema validation

**Third-Party Libraries:**
- Radix UI primitives for 20+ accessible component patterns
- bs58 for base58 encoding/decoding of blockchain addresses
- nanoid for generating unique IDs
- class-variance-authority for component variant management
- tailwind-merge for className merging utilities

**Development Tools:**
- Replit-specific plugins for dev banner, cartographer, and runtime error overlay
- esbuild for server-side bundling in production
- TypeScript compiler for type checking (check script)

**Payment Flow:**
- On-chain payment verification prevents backend exploitation
- Transaction must be confirmed on Solana blockchain before test generation
- Signature tracking prevents replay attacks

**Security Considerations:**
- Wallet signatures used for user identification
- Payment verification happens on-chain (trustless)
- No private key handling on backend
- Mock keypair used for Metaplex identity (needs production wallet solution)