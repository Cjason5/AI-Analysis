'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BarChart3,
  Star,
  Bell,
  History,
  HelpCircle,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

const navItems = [
  { href: '/', label: 'Tokens', icon: BarChart3 },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/history', label: 'History', icon: History },
  { href: '/referral', label: 'Referral', icon: Users },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              Trio Terminal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            <Link
              href="/help"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <ThemeToggle />
            <div className="hidden sm:block">
              <ConnectButton />
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-color bg-bg-primary">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/help"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>
            <div className="pt-2">
              <ConnectButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
