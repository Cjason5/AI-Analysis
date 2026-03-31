'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, ChevronDown, Copy, LogOut, Check, RefreshCw } from 'lucide-react';

export function ConnectButton() {
  const { publicKey, wallet, disconnect, connecting, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    setDropdownOpen(false);
    await disconnect();
  };

  const handleChangeWallet = () => {
    setDropdownOpen(false);
    // First disconnect, then show modal
    disconnect().then(() => {
      setVisible(true);
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Not connected - show connect button
  if (!connected && !connecting) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  // Connecting state
  if (connecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 bg-accent-blue/50 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-wait"
      >
        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  // Connected - show address with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 bg-bg-card hover:bg-bg-secondary border border-border-color text-text-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {wallet?.adapter.icon && (
          <img
            src={wallet.adapter.icon}
            alt={wallet.adapter.name}
            className="h-4 w-4"
          />
        )}
        <span>{publicKey ? truncateAddress(publicKey.toBase58()) : 'Connected'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-bg-card border border-border-color rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Wallet Info */}
          <div className="px-4 py-3 border-b border-border-color">
            <div className="flex items-center gap-2 mb-1">
              {wallet?.adapter.icon && (
                <img
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  className="h-5 w-5"
                />
              )}
              <span className="text-sm font-medium text-text-primary">
                {wallet?.adapter.name}
              </span>
            </div>
            <p className="text-xs text-text-muted font-mono">
              {publicKey?.toBase58()}
            </p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-accent-green" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>

            <button
              onClick={handleChangeWallet}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Change Wallet</span>
            </button>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-red hover:bg-accent-red/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
