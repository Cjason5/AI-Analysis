'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    requestPushPermission,
    pushPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-accent-red rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-card border border-border-color rounded-lg shadow-xl z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-color">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-text-secondary hover:text-accent-red transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Push Permission Banner */}
          {pushPermission !== 'granted' && (
            <div className="p-3 bg-accent-blue/10 border-b border-border-color">
              <p className="text-xs text-text-secondary mb-2">
                Enable push notifications to get alerts even when the app is in the background.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={requestPushPermission}
                className="w-full text-xs"
              >
                Enable Push Notifications
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No notifications yet</p>
                <p className="text-text-muted text-xs mt-1">
                  Create price alerts to get notified when tokens hit your targets
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-color">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-bg-secondary/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-accent-blue/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`p-2 rounded-full ${
                          notification.condition === 'above'
                            ? 'bg-accent-green/20'
                            : 'bg-accent-red/20'
                        }`}
                      >
                        {notification.condition === 'above' ? (
                          <TrendingUp className="h-4 w-4 text-accent-green" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-accent-red" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-text-primary text-sm">
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-text-muted hover:text-accent-red transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-text-secondary text-xs mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                          <span>{formatTime(notification.createdAt)}</span>
                          {notification.exchange && (
                            <span className="bg-bg-secondary px-1.5 py-0.5 rounded">
                              {notification.exchange}
                            </span>
                          )}
                          {!notification.read && (
                            <span className="flex items-center gap-1 text-accent-blue">
                              <span className="w-1.5 h-1.5 bg-accent-blue rounded-full" />
                              New
                            </span>
                          )}
                        </div>
                        {notification.currentPrice && notification.targetPrice && (
                          <div className="mt-2 text-xs">
                            <span className="text-text-muted">Current: </span>
                            <span className="text-text-primary font-medium">
                              {formatPrice(notification.currentPrice)}
                            </span>
                            <span className="text-text-muted mx-2">|</span>
                            <span className="text-text-muted">Target: </span>
                            <span className="text-text-primary font-medium">
                              {formatPrice(notification.targetPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
