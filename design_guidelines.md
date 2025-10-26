# SkillChain Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern Web3 platforms (Phantom, Magic Eden, Opensea) combined with educational platforms (Duolingo, Coursera) to create a gamified certification experience. The provided design screenshots establish a sophisticated dark theme with vibrant accent gradients - this aesthetic will guide our visual direction while we focus on layout and interaction patterns.

---

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts) - for UI elements, body text, navigation
- Display: Space Grotesk (via Google Fonts) - for headings, stats, and emphasis

**Type Scale**:
- Hero headings: text-5xl to text-6xl, font-bold
- Section headings: text-3xl to text-4xl, font-bold
- Card titles: text-xl to text-2xl, font-semibold
- Body text: text-base to text-lg, font-normal
- Labels/metadata: text-sm, font-medium
- Small text/captions: text-xs, font-normal

**Key Typography Patterns**:
- Certificate levels (Junior/Middle/Senior): Uppercase, tracking-wide, text-sm font-bold
- SOL prices: Tabular numbers, text-2xl font-bold
- Stats counters: text-4xl font-bold with gradient text treatment
- Questions: text-xl font-medium, line-height relaxed

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 consistently
- Micro spacing (gaps, padding within components): 2, 4, 6
- Component spacing (between elements): 8, 12, 16
- Section spacing (major divisions): 20, 24, 32

**Grid Structure**:
- Main container: max-w-7xl mx-auto px-4 md:px-8
- Dashboard layout: Two-column on desktop (sidebar + main content)
- NFT gallery: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Test cards: grid-cols-1 lg:grid-cols-2 gap-8

**Viewport Strategy**:
- Header: Fixed positioning, h-16 to h-20
- Content sections: Natural height with py-12 to py-24
- Hero sections: 60-80vh for impact, not forced 100vh
- Cards and modals: Auto height based on content

---

## Component Library

### Navigation Header
**Layout**: Full-width fixed header with blurred backdrop (backdrop-blur-lg)
- Left: Logo + brand name (text-xl font-bold)
- Center: Main navigation links (hidden on mobile, flex on md:)
  - "Dashboard", "Create Test", "My Certificates", "Profile"
- Right: Wallet connection button with balance display
  - Connected state: Shows truncated address + SOL balance with Phantom icon
  - Disconnected state: "Connect Wallet" CTA with wallet icon

**Wallet Display Component**:
- Container: Rounded pill shape (rounded-full px-6 py-3)
- Layout: Flex row with gap-3
- Elements: Phantom logo icon (w-6 h-6) + Address (font-mono text-sm) + Balance (font-bold text-base) + SOL symbol
- Hover state: Slight scale transform, cursor-pointer

### Dashboard Layout
**Sidebar Navigation** (hidden on mobile, visible lg:block):
- Fixed left sidebar, w-64
- Vertical navigation with icons (Heroicons via CDN)
- Items: Dashboard, Create Test, Certificates, Profile, Settings
- Active state: Full-width indicator bar, increased opacity

**Main Content Area**:
- Remaining width with padding pl-0 lg:pl-64
- Stats Overview Section (top of dashboard):
  - 4-column grid on desktop (grid-cols-2 lg:grid-cols-4)
  - Stat cards with large numbers, labels below
  - Metrics: Total Tests, Certificates Earned, Success Rate, Total SOL Earned
  - Each card: p-6, rounded-2xl, hover lift effect

### Test Request Interface
**Hero Section**:
- Centered layout with max-w-3xl
- Large heading: "Generate Your Custom Skill Test"
- Subheading explaining the process
- Prominent input area below

**Input Component**:
- Large text input field (h-16, text-lg)
- Placeholder: "Enter skill or topic (e.g., 'React Hooks', 'Solana Smart Contracts')"
- Submit button integrated into input (absolute right positioning)
- Button displays: "Generate Test • 1 SOL"
- Visual feedback: Border glow on focus

**Info Cards Below Input**:
- 3-column grid explaining the process
- Icons: Question mark, Lightning bolt, Trophy
- Titles: "5 Questions", "Instant AI Generation", "Earn NFT Certificate"
- Short descriptions under each

### Test Taking Interface
**Progress Header**:
- Full-width bar showing question progress (1/5, 2/5, etc.)
- Visual progress bar (w-full h-2 rounded-full)
- Timer display (optional, top-right corner)

**Question Card**:
- Centered, max-w-4xl
- Large question text (text-2xl font-semibold mb-8)
- Answer options: Vertical stack with gap-4
- Each option: Full-width button-like card
  - p-6, rounded-xl, border-2
  - Radio indicator on left
  - Answer text text-lg
  - Hover: Border highlight, slight scale
  - Selected: Distinctive border treatment

**Navigation Footer**:
- Fixed bottom or static below options
- Previous button (if not first question) + Next/Submit button
- Button sizing: px-8 py-4, text-lg font-semibold

### NFT Certificate Display
**Gallery Grid**:
- Masonry-style or standard grid layout
- Each NFT card:
  - Aspect ratio 3:4 or 1:1
  - Image/preview area (placeholder for NFT visual)
  - Info overlay on hover: Test topic, date, level badge
  - Level badge: Positioned top-right, pill shape
  - Score display: "5/5 • Senior" format

**Individual Certificate Modal** (when clicked):
- Full-screen overlay with backdrop
- Certificate centered, max-w-2xl
- Decorative border treatment
- Displays: Test topic (large), Level badge, Score, Date, Wallet address, NFT metadata
- Download/Share buttons at bottom
- Close button (top-right)

### Profile Page
**Header Section**:
- Two-column layout (avatar/identity left, stats right)
- Left: Wallet address display with copy button, join date
- Right: Quick stats grid (4 items in 2x2)

**Tabs Navigation**:
- Horizontal tab bar: "Overview", "Certificates", "Activity"
- Active tab: Border-bottom indicator

**Certificates Tab**:
- Filter controls: Dropdown for level filter (All/Junior/Middle/Senior)
- Sort options: Recent, Score, Topic
- NFT gallery grid (reuses gallery component)

**Activity Feed**:
- Vertical timeline of recent tests
- Each item: Icon + Test topic + Result + Date
- Alternating alignment for visual interest

---

## Form Components

**Text Inputs**:
- Height: h-12 to h-14
- Padding: px-4 py-3
- Rounded: rounded-lg
- Border width: border-2
- Font: text-base
- Focus state: Border emphasis, no outline ring

**Buttons**:
**Primary CTA**:
- Size: px-8 py-4 for major actions, px-6 py-3 for secondary
- Rounded: rounded-xl
- Font: text-base md:text-lg font-semibold
- Icon support: Left or right icon with gap-2
- Examples: "Generate Test", "Submit Answers", "Claim Certificate"

**Secondary Buttons**:
- Similar sizing, different visual treatment
- Used for: "Cancel", "Back", "View Details"

**Icon Buttons**:
- Square or circular: w-10 h-10 or w-12 h-12
- Center content
- Used for: Close, Copy, Share, Settings

---

## Special Components

### Payment Confirmation Modal
**Layout**: Centered modal, max-w-md
- Icon at top (SOL logo, large)
- Heading: "Confirm Payment"
- Payment details:
  - Test topic (text-lg)
  - Amount: "1 SOL" (text-3xl font-bold)
  - USD equivalent (text-sm, muted)
- Two buttons: "Cancel" + "Confirm & Pay"

### Level Badge Component
**Sizes**: Small (px-3 py-1), Medium (px-4 py-2), Large (px-6 py-3)
- Rounded: rounded-full
- Font: Uppercase, tracking-wide, font-bold
- Icon: Small star or medal icon before text
- Used in: Certificates, profile stats, test results

### Loading States
**Test Generation**: 
- Animated icon (rotating or pulsing)
- Status text: "Generating questions..." 
- Progress messages updating

**Wallet Connection**:
- Spinner with "Connecting to Phantom..."

**NFT Minting**:
- Multi-step indicator
- Steps: "Processing payment" → "Minting certificate" → "Complete"

---

## Animations & Interactions

**Minimal, Purposeful Motion**:
- Card hover: Slight lift (translateY -2px) + subtle shadow increase
- Button hover: Gentle scale (1.02) or brightness increase
- Page transitions: Fade in content (opacity 0 to 1, duration-300)
- Modal entry: Fade + scale from 0.95 to 1
- NO distracting scroll animations or complex parallax

**Micro-interactions**:
- Success checkmark animation when answer selected
- Confetti burst on test completion (use canvas-confetti library)
- Smooth number counters for stats (count up effect)

---

## Iconography

**Icon Library**: Heroicons (via CDN) - outline style for navigation, solid for actions
**Icon Sizes**: 
- Navigation: w-5 h-5
- Stats/features: w-8 h-8 to w-12 h-12
- Inline icons: w-4 h-4
- Social/external links: w-5 h-5

**Custom Icons** (via placeholder comments):
- Phantom Wallet logo
- SOL currency symbol
- NFT badge designs
- Certificate decorative elements

---

## Images

**Hero Section** (Dashboard welcome):
- Abstract illustration representing blockchain/education
- Placement: Right side on desktop, above content on mobile
- Style: Isometric or 3D rendered, matching the modern Web3 aesthetic
- Size: ~500px width on desktop

**Certificate NFT Visuals**:
- Programmatically generated certificate design
- Background: Gradient mesh treatment
- Foreground: Level badge, test topic, decorative elements
- Dimensions: Square (1:1) or portrait (3:4), minimum 512x512

**Empty States**:
- "No certificates yet" illustration
- Simple, friendly graphic with CTA to create first test
- Centered in empty gallery space

**Profile Avatar Placeholder**:
- Generated from wallet address (jazzicon or similar)
- Circular, medium size (w-20 h-20 on profile page)

---

## Accessibility & Responsive Patterns

**Mobile Navigation**:
- Hamburger menu (top-right on mobile)
- Slide-in drawer with full-height nav
- Overlay backdrop when open

**Card Layouts**:
- Stack to single column on mobile
- Maintain touch-friendly hit areas (min 44x44px)

**Forms**:
- Labels always visible (not placeholder-only)
- Error messages below inputs, descriptive
- Success states with checkmark icons

**Keyboard Navigation**:
- Tab order follows visual hierarchy
- Focus indicators on all interactive elements
- Escape key closes modals

This design system creates a polished, modern Web3 certification platform that feels trustworthy, engaging, and distinctly blockchain-native while remaining accessible and user-friendly.