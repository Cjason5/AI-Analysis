# PolyCaster Clone - Complete Build Prompt

## Project Overview

Build **PolyCaster**, an AI-powered prediction market analysis platform that integrates with Polymarket. The app allows users to browse prediction markets, get AI-powered analysis (paid via x402 protocol at $0.30 per analysis in USDC), track markets via watchlist, set price alerts, and view signal history.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables (Dark/Light mode) |
| Database | PostgreSQL with Prisma ORM |
| Auth | Thirdweb SDK (EVM wallets) + Solana Wallet Adapter |
| Payments | x402 Protocol (USDC on Base) |
| AI | OpenAI GPT-4 / Claude API |
| Data Source | Polymarket Gamma API |
| Email | Resend (for price alerts) |
| Deployment | Vercel |

---

## Core Features to Implement

### 1. Markets Page (Home)
- Display stats banner: Total Markets, Total Volume, Trending count
- Category filter pills: All, Politics, Sports, Economics, Tech, Crypto, Science, Culture
- Sort dropdown (Price, Volume, Liquidity) with ascending/descending toggle
- Search bar with "Press Enter" functionality
- **Trending Markets** section (horizontal scroll)
- **Live Markets** section (grid, show "X live" count)
- **All Markets** section with pagination ("Load More Markets" button)

### 2. Market Cards
Each card displays data from Polymarket API:
- Market title/question
- Category tag (from tags array)
- Confidence level badge (Low/Medium/High - calculate from liquidity/volume)
- Price change indicator (calculate from historical data)
- Market description (resolution conditions)
- Prediction odds progress bar (YES percentage visual)
- YES/NO price buttons (green/red borders)
- 24h Volume
- Liquidity
- Last Update timestamp
- Market Age
- Time remaining countdown
- Status badge (Active/Closed)
- **Action buttons**: AI (blue), ROI (outlined), Alert bell, Watchlist star

### 3. AI Analysis Modal (x402 Payment)
When user clicks "AI" or "Analyze" button:
- Show modal with market details (title, category, current price, volume)
- Display "Wallet Connection Required" if not connected
- Two wallet connect options: "Connect EVM" and "Connect" (Solana/Thirdweb)
- Tip for Phantom users
- **"Start AI Analysis ($0.30)"** button
- Integrate x402 payment flow:
  - User pays $0.30 USDC
  - On successful payment, call AI API for analysis
  - Display AI-generated market analysis
- Save analysis to Signal History

### 4. ROI Calculator Modal
- Input fields for investment amount
- Calculate potential returns based on YES/NO prices
- Show profit/loss scenarios

### 5. Watchlist Page (`/watchlist`)
- Requires wallet connection
- Display user's saved markets
- Add/remove from watchlist functionality
- Persistent storage in database

### 6. Price Alerts Page (`/alerts`)
- Requires wallet connection
- Create alerts for specific markets
- Configure price thresholds (above/below)
- Email notification system
- Alert management (edit/delete)

### 7. Signal History Page (`/history`)
- Requires wallet connection
- Display past AI analyses purchased by user
- Show market, analysis date, AI recommendation
- Filter/search functionality

### 8. Pro Features Dropdown
- Portfolio Tracking
- Market Scanner
- Market Compare
- Signal Leaderboard
- Points & Rewards
(These can be placeholder pages or future features)

### 9. Help/FAQ Page (`/help`)
- Comprehensive FAQ sections
- Categories: General, Features, Alerts, AI Analysis, Account, Technical

---

## Polymarket API Integration

### Base URLs
```
Gamma API: https://gamma-api.polymarket.com
CLOB API: https://clob.polymarket.com
Data API: https://data-api.polymarket.com
WebSocket: wss://ws-subscriptions-clob.polymarket.com/ws/
```

### Key Endpoints

#### Fetch All Active Events/Markets
```
GET https://gamma-api.polymarket.com/events?order=id&ascending=false&closed=false&limit=100
```

#### Fetch by Category/Tag
```
GET https://gamma-api.polymarket.com/events?tag_id={TAG_ID}&closed=false&limit=50
```

#### Fetch Available Tags
```
GET https://gamma-api.polymarket.com/tags
```

#### Pagination
Use `limit` and `offset` parameters:
- Page 1: `offset=0&limit=50`
- Page 2: `offset=50&limit=50`

### API Response Structure

```typescript
interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  new: boolean;
  featured: boolean;
  liquidity: number;
  volume: number;
  openInterest: number;
  volume24hr: number;
  competitive: number;
  commentCount: number;
  markets: PolymarketMarket[];
  tags: Tag[];
}

interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string[]; // ["Yes", "No"]
  outcomePrices: string[]; // ["0.02", "0.98"]
  volume: string;
  liquidity: string;
  closed: boolean;
  active: boolean;
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  clobTokenIds: string[];
  negRisk: boolean;
}

interface Tag {
  id: string;
  label: string;
  slug: string;
}
```

### Category Mapping
Map Polymarket tags to UI categories:
```typescript
const CATEGORY_MAP = {
  'politics': ['politics', 'elections', 'government'],
  'sports': ['sports', 'nfl', 'nba', 'soccer', 'mlb'],
  'economics': ['economics', 'fed', 'inflation', 'gdp'],
  'tech': ['tech', 'ai', 'apple', 'google', 'meta'],
  'crypto': ['crypto', 'bitcoin', 'ethereum', 'defi'],
  'science': ['science', 'space', 'climate'],
  'culture': ['culture', 'entertainment', 'awards']
};
```

---

## x402 Payment Integration

### Installation
```bash
npm install x402-next @coinbase/x402
```

### Middleware Setup (`middleware.ts`)
```typescript
import { paymentMiddleware } from "x402-next";

export const middleware = paymentMiddleware(
  process.env.PAYMENT_RECIPIENT_ADDRESS!, // Your wallet address
  {
    "/api/ai-analysis": {
      price: "$0.30",
      network: "base", // Use "base-sepolia" for testing
      config: {
        description: "AI Market Analysis",
      },
    },
  },
  { url: "https://x402.org/facilitator" } // Testnet facilitator
);

export const config = {
  matcher: ["/api/ai-analysis"],
};
```

### API Route (`app/api/ai-analysis/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { marketId, question, currentPrice, volume, description } = await req.json();

  // x402 middleware handles payment verification
  // If we reach here, payment was successful

  const analysis = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert prediction market analyst. Provide detailed analysis including market sentiment, key factors, risks, and a confidence rating."
      },
      {
        role: "user",
        content: `Analyze this prediction market:
          Question: ${question}
          Current YES Price: ${currentPrice}
          Volume: ${volume}
          Resolution Criteria: ${description}

          Provide: 1) Market overview, 2) Key factors affecting outcome, 3) Risk assessment, 4) Recommendation (Buy YES/NO/Hold), 5) Confidence level`
      }
    ]
  });

  // Save to database for signal history
  // await prisma.signalHistory.create({...})

  return NextResponse.json({
    analysis: analysis.choices[0].message.content,
    marketId,
    timestamp: new Date().toISOString()
  });
}
```

### Client-Side Payment Flow
```typescript
import { createClient } from "x402-next/client";

const x402Client = createClient();

async function requestAnalysis(market: Market) {
  try {
    const response = await x402Client.fetch("/api/ai-analysis", {
      method: "POST",
      body: JSON.stringify({
        marketId: market.id,
        question: market.question,
        currentPrice: market.outcomePrices[0],
        volume: market.volume,
        description: market.description
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.analysis;
    }
  } catch (error) {
    // Handle payment rejection or failure
    console.error("Payment failed:", error);
  }
}
```

### Environment Variables
```env
# x402 Payment
PAYMENT_RECIPIENT_ADDRESS=0xYourWalletAddress
X402_NETWORK=base-sepolia  # or "base" for mainnet

# Coinbase Developer Platform (for mainnet)
CDP_API_KEY_ID=your-cdp-api-key-id
CDP_API_KEY_SECRET=your-cdp-api-key-secret

# AI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://...

# Email
RESEND_API_KEY=re_...
```

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  email         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  watchlist     Watchlist[]
  alerts        PriceAlert[]
  signals       SignalHistory[]
}

model Watchlist {
  id        String   @id @default(cuid())
  userId    String
  marketId  String   // Polymarket market ID
  slug      String
  question  String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, marketId])
}

model PriceAlert {
  id          String   @id @default(cuid())
  userId      String
  marketId    String
  marketSlug  String
  question    String
  targetPrice Float
  condition   String   // "above" or "below"
  outcome     String   // "yes" or "no"
  isActive    Boolean  @default(true)
  triggered   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
}

model SignalHistory {
  id          String   @id @default(cuid())
  userId      String
  marketId    String
  marketSlug  String
  question    String
  analysis    String   @db.Text
  priceAtTime Float
  txHash      String?  // x402 payment transaction
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

---

## Wallet Integration

### Thirdweb Setup (EVM + Multi-chain)
```typescript
// app/providers.tsx
"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Base, BaseSepoliaTestnet } from "@thirdweb-dev/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain={Base}
      supportedChains={[Base, BaseSepoliaTestnet]}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      {children}
    </ThirdwebProvider>
  );
}
```

### Solana Wallet Adapter
```typescript
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

const network = WalletAdapterNetwork.Mainnet;
const wallets = [new PhantomWalletAdapter()];
```

---

## UI Components Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Markets home
│   ├── watchlist/page.tsx
│   ├── alerts/page.tsx
│   ├── history/page.tsx
│   ├── help/page.tsx
│   └── api/
│       ├── ai-analysis/route.ts
│       ├── markets/route.ts
│       ├── watchlist/route.ts
│       ├── alerts/route.ts
│       └── webhooks/
│           └── price-check/route.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── markets/
│   │   ├── MarketCard.tsx
│   │   ├── MarketCardCompact.tsx
│   │   ├── TrendingMarkets.tsx
│   │   ├── LiveMarkets.tsx
│   │   ├── AllMarkets.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── SearchBar.tsx
│   │   └── SortDropdown.tsx
│   ├── modals/
│   │   ├── AIAnalysisModal.tsx
│   │   ├── ROICalculatorModal.tsx
│   │   └── AlertModal.tsx
│   ├── wallet/
│   │   ├── ConnectButton.tsx
│   │   ├── WalletModal.tsx
│   │   └── WalletProvider.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── ProgressBar.tsx
│       ├── Skeleton.tsx
│       └── ThemeToggle.tsx
├── hooks/
│   ├── useMarkets.ts
│   ├── useWatchlist.ts
│   ├── useAlerts.ts
│   └── useSignalHistory.ts
├── lib/
│   ├── polymarket.ts            # API client
│   ├── prisma.ts
│   ├── x402.ts                  # Payment helpers
│   └── utils.ts
└── types/
    └── index.ts
```

---

## Styling Guidelines

### Color Palette (Dark Mode - Primary)
```css
:root {
  --bg-primary: #0f1419;
  --bg-secondary: #1a2332;
  --bg-card: #1e2a3a;
  --bg-card-hover: #243447;

  --text-primary: #ffffff;
  --text-secondary: #8899a6;
  --text-muted: #657786;

  --accent-blue: #3b82f6;
  --accent-green: #22c55e;
  --accent-red: #ef4444;

  --border-color: #2d3e50;
}
```

### Card Design
- Rounded corners (lg/xl)
- Subtle border
- Hover state with slight lift/glow
- Consistent padding

---

## API Routes Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/markets` | GET | Proxy to Polymarket, returns formatted markets |
| `/api/markets/[id]` | GET | Single market details |
| `/api/ai-analysis` | POST | x402 protected - AI analysis |
| `/api/watchlist` | GET/POST/DELETE | User watchlist CRUD |
| `/api/alerts` | GET/POST/PUT/DELETE | Price alerts CRUD |
| `/api/history` | GET | User's signal history |
| `/api/webhooks/price-check` | POST | Cron job for alert checking |

---

## Deployment Checklist

1. [ ] Set up Vercel project
2. [ ] Configure environment variables
3. [ ] Set up PostgreSQL database (Supabase/Neon)
4. [ ] Configure Thirdweb project
5. [ ] Set up x402 payment recipient wallet
6. [ ] Configure OpenAI API key
7. [ ] Set up Resend for email alerts
8. [ ] Configure cron job for price alert checking
9. [ ] Test on Base Sepolia before mainnet
10. [ ] Switch to Base mainnet for production

---

## Implementation Order

1. **Phase 1: Foundation**
   - Next.js project setup with TypeScript
   - Tailwind CSS configuration with dark mode
   - Basic layout (Header, Footer, Navigation)
   - Theme toggle functionality

2. **Phase 2: Polymarket Integration**
   - API client for Polymarket Gamma API
   - Markets fetching with pagination
   - Category filtering
   - Search functionality
   - Market cards display

3. **Phase 3: Wallet Integration**
   - Thirdweb provider setup
   - Connect wallet button/modal
   - Solana wallet adapter (optional)
   - User authentication flow

4. **Phase 4: Database & User Features**
   - Prisma setup with PostgreSQL
   - Watchlist functionality
   - Price alerts system
   - Signal history storage

5. **Phase 5: x402 Payment Integration**
   - x402-next middleware setup
   - AI analysis API route
   - Payment flow UI
   - Transaction handling

6. **Phase 6: AI Analysis**
   - OpenAI integration
   - Analysis prompt engineering
   - Analysis modal UI
   - Save to history

7. **Phase 7: Polish & Deploy**
   - ROI calculator
   - Email notifications
   - Error handling
   - Loading states
   - Production deployment

---

## Resources

- [Polymarket Gamma API Docs](https://docs.polymarket.com/developers/gamma-markets-api/overview)
- [Polymarket Fetch Markets Guide](https://docs.polymarket.com/developers/gamma-markets-api/fetch-markets-guide)
- [x402 Protocol Documentation](https://docs.cdp.coinbase.com/x402/welcome)
- [x402 GitHub Repository](https://github.com/coinbase/x402)
- [x402-next NPM Package](https://www.npmjs.com/package/x402-next)
- [x402.org](https://www.x402.org/)
- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

## Notes

- Start with Solana Mainnet for x402 payments during development
- Use the testnet facilitator: `https://x402.org/facilitator`
- Polymarket API has rate limits (~100 requests/minute)
- Cache market data to reduce API calls
- Consider WebSocket connection for real-time price updates
