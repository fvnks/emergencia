
"use client";

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

export interface AlertNotificationItem {
  id: string;
  date: Date;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  type: string; 
  link?: string;
  severity?: 'info' | 'warning' | 'error';
}

interface AppDataContextType {
  activeAlertsCount: number;
  setActiveAlertsCount: (count: number) => void;
  alertNotifications: AlertNotificationItem[];
  setAlertNotifications: (alerts: AlertNotificationItem[]) => void;
  seenNotificationIds: string[];
  markNotificationAsSeen: (notificationId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [alertNotifications, setAlertNotifications] = useState<AlertNotificationItem[]>([]);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);

  const markNotificationAsSeen = (notificationId: string) => {
    setSeenNotificationIds((prevSeenIds) => {
      if (!prevSeenIds.includes(notificationId)) {
        return [...prevSeenIds, notificationId];
      }
      return prevSeenIds;
    });
  };

  return (
    <AppDataContext.Provider value={{
      activeAlertsCount,
      setActiveAlertsCount,
      alertNotifications,
      setAlertNotifications,
      seenNotificationIds,
      markNotificationAsSeen
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData debe ser utilizado dentro de un AppDataProvider');
  }
  return context;
}
