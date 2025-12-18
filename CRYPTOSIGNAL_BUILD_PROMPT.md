# CryptoSignal - AI-Powered Crypto Trading Signal Platform

## Overview
Build a web-based dApp called "CryptoSignal" that provides AI-powered technical and sentiment analysis for cryptocurrency tokens. The platform displays tokens from the top 10 global crypto exchanges, allowing users to select an exchange, browse listed tokens, and purchase AI-generated trading signals for $0.30 USDC per analysis on Solana.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Variables (Dark/Light mode)
- **Icons**: Lucide React

### Blockchain
- **Network**: Solana (Mainnet/Devnet)
- **Wallet**: @solana/wallet-adapter-react, @solana/wallet-adapter-wallets
- **Supported Wallets**: Phantom, Solflare, Coinbase Wallet, Ledger

### Backend
- **Database**: PostgreSQL with Prisma ORM
- **APIs**:
  - CoinMarketCap API (token listings, market data)
  - Binance/Exchange APIs (candlestick data)
  - NewsAPI (crypto news for sentiment)
  - OpenAI GPT-4o-mini (sentiment analysis)
  - Google Gemini 2.0 Flash (trading signal generation)
- **Email**: Resend (for alerts)

### Payments
- **Protocol**: x402 Protocol
- **Token**: USDC on Solana
- **Price**: $0.30 per AI analysis

## Core Features

### 1. Exchange Categories
Display the top 10 global crypto exchanges as category filters:
1. Binance
2. Coinbase
3. Bybit
4. OKX
5. Kraken
6. KuCoin
7. Bitfinex
8. Gate.io
9. HTX (Huobi)
10. MEXC

### 2. Token Cards Grid
For each selected exchange, display cards showing all listed tokens with:
- Token name and symbol (e.g., "Bitcoin (BTC)")
- Token logo/icon
- Current price
- 24-hour price change (%)
- 24-hour trading volume
- Market capitalization
- "Analyze" button

### 3. AI Analysis Modal
When user clicks "Analyze" on a token card:
1. Prompt wallet connection if not connected
2. Request $0.30 USDC payment via x402
3. Upon payment confirmation:
   - Fetch candlestick data (5m, 15m, 1h, 4h, 1d, 1w - 200 candles each)
   - Fetch crypto news headlines (last 3 days)
   - Generate sentiment analysis (GPT-4o-mini)
   - Generate trading signals (Gemini 2.0 Flash)
4. Display comprehensive analysis results

### 4. Analysis Output Format
The AI should generate:

**Spot Trading Recommendations:**
- Short-term: Action, Entry Price, Stop Loss, Take Profit, Rationale
- Long-term: Action, Entry Price, Stop Loss, Take Profit, Rationale

**Leveraged Trading Recommendations:**
- Short-term: Position, Leverage, Entry Price, Stop Loss, Take Profit, Rationale
- Long-term: Position, Leverage, Entry Price, Stop Loss, Take Profit, Rationale

**Rationale Breakdown:**
- Primary Signals (support/resistance, trendlines, divergences)
- Lagging Indicators (MACD, RSI, OBV confirmation)
- Sentiment Analysis (volume trends, market sentiment, macro factors)

### 5. Additional Features (Same as PolyCaster)
- **Watchlist**: Save tokens to personal watchlist
- **Price Alerts**: Set alerts for price thresholds
- **Signal History**: View past analyses
- **Search**: Search tokens across exchanges
- **Sorting**: Sort by volume, market cap, price change

## Database Schema

```prisma
model User {
  id            String         @id @default(cuid())
  walletAddress String         @unique
  createdAt     DateTime       @default(now())
  watchlist     Watchlist[]
  alerts        PriceAlert[]
  analyses      SignalHistory[]
}

model Watchlist {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  tokenSymbol String
  tokenName   String
  exchange    String
  createdAt   DateTime @default(now())

  @@unique([userId, tokenSymbol, exchange])
}

model PriceAlert {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  tokenSymbol String
  tokenName   String
  exchange    String
  condition   String   // 'above' | 'below'
  targetPrice Float
  isActive    Boolean  @default(true)
  triggered   Boolean  @default(false)
  email       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SignalHistory {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  tokenSymbol     String
  tokenName       String
  exchange        String
  priceAtAnalysis Float
  analysis        String   @db.Text
  txSignature     String?
  createdAt       DateTime @default(now())
}

model TokenCache {
  id          String   @id @default(cuid())
  exchange    String
  tokenSymbol String
  tokenName   String
  price       Float
  change24h   Float
  volume24h   Float
  marketCap   Float
  logoUrl     String?
  updatedAt   DateTime @updatedAt

  @@unique([exchange, tokenSymbol])
}
```

## API Endpoints

### Token Data
```
GET /api/exchanges
  - Returns list of supported exchanges with metadata

GET /api/tokens?exchange={exchange}&limit={limit}&offset={offset}&search={search}&sortBy={sortBy}
  - Returns paginated token list for an exchange
  - Fetches from CoinMarketCap API, caches in TokenCache

GET /api/tokens/[symbol]?exchange={exchange}
  - Returns detailed token information
```

### Analysis
```
POST /api/analysis
  - Body: { tokenSymbol, exchange, walletAddress }
  - Requires x402 payment verification
  - Fetches candlestick data from exchange API
  - Fetches news from NewsAPI
  - Generates sentiment via OpenAI
  - Generates trading signals via Gemini
  - Saves to SignalHistory
  - Returns complete analysis
```

### User Data
```
GET /api/watchlist?walletAddress={address}
POST /api/watchlist
DELETE /api/watchlist?walletAddress={address}&tokenSymbol={symbol}&exchange={exchange}

GET /api/alerts?walletAddress={address}
POST /api/alerts
PUT /api/alerts
DELETE /api/alerts?alertId={id}&walletAddress={address}

GET /api/history?walletAddress={address}
```

## Component Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Home - Token Grid)
│   ├── watchlist/page.tsx
│   ├── alerts/page.tsx
│   ├── history/page.tsx
│   ├── help/page.tsx
│   └── api/
│       ├── exchanges/route.ts
│       ├── tokens/route.ts
│       ├── analysis/route.ts
│       ├── watchlist/route.ts
│       ├── alerts/route.ts
│       └── history/route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ThemeToggle.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── wallet/
│   │   ├── WalletProvider.tsx
│   │   └── ConnectButton.tsx
│   ├── tokens/
│   │   ├── TokenCard.tsx
│   │   ├── TokenGrid.tsx
│   │   ├── ExchangeFilter.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SortDropdown.tsx
│   │   └── StatsBar.tsx
│   └── modals/
│       ├── AnalysisModal.tsx
│       ├── AlertModal.tsx
│       └── AnalysisResultModal.tsx
├── hooks/
│   ├── useTokens.ts
│   ├── useExchanges.ts
│   ├── useAnalysis.ts
│   ├── useWatchlist.ts
│   ├── useAlerts.ts
│   └── useSignalHistory.ts
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   ├── coinmarketcap.ts
│   ├── exchanges.ts (Binance, etc. API clients)
│   ├── newsapi.ts
│   ├── openai.ts
│   ├── gemini.ts
│   └── x402.ts
└── types/
    └── index.ts
```

## Exchange API Integration

### Binance Klines API
```
GET https://api.binance.com/api/v3/klines
  ?symbol={SYMBOL}USDT
  &interval={5m|15m|1h|4h|1d|1w}
  &limit=200
```

### For Other Exchanges
Map exchange-specific endpoints or use CCXT library for unified access:
- Coinbase Pro API
- Bybit API
- OKX API
- Kraken API
- KuCoin API
- Bitfinex API
- Gate.io API
- HTX API
- MEXC API

## AI Analysis Prompts

### Sentiment Analysis (GPT-4o-mini)
```
Analyze cryptocurrency news sentiment:
- Short-term sentiment (category, score -1 to 1, rationale)
- Long-term sentiment (category, score -1 to 1, rationale)
Output as JSON.
```

### Trading Signal Generation (Gemini 2.0 Flash)
```
Given candlestick data across 6 timeframes and sentiment analysis:

1. Group data by timeframe (5m, 15m, 1h, 4h, 1d, 1w)

2. Analyze:
   - Short-term: Use 5m/15m with 1h/4h support
   - Long-term: Use 1d/1w with 1h/4h support
   - Calculate MACD, RSI, OBV
   - Identify support/resistance, trendlines, divergences

3. Generate recommendations:
   - Spot: Action, Entry, Stop-Loss, Take-Profit, Rationale
   - Leveraged: Position, Leverage, Entry, Stop-Loss, Take-Profit, Rationale

Format as plain text with clear sections.
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Solana
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"

# APIs
COINMARKETCAP_API_KEY="..."
NEWSAPI_KEY="..."
OPENAI_API_KEY="..."
GOOGLE_GEMINI_API_KEY="..."

# x402 Payment
X402_PAYMENT_ADDRESS="..." (Solana USDC receiving address)
X402_PRICE_USDC="0.30"

# Email
RESEND_API_KEY="..."
```

## Styling Guidelines

### Maintain PolyCaster Branding
- Same color scheme (CSS variables)
- Same dark/light mode toggle
- Same card styling with hover effects
- Same button styles and animations
- Same modal design
- Same responsive breakpoints

### Color Palette (CSS Variables)
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --accent-blue: #3b82f6;
  --accent-green: #22c55e;
  --accent-red: #ef4444;
  --accent-yellow: #eab308;
  --accent-purple: #a855f7;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border-color: #334155;
}
```

## Token Card Design

```
┌─────────────────────────────────────┐
│  [Logo]  Bitcoin (BTC)    [★]       │
│          Exchange: Binance          │
│                                     │
│  $97,234.56        +2.45% ▲         │
│                                     │
│  Vol: $24.5B    MCap: $1.92T        │
│                                     │
│  [    Analyze - $0.30 USDC    ]     │
└─────────────────────────────────────┘
```

## Analysis Result Display

```
┌─────────────────────────────────────────────┐
│  BTC/USDT Analysis - 12/02/2024 3:45 PM     │
│  Exchange: Binance                          │
├─────────────────────────────────────────────┤
│  SPOT RECOMMENDATIONS                       │
│                                             │
│  Short-term:                                │
│  • Action: BUY                              │
│  • Entry: $97,200                           │
│  • Stop Loss: $95,800                       │
│  • Take Profit: $99,500                     │
│  • Rationale:                               │
│    - Primary Signals: ...                   │
│    - Lagging Indicators: ...                │
│    - Sentiment Analysis: ...                │
│                                             │
│  Long-term:                                 │
│  • Action: HOLD                             │
│  • Entry: $97,200                           │
│  • Stop Loss: $92,000                       │
│  • Take Profit: $110,000                    │
│  • Rationale: ...                           │
├─────────────────────────────────────────────┤
│  LEVERAGED RECOMMENDATIONS                  │
│                                             │
│  Short-term:                                │
│  • Position: LONG                           │
│  • Leverage: 5x                             │
│  • Entry: $97,200                           │
│  • Stop Loss: $96,200                       │
│  • Take Profit: $99,000                     │
│  • Rationale: ...                           │
│                                             │
│  Long-term:                                 │
│  • Position: LONG                           │
│  • Leverage: 3x                             │
│  • Entry: $97,200                           │
│  • Stop Loss: $93,000                       │
│  • Take Profit: $108,000                    │
│  • Rationale: ...                           │
├─────────────────────────────────────────────┤
│  SENTIMENT ANALYSIS                         │
│                                             │
│  Short-term: Positive (0.7)                 │
│  Long-term: Neutral (0.1)                   │
│                                             │
│  Key Headlines:                             │
│  • "Bitcoin ETF inflows reach..."           │
│  • "Fed signals rate pause..."              │
└─────────────────────────────────────────────┘
```

## Payment Flow (x402 on Solana)

1. User clicks "Analyze" on token card
2. Check wallet connection (prompt if needed)
3. Display payment confirmation modal
4. Create Solana transaction:
   - Transfer 0.30 USDC to payment address
   - Include memo with token symbol and timestamp
5. User signs transaction in wallet
6. Wait for transaction confirmation
7. Verify transaction on-chain
8. Trigger analysis pipeline
9. Display results

## Implementation Priority

1. **Phase 1**: Core UI
   - Exchange category filters
   - Token grid with cards
   - CoinMarketCap integration
   - Search and sort functionality

2. **Phase 2**: Wallet & Payments
   - Solana wallet integration
   - x402 USDC payment flow
   - Transaction verification

3. **Phase 3**: AI Analysis
   - Exchange API integration (candlestick data)
   - NewsAPI integration
   - OpenAI sentiment analysis
   - Gemini trading signal generation
   - Analysis result display

4. **Phase 4**: User Features
   - Watchlist functionality
   - Price alerts
   - Signal history
   - Email notifications

## Performance Considerations

- Cache token listings (update every 5 minutes)
- Lazy load token cards with pagination
- Use React Query for data fetching
- Implement skeleton loaders
- Optimize images with next/image
- Use dynamic imports for modals

## Security

- Validate all API inputs
- Rate limit analysis requests
- Verify payment transactions on-chain before processing
- Never expose API keys to client
- Sanitize AI outputs before display
- Use environment variables for secrets
