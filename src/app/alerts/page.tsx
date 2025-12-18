'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAlerts } from '@/hooks/useAlerts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Bell, BellOff, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AlertsPage() {
  const { connected } = useWallet();
  const { alerts, isLoading, error, toggleAlert, deleteAlert } = useAlerts();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <Bell className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-text-secondary mb-4">
            Connect your wallet to view and manage your price alerts
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Price Alerts</h1>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <p className="text-accent-red">{error}</p>
        </Card>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.isActive);
  const inactiveAlerts = alerts.filter((a) => !a.isActive);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Price Alerts</h1>
        <span className="text-text-secondary">
          {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {alerts.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No price alerts set
          </h2>
          <p className="text-text-secondary">
            Set price alerts on token cards to get notified when prices reach your target
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeAlerts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Active Alerts
              </h2>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onToggle={() => toggleAlert(alert.id, false)}
                    onDelete={() => deleteAlert(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {inactiveAlerts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-text-muted mb-4">
                Inactive Alerts
              </h2>
              <div className="space-y-3">
                {inactiveAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onToggle={() => toggleAlert(alert.id, true)}
                    onDelete={() => deleteAlert(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  onToggle,
  onDelete,
}: {
  alert: {
    id: string;
    tokenSymbol: string;
    tokenName: string;
    exchange: string;
    targetPrice: number;
    condition: 'above' | 'below';
    isActive: boolean;
  };
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle();
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`p-4 ${
        alert.isActive ? 'border-accent-blue/50' : 'opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              alert.condition === 'above'
                ? 'bg-accent-green/20 text-accent-green'
                : 'bg-accent-red/20 text-accent-red'
            }`}
          >
            {alert.condition === 'above' ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">
                {alert.tokenSymbol}
              </span>
              <Badge variant="secondary">{alert.exchange}</Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Alert when price goes{' '}
              <span
                className={
                  alert.condition === 'above'
                    ? 'text-accent-green'
                    : 'text-accent-red'
                }
              >
                {alert.condition}
              </span>{' '}
              {formatPrice(alert.targetPrice)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
          >
            {alert.isActive ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 text-accent-red" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
