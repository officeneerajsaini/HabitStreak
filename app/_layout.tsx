import { HabitListProvider } from '@/context/HabitListContext';
import { TrackerProvider } from '@/context/TrackerContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log('Auth Check:', { 
      hasUser: !!user, 
      inAuthGroup, 
      segments: segments.join('/') 
    });

    if (!user && !inAuthGroup) {
      // Not logged in, redirect to login
      console.log('→ Redirecting to login');
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Logged in but on auth screen, redirect to app
      console.log('→ Redirecting to app');
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <HabitListProvider>
      <TrackerProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TrackerProvider>
    </HabitListProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}