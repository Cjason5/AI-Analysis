import Link from 'next/link';
import Image from 'next/image';

// X (Twitter) logo
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Telegram logo
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-color mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo-header.svg"
                alt="Trio Terminal"
                width={160}
                height={32}
              />
            </Link>
            <p className="text-text-secondary text-sm max-w-md">
              Cryptocurrency trading signal platform. Get insights,
              track tokens, and make informed decisions with advanced analytics
              from top exchanges.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  Tokens
                </Link>
              </li>
              <li>
                <Link
                  href="/watchlist"
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  href="/alerts"
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  Price Alerts
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  Signal History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  Help & FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} Trio Terminal. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/triopadx?s=11"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="X (Twitter)"
            >
              <XIcon className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/trio_announcement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Telegram"
            >
              <TelegramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
