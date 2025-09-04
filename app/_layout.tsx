import { TasksProvider } from '@/context/TasksProvider';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { auth } from '../lib/firebase';

// This hook will protect the route access based on user authentication
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === '(tabs)';
      const inSettings = segments[0] === 'settings';
      
      if (!user && (inAuthGroup || inSettings)) {
        // If user is not signed in and trying to access protected route, redirect to login
        router.replace('/login');
      } else if (user && !inAuthGroup && !inSettings && segments[0] !== 'oauth') {
        // If user is signed in and trying to access auth route, redirect to tabs
        router.replace('/(tabs)');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [segments, router]);

  return isLoading;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const isLoading = useProtectedRoute();

  // Notification setup
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  if (!loaded || isLoading) {
    return null;
  }

  // Customize the dark theme to match your app's color scheme
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#000000',
      card: '#000000',
      border: '#000000',
    },
  };

  return (
    <TasksProvider>
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <ThemeProvider value={customDarkTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000000' },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="login" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </View>
    </TasksProvider>
  );
}
