'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface Notification {
  id: string;
  type: 'price_alert' | 'system';
  title: string;
  message: string;
  tokenSymbol?: string;
  exchange?: string;
  targetPrice?: number;
  currentPrice?: number;
  condition?: 'above' | 'below';
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  checkAlerts: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  pushPermission: NotificationPermission | 'default';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'default'>('default');

  const walletAddress = publicKey?.toBase58();

  // Check push notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!walletAddress) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/notifications?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const checkAlerts = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.triggeredAlerts && data.triggeredAlerts.length > 0) {
          // Refresh notifications to get new ones
          await fetchNotifications();

          // Show browser push notification for each triggered alert
          if (pushPermission === 'granted') {
            data.triggeredAlerts.forEach((alert: { tokenSymbol: string; condition: string; targetPrice: number; currentPrice: number }) => {
              showPushNotification(
                `Price Alert: ${alert.tokenSymbol}`,
                `${alert.tokenSymbol} is now ${alert.condition} $${alert.targetPrice.toFixed(2)}. Current price: $${alert.currentPrice.toFixed(2)}`
              );
            });
          }
        }
      }
    } catch (err) {
      console.error('Error checking alerts:', err);
    }
  }, [walletAddress, fetchNotifications, pushPermission]);

  const markAsRead = useCallback(async (id: string) => {
    if (!walletAddress) return;

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, notificationId: id, read: true }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [walletAddress]);

  const markAllAsRead = useCallback(async () => {
    if (!walletAddress) return;

    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [walletAddress]);

  const clearNotification = useCallback(async (id: string) => {
    if (!walletAddress) return;

    try {
      await fetch(`/api/notifications?walletAddress=${walletAddress}&notificationId=${id}`, {
        method: 'DELETE',
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error clearing notification:', err);
    }
  }, [walletAddress]);

  const clearAllNotifications = useCallback(async () => {
    if (!walletAddress) return;

    try {
      await fetch(`/api/notifications/clear-all?walletAddress=${walletAddress}`, {
        method: 'DELETE',
      });

      setNotifications([]);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  }, [walletAddress]);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      return permission === 'granted';
    } catch (err) {
      console.error('Error requesting push permission:', err);
      return false;
    }
  }, []);

  const showPushNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    }
  };

  // Fetch notifications on wallet connect
  useEffect(() => {
    if (walletAddress) {
      fetchNotifications();
    }
  }, [walletAddress, fetchNotifications]);

  // Poll for alerts every 30 seconds when wallet is connected
  useEffect(() => {
    if (!walletAddress) return;

    const interval = setInterval(() => {
      checkAlerts();
    }, 30000); // Check every 30 seconds

    // Initial check
    checkAlerts();

    return () => clearInterval(interval);
  }, [walletAddress, checkAlerts]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        checkAlerts,
        requestPushPermission,
        pushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
