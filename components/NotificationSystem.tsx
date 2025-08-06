"use client";

import React, { useState, useEffect, useCallback } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

/**
 * Individual notification item component
 */
function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Show notification with animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss notification after duration
  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.persistent]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  }, [notification.id, onDismiss]);

  const getNotificationStyles = () => {
    const baseStyles = "border-l-4 p-4 rounded-r-lg shadow-lg";

    switch (notification.type) {
      case "success":
        return `${baseStyles} bg-green-50 border-green-400`;
      case "error":
        return `${baseStyles} bg-red-50 border-red-400`;
      case "warning":
        return `${baseStyles} bg-yellow-50 border-yellow-400`;
      case "info":
        return `${baseStyles} bg-blue-50 border-blue-400`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400`;
    }
  };

  const getIconStyles = () => {
    switch (notification.type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getTextStyles = () => {
    switch (notification.type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-gray-800";
    }
  };

  const renderIcon = () => {
    const iconClass = `h-5 w-5 ${getIconStyles()}`;

    switch (notification.type) {
      case "success":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isExiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div className={getNotificationStyles()}>
        <div className="flex">
          <div className="flex-shrink-0">{renderIcon()}</div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTextStyles()}`}>
              {notification.title}
            </p>
            {notification.message && (
              <p className={`mt-1 text-sm ${getTextStyles()} opacity-90`}>
                {notification.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex ${getTextStyles()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600 transition-opacity`}
              onClick={handleDismiss}
              aria-label="Dismiss notification"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Notification system component for displaying success and error messages
 */
export default function NotificationSystem({
  notifications,
  onDismiss,
}: NotificationSystemProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = `notification-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newNotification: Notification = {
        id,
        duration: 5000,
        ...notification,
      };

      setNotifications((prev) => [...prev, newNotification]);
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({ type: "success", title, message, ...options });
    },
    [addNotification]
  );

  const showError = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        type: "error",
        title,
        message,
        persistent: true,
        ...options,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({ type: "warning", title, message, ...options });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({ type: "info", title, message, ...options });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
