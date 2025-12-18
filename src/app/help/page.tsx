'use client';

import { Card } from '@/components/ui/Card';
import {
  HelpCircle,
  Wallet,
  Search,
  TrendingUp,
  Bell,
  Star,
  History,
  Shield,
  DollarSign,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Help Center</h1>
      <p className="text-text-secondary mb-8">
        Learn how to use Trio Terminal to get trading insights
      </p>

      {/* Quick Links */}
      <section className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="#getting-started" className="bg-bg-card hover:bg-bg-card-hover border border-border-color rounded-lg p-4 text-center transition-colors">
            <Zap className="w-6 h-6 text-accent-blue mx-auto mb-2" />
            <span className="text-sm text-text-primary">Getting Started</span>
          </a>
          <a href="#features" className="bg-bg-card hover:bg-bg-card-hover border border-border-color rounded-lg p-4 text-center transition-colors">
            <TrendingUp className="w-6 h-6 text-accent-green mx-auto mb-2" />
            <span className="text-sm text-text-primary">Features</span>
          </a>
          <a href="#referral" className="bg-bg-card hover:bg-bg-card-hover border border-border-color rounded-lg p-4 text-center transition-colors">
            <Users className="w-6 h-6 text-accent-purple mx-auto mb-2" />
            <span className="text-sm text-text-primary">Referral Program</span>
          </a>
          <Link href="/faq" className="bg-bg-card hover:bg-bg-card-hover border border-border-color rounded-lg p-4 text-center transition-colors">
            <HelpCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <span className="text-sm text-text-primary">FAQ</span>
          </Link>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-accent-blue" />
          Getting Started
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-blue/20 rounded-lg">
                <Wallet className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  1. Connect Your Wallet
                </h3>
                <p className="text-sm text-text-secondary">
                  Click the "Connect Wallet" button in the top right corner. We support
                  Phantom, Solflare, Backpack, and other popular Solana wallets. Your
                  wallet is required to save preferences and pay for analyses.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-blue/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  2. Fund Your Wallet with USDC
                </h3>
                <p className="text-sm text-text-secondary">
                  Make sure you have USDC (SPL token) in your Solana wallet. Each
                  analysis costs a small fee in USDC. You'll also need a small amount of SOL
                  for transaction fees.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-blue/20 rounded-lg">
                <Search className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  3. Browse & Search Tokens
                </h3>
                <p className="text-sm text-text-secondary">
                  Browse tokens from top major cryptoexchanges or use the search bar to find
                  specific tokens. Filter by exchange and sort by market cap, price,
                  volume, or 24h change.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-blue/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  4. Get Analysis
                </h3>
                <p className="text-sm text-text-secondary">
                  Click "Analyze" on any token card. Confirm the transaction in your
                  wallet, and within seconds you'll receive a comprehensive
                  trading analysis.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Features</h2>
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-green/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Trading Signals
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  We analyze multiple data points to generate comprehensive trading
                  recommendations:
                </p>
                <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                  <li>Real-time crypto news sentiment analysis</li>
                  <li>Entry/exit points for both spot and leveraged trading</li>
                  <li>Stop-loss and take-profit recommendations</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Watchlist</h3>
                <p className="text-sm text-text-secondary mb-2">
                  Save your favorite tokens to your personal watchlist for quick access:
                </p>
                <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                  <li>Click the star icon on any token card to add/remove</li>
                  <li>Access your watchlist from the navigation menu</li>
                  <li>View live prices and quickly analyze watchlist tokens</li>
                  <li>Set price alerts directly from your watchlist</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-blue/20 rounded-lg">
                <Bell className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Price Alerts & Notifications
                </h3>
                <p className="text-sm text-text-secondary mb-2">
                  Never miss a trading opportunity with custom price alerts:
                </p>
                <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                  <li>Set alerts when price goes above or below your target</li>
                  <li>Receive in-app notifications via the bell icon</li>
                  <li>Enable browser push notifications for real-time alerts</li>
                  <li>Manage all your alerts from the Alerts page</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <History className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Signal History
                </h3>
                <p className="text-sm text-text-secondary">
                  All your analysis results are automatically saved. Access them anytime
                  from the History page to review past signals, track your trading decisions,
                  and improve your strategy over time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Referral Program */}
      <section id="referral" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-purple" />
          Referral Program
        </h2>
        <Card className="p-5">
          <p className="text-sm text-text-secondary mb-4">
            Earn rewards by sharing Trio Terminal with your friends. Every time someone you
            refer pays for an analysis, you earn 10% commission automatically.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-bg-secondary rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-accent-blue font-bold">1</span>
              </div>
              <h4 className="text-text-primary font-medium text-sm mb-1">Get Your Link</h4>
              <p className="text-text-muted text-xs">
                Visit the Referral page to copy your unique referral link
              </p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-accent-blue font-bold">2</span>
              </div>
              <h4 className="text-text-primary font-medium text-sm mb-1">Share With Friends</h4>
              <p className="text-text-muted text-xs">
                Share your link on social media, chat, or anywhere
              </p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-accent-green font-bold">3</span>
              </div>
              <h4 className="text-text-primary font-medium text-sm mb-1">Earn Rewards</h4>
              <p className="text-text-muted text-xs">
                Earn 10% of every analysis fee paid by your referrals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-accent-green" />
            <span className="text-text-secondary">Commission is paid instantly in USDC to your wallet</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <CheckCircle className="w-4 h-4 text-accent-green" />
            <span className="text-text-secondary">Track your referrals and earnings on the Referral page</span>
          </div>
          <Link
            href="/referral"
            className="inline-flex items-center gap-2 mt-4 text-accent-blue hover:underline text-sm"
          >
            Go to Referral Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </section>

      {/* Supported Exchanges */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Supported Exchanges
        </h2>
        <Card className="p-5">
          <p className="text-sm text-text-secondary mb-4">
            Trio Terminal aggregates real-time token data from the top cryptocurrency
            exchanges by trading volume:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'Binance',
              'Coinbase',
              'Bybit',
              'OKX',
              'Kraken',
              'KuCoin',
              'Bitfinex',
              'Gate.io',
              'HTX',
              'MEXC',
              'Upbit',
              'Bitget',
              'Crypto.com',
              'LBank',
              'BitMart',
              'BingX',
            ].map((exchange) => (
              <div
                key={exchange}
                className="bg-bg-secondary rounded-lg px-3 py-2 text-center text-sm text-text-primary"
              >
                {exchange}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Payment Info */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-accent-green" />
          Payment Information
        </h2>
        <Card className="p-5">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-text-primary font-medium">Pay Per Analysis</h4>
                <p className="text-sm text-text-secondary">
                  Each analysis costs a small USDC fee. No subscriptions or hidden fees.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-text-primary font-medium">USDC on Solana</h4>
                <p className="text-sm text-text-secondary">
                  Payments are made in USDC (SPL token) on the Solana blockchain for
                  fast, low-cost transactions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-text-primary font-medium">Transaction Fees</h4>
                <p className="text-sm text-text-secondary">
                  Solana transaction fees are minimal (less than $0.01). Make sure you
                  have a small amount of SOL in your wallet for fees.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Security */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-green" />
          Security & Privacy
        </h2>
        <Card className="p-5">
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent-green">•</span>
              <span>
                We never request access to your wallet funds beyond the analysis
                payment
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green">•</span>
              <span>Your wallet address is only used to save your preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green">•</span>
              <span>All payments are processed on-chain with full transparency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green">•</span>
              <span>No personal data or email required to use the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green">•</span>
              <span>
                Trading signals are for informational purposes only - always do your
                own research
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* Need More Help */}
      <section className="mb-10">
        <Card className="p-5 bg-accent-blue/10 border-accent-blue/30">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-accent-blue flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Need More Help?</h3>
              <p className="text-sm text-text-secondary mb-3">
                Check out our frequently asked questions for quick answers to common questions.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-accent-blue hover:underline text-sm font-medium"
              >
                View FAQ
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>
      </section>

    </div>
  );
}
