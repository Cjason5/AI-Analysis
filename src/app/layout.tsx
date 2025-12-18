import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/wallet/WalletProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Trio Terminal - Trading Signals',
  description:
    'Get trading signals and analysis for cryptocurrency tokens across top exchanges',
  keywords: [
    'crypto',
    'trading signals',
    'analysis',
    'cryptocurrency',
    'bitcoin',
    'ethereum',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased bg-bg-primary text-text-primary min-h-screen flex flex-col`}
      >
        <WalletProvider>
          <NotificationProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NotificationProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
