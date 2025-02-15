import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

function getRelativeTime(date: Date): string {
    const now = new Date();
    const seconds = differenceInSeconds(now, date);
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = differenceInMinutes(now, date);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = differenceInHours(now, date);
    if (hours < 24) return `${hours}h ago`;

    const days = differenceInDays(now, date);
    if (days < 7) return `${days}d ago`;

    const weeks = differenceInWeeks(now, date);
    if (weeks < 4) return `${weeks}w ago`;

    const months = differenceInMonths(now, date);
    if (months < 12) return `${months}m ago`;

    const years = differenceInYears(now, date);
    return `${years}y ago`
}

export interface Notification {
    title: string;
    description: string;
    created_at: string;
    notification_type: string;
    // sender_profile_id: string | null;
    food_item_id?: string | null;
    // Joined from the "fooditem" table
    fooditem?: {
        food_name: string;
        photos: string[] | null;
    } | null;
}

interface NotificationCardProps {
    notification: Notification,
    onPressFoodItem?: (foodItemId: string) => void;
}

export function NotificationCard({
    notification,
    onPressFoodItem
}: NotificationCardProps) {
    const {
        title,
        description,
        created_at,
        notification_type,
        // sender_profile_id,
        food_item_id,
        fooditem,
    } = notification;
    const formattedDate = getRelativeTime(new Date(created_at));
    const foodImageUrl = fooditem && fooditem.photos && fooditem.photos.length > 0 ? fooditem.photos[0] : '';

    const isLikeNotification = notification_type === "liked";
    const isAnnouncement = notification_type === 'announcement';
    let leftContent;
    if (isLikeNotification) {
        leftContent = <Ionicons name="heart" size={40} color={Colors.primary.darkteal}/>;
    } else if (isAnnouncement) {
        leftContent = <Ionicons name="megaphone" size={40} color={Colors.primary.darkteal}/>;
    } else {
        leftContent = <Ionicons name="person" size={40} color={Colors.primary.darkteal}/>
    }

    const displayTitle = isLikeNotification && fooditem
        ?  'Food review liked!'
        : title;

    const displayDescription = isLikeNotification && fooditem
        ? `Someone has liked your review for ${fooditem.food_name}!`
        : description;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                if (food_item_id && onPressFoodItem) {
                    onPressFoodItem(food_item_id);
                }
            }}
        >
            { /* User image or announcement */}
            <View style={styles.leftSection}>
                {leftContent}
            </View>

            { /* Title and Description */}
            <View style={[
                styles.middleSection,
                { marginRight: 0 }
            ]}>
                <Text style={styles.title}>{displayTitle}</Text>
                <Text style={styles.description}>{displayDescription} <Text style={styles.date}>{formattedDate}</Text></Text>
            </View>

            { /* food item image */}
            {!isAnnouncement && food_item_id ? (
                <Image
                    source={{ uri: foodImageUrl || '' }}
                    style={styles.rightImage}
                />
            ) : (
               ''
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 10,
        marginHorizontal: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    leftSection: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
    },
    middleSection: {
        flex: 1,
        marginHorizontal: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 12,
        color: '#555',
        marginTop: 4,
    },
    date: {
        fontSize: 10,
        color: '#999',
    },
    rightImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
    }
})