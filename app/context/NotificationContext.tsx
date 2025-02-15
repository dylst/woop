import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/supabaseClient';
import { useUser } from './UserContext';

export interface AppNotification {
    id: number;
    notification_type: string;
    receiver_profile_id: string;
    review_id?: number;
    food_item_id?: number;
    title: string | null;
    description: string | null;
    created_at: string;
  }

// Set the notification handler so that notifications show even in the foreground.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

export type StoredNotification = AppNotification;

type NotificationContextType = {
    notifications: StoredNotification[];
    addNotification: (notification: StoredNotification) => void;
    scheduleLocalNotification: (content: Notifications.NotificationContentInput) => Promise<void>;
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

    // Reusable function to schedule a local notification.
    async function scheduleLocalNotification(content: Notifications.NotificationContentInput) {
        await Notifications.scheduleNotificationAsync({
            content,
            // Set a short delay so that the notification appears almost immediately.
            trigger: { seconds: 1} as Notifications.TimeIntervalTriggerInput,
        });
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

    useEffect(() => {
        if (!user?.id) return;

        console.log("Setting up realtime subscription for user:", user.id);

        const channel = supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification',
                    filter: `receiver_profile_id=eq.${user.id}`
                },
                (payload) => {
                    console.log("Realtime payload received:", payload);
                    const newNotification = payload.new as StoredNotification;
                    addNotification(newNotification);

                    scheduleLocalNotification({
                        title: newNotification.title || 'New Notification',
                        body: newNotification.description || '',
                        data: { notificationId: newNotification.id }
                    });
                }
            )
            .subscribe();

            console.log("Realtime channel subscription:", channel);

            return () => {
                supabase.removeChannel(channel);
                console.log("Realtime channel removed");
            }
    }, [user?.id, scheduleLocalNotification, addNotification])

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, scheduleLocalNotification }}>
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