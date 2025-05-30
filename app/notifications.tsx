import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, RefreshControl, ScrollView, Pressable, Button } from "react-native";
import { useNotificationContext } from "./context/NotificationContext";
import { useUser } from "./context/UserContext";
import { supabase } from "@/supabaseClient";
import { useRouter } from 'expo-router';
import { NotificationCard } from "@/components/ui/NotificationCard";
import { Ionicons } from "@expo/vector-icons";

// Import for scheduling local notification when new one arrives
import * as Notifications from "expo-notifications"

interface Notification {
    id: string;
    title: string;
    description: string;
    created_at: string;
    notification_type: string;
    // sender_profile_id: string | null;
    food_item_id?: string | null;
    food_item?: {
        photos: string[] | null;
    } | null;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const loggedInProfileId = user?.id;

    const { scheduleLocalNotification } = useNotificationContext();

    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        if (!loggedInProfileId) return;
        const { data, error } = await supabase
            .from('notification')
            .select(`
                *,
                fooditem (
                    food_name,
                    photos
                )
            `)
            .eq('receiver_profile_id', loggedInProfileId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching notifications:", error);
        } else {
            // console.log("Fetched notifications data:", data)
            setNotifications(data as Notification[]);
        }
    };

    useEffect(() => {
        // console.log("Fetching notifications for user:", loggedInProfileId);
        fetchNotifications();
    }, [loggedInProfileId]);

    const deleteNotification = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('notification')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Error deleting notification:", error)
                return;
            }

            await fetchNotifications();
        } catch (err) {
            console.error("Unable to delete notification:", err);
        }
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications().finally(() => setRefreshing(false));
    }, [loggedInProfileId]);

    const handlePressFoodItem = (foodItemId: string) => {
        router.push(`/food/${foodItemId}`)
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.left}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons
                            name='chevron-back'
                            size={28}
                            color='#333'
                        />
                    </Pressable>
                </View>
                <View style={styles.center}>
                    <Text style={styles.headerTitle}>Notifications</Text>

                </View>
                <View style={styles.right}>
                    { /* balance out right side */}
                </View>

            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onPressFoodItem={handlePressFoodItem}
                            onDelete={deleteNotification}
                        />
                    ))
                ) : (
                    <View style={styles.noNotificationContainer}>
                        <Text style={styles.woopNoNotification}>Woops!</Text>
                        <Text style={styles.noNotifications}>You have no notifications!</Text>
                    </View>

                )}

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginHorizontal: 10,
    },
    left: {
        flex: 1,
        alignItems: 'flex-start'
    },
    center: {
        flex: 2,
        alignItems: 'center',
    },
    right: {
        flex: 1,
        alignItems: 'flex-end'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    noNotificationContainer: {
        marginTop: 60,
        alignSelf: 'center',
        alignItems: 'center',
    },
    woopNoNotification: {
        fontSize: 48,
        fontWeight: '800',
        color: '#aaa',
    },
    noNotifications: {
        marginTop: 10,
        fontSize: 36,
        fontWeight: '800',
        color: '#aaa',
    },
})