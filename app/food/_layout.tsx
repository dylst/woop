import { Stack } from 'expo-router';

export default function FoodLayout() {
    return (
        <Stack
        screenOptions={{headerShown: false}}
        >
            <Stack.Screen name="[foodItemId]"/>
        </Stack>
    )
}