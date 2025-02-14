import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider, useUser } from './context/UserContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
      <AuthRedirect>
        <Slot/>
      </AuthRedirect>
        <StatusBar style='auto' />
      </UserProvider>
    </ThemeProvider>
  );
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // When not authenticated and not already on the login screen, redirect to /users.
    if (!user && segments[0] !== 'users') {
      router.replace('/users');
    }
    // When authenticated but on the login screen, redirect to /(tabs).
    if (user && segments[0] === 'users') {
      router.replace('/(tabs)');
    }
  }, [user, segments, router]);

  return <>{children}</>;
}