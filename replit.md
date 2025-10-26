# SkillChain - Blockchain-Based Professional Certification Platform

## Overview

SkillChain is a Web3 application built on the Solana blockchain that enables users to earn verifiable NFT certificates by taking skill assessment tests. The platform gamifies professional certification by requiring users to pay 1 SOL to generate AI-powered tests, take the assessment, and receive an NFT certificate representing their achievement level (Junior/Middle/Senior). Users can earn back a portion of their payment as rewards based on test performance.

The application combines educational testing with blockchain technology to create immutable proof of professional skills, targeting a user experience inspired by modern Web3 platforms (Phantom, Magic Eden) and educational platforms (Duolingo, Coursera).

**Current Environment:** The project is now fully configured and running on Replit.

## Recent Changes (October 26, 2025)

### Fixed Critical Payment Verification Issues

**Issue #1: Treasury Wallet Mismatch**
- **Problem:** Treasury wallet addresses were mismatched between frontend and backend, causing SOL to be sent but tests not generated
- **Solution:** Synchronized treasury wallet address to `9B5XszUGdMaxCZ7uSQhPzdks5ZQSmWxrmzCSvtJ6Ns6g` across both frontend and backend
- **Impact:** Payment verification now works correctly - SOL payments are properly verified before test generation

**Issue #2: Response Parsing Error (Test Generation)**
- **Problem:** Frontend was not parsing JSON from server response, causing test data to be lost even when payment was successful
- **Solution:** Added `.json()` call to parse server response in `client/src/pages/tests.tsx`
- **Code Change:** Changed from `return response` to `const result = await response.json() as GenerateTestResponse; return result;`
- **Impact:** Test generation now works end-to-end - after payment, user is redirected to test page with generated questions

**Issue #3: Response Parsing Error (Test Submission)**
- **Problem:** After completing a test and clicking submit, the app crashed with "Cannot read properties of undefined (reading 'toUpperCase')" because `testResult.level` was undefined
- **Solution:** Added `.json()` call to parse server response in `client/src/pages/test-taking.tsx` (same issue as #2)
- **Code Change:** In `submitTestMutation`, changed from `const result = await apiRequest<TestResult>('POST', '/api/tests/submit', data); return result;` to `const response = await apiRequest('POST', '/api/tests/submit', data); const result = await response.json() as TestResult; return result;`
- **Impact:** Test submission now works correctly - users see their score, level (Junior/Middle/Senior), SOL reward, and NFT certificate confirmation

### Replit Environment Setup
- Installed all npm dependencies
- Configured workflow to run development server on port 5000
- Added GEMINI_API_KEY secret for AI test generation
- Confirmed DATABASE_URL is available for future PostgreSQL integration
- Set up deployment configuration for production (autoscale)
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
   - User pays 1 SOL to treasury wallet via Solana transaction
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