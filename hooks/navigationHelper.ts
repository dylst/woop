import { useRouter } from 'expo-router';

export const useFoodItemNavigation = () => {
    const router = useRouter();

    const navigateToFoodItem = (foodItemId: string) => {
        router.push(`/food/${foodItemId}`);
    };

    return navigateToFoodItem
};