'use client';

import { useState, Suspense } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useReferral } from '@/hooks/useReferral';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import {
  Users,
  DollarSign,
  Copy,
  Check,
  Link as LinkIcon,
  ExternalLink,
  UserPlus,
} from 'lucide-react';

function ReferralContent() {
  const { connected, publicKey } = useWallet();
  const { stats, isLoading } = useReferral();
  const [copied, setCopied] = useState(false);

  // Generate referral link client-side as fallback
  const walletAddress = publicKey?.toBase58();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = stats?.referralLink || (walletAddress ? `${baseUrl}/?ref=${walletAddress}` : '');

  const handleCopyLink = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateWallet = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-text-secondary mb-4">
            Connect your wallet to access your referral dashboard
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Referral Program</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-48 mb-6" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-accent-blue" />
        <h1 className="text-3xl font-bold text-text-primary">Referral Program</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-blue/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-accent-blue" />
            </div>
            <span className="text-text-secondary text-sm">Total Referrals</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {stats?.downlineCount || 0}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-green/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-accent-green" />
            </div>
            <span className="text-text-secondary text-sm">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold text-accent-green">
            ${(stats?.totalEarnings || 0).toFixed(2)}
          </p>
          <p className="text-text-muted text-xs mt-1">USDC</p>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-accent-blue" />
          <h2 className="text-lg font-semibold text-text-primary">Your Referral Link</h2>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          Share this link with friends and earn rewards.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-bg-secondary border border-border-color rounded-lg px-4 py-2 text-text-primary text-sm"
          />
          <Button onClick={handleCopyLink} variant="primary" disabled={!referralLink}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Referred By */}
      {stats?.referredBy && (
        <Card className="p-6 mb-6 border-accent-blue/30">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent-blue" />
            <span className="text-text-secondary">You were referred by:</span>
            <span className="text-text-primary font-mono">
              {truncateWallet(stats.referredBy)}
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Referrals */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Your Referrals</h2>
          {stats?.downlines && stats.downlines.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.downlines.map((downline) => (
                <div
                  key={downline.walletAddress}
                  className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg"
                >
                  <div>
                    <p className="text-text-primary font-mono text-sm">
                      {truncateWallet(downline.walletAddress)}
                    </p>
                    <p className="text-text-muted text-xs">
                      Joined {formatDate(downline.joinedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary font-semibold">
                      {downline.analysisCount}
                    </p>
                    <p className="text-text-muted text-xs">analyses</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No referrals yet</p>
              <p className="text-text-muted text-sm">
                Share your link to start earning
              </p>
            </div>
          )}
        </Card>

        {/* Recent Earnings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Rewards</h2>
          {stats?.recentEarnings && stats.recentEarnings.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.recentEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg"
                >
                  <div>
                    <p className="text-text-primary text-sm">
                      From {truncateWallet(earning.downlineWallet)}
                    </p>
                    <p className="text-text-muted text-xs">
                      {formatDate(earning.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent-green font-semibold">
                      +${earning.commissionAmount.toFixed(4)}
                    </p>
                    <a
                      href={`https://solscan.io/tx/${earning.txSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue text-xs flex items-center gap-1 hover:underline"
                    >
                      View tx
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No earnings yet</p>
              <p className="text-text-muted text-sm">
                Rewards appear when referrals do analyses
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* How it works */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-accent-blue font-bold text-xl">1</span>
            </div>
            <h3 className="text-text-primary font-medium mb-1">Share Your Link</h3>
            <p className="text-text-secondary text-sm">
              Copy and share your unique referral link with friends
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-accent-blue font-bold text-xl">2</span>
            </div>
            <h3 className="text-text-primary font-medium mb-1">Friends Join</h3>
            <p className="text-text-secondary text-sm">
              When they visit and connect their wallet, they become your referral
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-accent-green font-bold text-xl">3</span>
            </div>
            <h3 className="text-text-primary font-medium mb-1">Earn Commission</h3>
            <p className="text-text-secondary text-sm">
              Earn rewards when your friends use Trio Terminal for market analysis - forever!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReferralLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-10 w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-48 mb-6" />
      <Skeleton className="h-64" />
    </div>
  );
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<ReferralLoadingSkeleton />}>
      <ReferralContent />
    </Suspense>
  );
}
