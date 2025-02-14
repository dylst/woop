import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { useNotificationContext } from "./context/NotificationContext";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

function getRelativeTime(date: Date): string {
    const now = new Date();
    const hours = differenceInHours(now, date);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = differenceInDays(now, date);
    if (days < 7) {
        return `${days}d ago`;
    }

    const weeks = differenceInWeeks(now, date);
    if (weeks < 4) {
        return `${weeks}w ago`;
    }

    const months = differenceInMonths(now, date);
    if (months < 12) {
        return `${months}m ago`;
    }

    const years = differenceInYears(now, date);
    return `Over ${years}y ago`
}

type Notification = {
    id: string,
    title: string,
    body: string,
    date: Date,
}

export default function NotificationsScreen() {
    // const { notifications } = useNotificationContext();

    return (
        <SafeAreaView style={styles.container}>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    }
})