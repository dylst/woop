import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/supabaseClient';
import { useUser } from './UserContext';

export type StoredNotification = Notifications.Notification;

type NotificationContextType = {
    notifications: StoredNotification[];
    addNotification: (notification: StoredNotification) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<StoredNotification[]>([]);
    const { user } = useUser();

    const addNotification = (notification: StoredNotification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    async function registerForPushNotificationsAsync() {
        let token;
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notifications');
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            })
        }

        return token;
    }

    useEffect(() => {
        if (user) {
            registerForPushNotificationsAsync().then(token => {
                console.log("Expo push token generated:", token);

                if (token) {
                    supabase
                        .from('profile')
                        .update({ expo_push_token: token })
                        .eq('id', user.id)
                        .then(({ error }) => {
                            if (error) console.error("Error updating push token:", error);
                        });
                }
            })
        }
    }, [user])

    return (
        <NotificationContext.Provider value={{ notifications, addNotification }}>
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