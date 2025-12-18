'use client';

import dynamic from 'next/dynamic';

// Dynamically import the wallet button to avoid SSR issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
    loading: () => (
      <button className="bg-accent-blue text-white px-4 py-2 rounded-lg text-sm font-medium opacity-50">
        Loading...
      </button>
    ),
  }
);

export function ConnectButton() {
  return (
    <WalletMultiButton
      style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        height: '36px',
        lineHeight: '1',
      }}
    />
  );
}
