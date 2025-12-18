'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Wallet,
  TrendingUp,
  Bell,
  Users,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

function FAQAccordion({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border-color rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-bg-card hover:bg-bg-card-hover transition-colors"
      >
        <span className="font-medium text-text-primary pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-bg-secondary border-t border-border-color">
          <div className="text-sm text-text-secondary">{answer}</div>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const faqCategories: FAQCategory[] = [
    {
      title: 'General Questions',
      icon: <HelpCircle className="w-5 h-5 text-accent-blue" />,
      items: [
        {
          question: 'What is Trio Terminal?',
          answer:
            'Trio Terminal is a decentralized application (dApp) that provides trading signals for cryptocurrency traders.',
        },
        {
          question: 'How does the analysis work?',
          answer: (
            <div className="space-y-2">
              <p>Our analysis combines multiple data sources to generate comprehensive trading signals:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Technical analysis across 6 timeframes (5m, 15m, 1h, 4h, 1d, 1w)</li>
                <li>Candlestick pattern recognition</li>
                <li>Support and resistance level identification</li>
                <li>Real-time crypto news sentiment analysis</li>
                <li>Volume and momentum indicators</li>
              </ul>
              <p className="mt-2">The analysis typically takes 10-30 seconds to complete.</p>
            </div>
          ),
        },
        {
          question: 'Which exchanges are supported?',
          answer:
            'We support tokens from the top cryptocurrency exchanges: Binance, Coinbase, Bybit, OKX, Kraken, KuCoin, Bitfinex, Gate.io, HTX, MEXC and more. You can filter tokens by exchange or view all tokens at once.',
        },
        {
          question: 'Is this financial advice?',
          answer:
            'No. consider your risk tolerance before making any trading decisions.',
        },
      ],
    },
    {
      title: 'Wallet & Payments',
      icon: <Wallet className="w-5 h-5 text-accent-green" />,
      items: [
        {
          question: 'Which wallets are supported?',
          answer:
            'We support all major Solana wallets including Phantom, Solflare, Backpack, Sollet, and any wallet that supports the Solana Wallet Adapter standard. Simply click "Connect Wallet" and select your preferred wallet.',
        },
        {
          question: 'How much does an analysis cost?',
          answer:
            'Each analysis costs few cents in USDC fees. This is a one-time payment per analysis with no subscriptions upfront or hidden fees.',
        },
        {
          question: 'What currency do I need?',
          answer: (
            <div className="space-y-2">
              <p>You need two things in your Solana wallet:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>USDC (SPL token):</strong> For paying for analyses ($0.08 per analysis)</li>
                <li><strong>SOL:</strong> A small amount for Solana transaction fees (less than $0.01 per transaction)</li>
              </ul>
              <p className="mt-2">Make sure you have USDC on Solana (not Ethereum or other chains).</p>
            </div>
          ),
        },
        {
          question: 'Where can I get USDC on Solana?',
          answer:
            'You can get USDC on Solana from major exchanges like Coinbase, Binance, or Kraken by withdrawing USDC to your Solana wallet address. You can also use decentralized exchanges like Jupiter or Raydium to swap SOL for USDC.',
        },
        {
          question: 'Why did my transaction fail?',
          answer: (
            <div className="space-y-2">
              <p>Transactions can fail for several reasons:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Insufficient USDC:</strong> Make sure you have at least $0.30 USDC</li>
                <li><strong>Insufficient SOL:</strong> You need a small amount of SOL for transaction fees</li>
                <li><strong>Network congestion:</strong> Try again in a few moments</li>
                <li><strong>Wallet rejection:</strong> Make sure to approve the transaction in your wallet</li>
              </ul>
              <p className="mt-2">If the problem persists, try disconnecting and reconnecting your wallet.</p>
            </div>
          ),
        },
        {
          question: 'Is my wallet safe?',
          answer:
            'Yes. We never request access to your wallet funds. Each transaction requires your explicit approval in your wallet. All payments are processed on-chain with full transparency, and you can verify every transaction on Solscan.',
        },
      ],
    },
    {
      title: 'Analysis & Signals',
      icon: <TrendingUp className="w-5 h-5 text-accent-purple" />,
      items: [
        {
          question: 'How long does an analysis take?',
          answer:
            'An analysis typically takes 10-30 seconds to complete.',
        },
        {
          question: 'Can I see my past analyses?',
          answer:
            'Yes! All your analyses are automatically saved to your History page. You can access them anytime to review past signals, track your trading decisions, and improve your strategy over time.',
        },
        {
          question: 'Why are some tokens not available for analysis?',
          answer:
            'Some tokens may not be available if they lack sufficient trading data or liquidity on supported exchanges.',
        },
      ],
    },
    {
      title: 'Watchlist & Alerts',
      icon: <Bell className="w-5 h-5 text-yellow-500" />,
      items: [
        {
          question: 'How do I add tokens to my watchlist?',
          answer:
            'Click the star icon on any token card to add it to your watchlist. You must be connected with your wallet to use the watchlist feature. Access your saved tokens anytime from the Watchlist page in the navigation menu.',
        },
        {
          question: 'How do price alerts work?',
          answer: (
            <div className="space-y-2">
              <p>Price alerts notify you when a token reaches your target price:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click the bell icon on any token card to set an alert</li>
                <li>Choose whether to alert when price goes above or below your target</li>
                <li>Receive notifications via the bell icon in the navigation bar</li>
                <li>Optionally enable browser push notifications for real-time alerts</li>
              </ul>
              <p className="mt-2">Manage all your alerts from the Alerts page.</p>
            </div>
          ),
        },
        {
          question: 'How do I enable push notifications?',
          answer:
            'When you set your first price alert, your browser will ask for permission to send notifications. Click "Allow" to receive real-time alerts even when you\'re not actively using Trio Terminal. You can also enable notifications from your browser settings.',
        },
        {
          question: 'Are my watchlist and alerts saved?',
          answer:
            'Yes, your watchlist and alerts are saved to your account and linked to your wallet address. They will persist across sessions as long as you connect with the same wallet.',
        },
      ],
    },
    {
      title: 'Referral Program',
      icon: <Users className="w-5 h-5 text-accent-blue" />,
      items: [
        {
          question: 'How does the referral program work?',
          answer: (
            <div className="space-y-2">
              <p>Earn rewards by sharing Trio Terminal with friends:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Get your unique referral link from the Referral page</li>
                <li>Share the link with friends</li>
                <li>When they connect their wallet via your link, they become your referral</li>
                <li>Earn rewards when your referrals do analyses - forever!</li>
              </ol>
            </div>
          ),
        },
        {
          question: 'When do I receive my rewards?',
          answer:
            'You will receive rewards instantly when your referrals do analyses.',
        },
        {
          question: 'Where can I see my referral stats?',
          answer:
            'Visit the Referral page to see your referral link, total referrals, total earnings, list of your referrals, and recent earning transactions. You can also verify transactions on Solscan.',
        },
        {
          question: 'Can I refer myself?',
          answer:
            'No, self-referrals are not allowed. The system automatically prevents users from using their own referral link.',
        },
      ],
    },
    {
      title: 'Security & Privacy',
      icon: <Shield className="w-5 h-5 text-accent-green" />,
      items: [
        {
          question: 'What data do you collect?',
          answer:
            'We only store your wallet address to save your preferences (watchlist, alerts, history). We do not collect any personal information, email addresses, or private keys. Your wallet address is public on the blockchain anyway.',
        },
        {
          question: 'Can you access my wallet funds?',
          answer:
            'No. We only request approval for the specific analysis. We cannot access, transfer, or control any funds in your wallet beyond the transactions you explicitly approve.',
        },
        {
          question: 'Are transactions secure?',
          answer:
            'Yes. All payments are processed on the Solana blockchain with full transparency. Every transaction can be verified on Solscan. We use standard Solana wallet adapter protocols for secure wallet connections.',
        },
        {
          question: 'What happens if I disconnect my wallet?',
          answer:
            'Disconnecting your wallet logs you out of the session. Your watchlist, alerts, and history remain saved and will be available when you reconnect with the same wallet.',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-2">
        <HelpCircle className="w-8 h-8 text-accent-blue" />
        <h1 className="text-3xl font-bold text-text-primary">FAQ</h1>
      </div>
      <p className="text-text-secondary mb-8">
        Frequently asked questions about Trio Terminal
      </p>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              {category.icon}
              {category.title}
            </h2>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <FAQAccordion key={itemIndex} {...item} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Still Need Help */}
      <Card className="p-5 mt-10 bg-accent-blue/10 border-accent-blue/30">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-accent-blue flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-1">Still have questions?</h3>
            <p className="text-sm text-text-secondary mb-3">
              Check out our detailed Help Center for step-by-step guides and more information.
            </p>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-accent-blue hover:underline text-sm font-medium"
            >
              Visit Help Center
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
