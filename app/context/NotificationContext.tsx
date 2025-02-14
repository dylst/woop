import React, { createContext, useState, useContext, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';

export type StoredNotification = Notifications.Notification;

type NotificationContextType = {
    notifications: StoredNotification[];
    addNotification: (notification: StoredNotification) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<StoredNotification[]>([]);

    const addNotification = (notification: StoredNotification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification}}>
            {children}
        </NotificationContext.Provider>
    );
};

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }

    return context;
}