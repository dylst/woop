import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert} from 'react-native'

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token: string | undefined;

    if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert('Permission required', 'Failed to get push token for push notifications!');
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
    } else {
        Alert.alert('Device required', 'Push notifications only wokr on physical devices.');
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ff231f7c'
        });
    }

    return token;
}

export async function sendPushNotification(expoPushToken: string): Promise<void> {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Hello!',
        body: 'This is a test notification',
        data: { extraData: 'Extra data test'},
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}