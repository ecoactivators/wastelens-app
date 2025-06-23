import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import * as Location from 'expo-location';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

// REQUIRED: useFrameworkReady hook - NEVER REMOVE
function useFrameworkReady() {
  useEffect(() => {
    window.frameworkReady?.()
  })
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      window.frameworkReady?.();
    }
  }, [fontsLoaded, fontError]);

  // Auto-request location permission on app start
  useEffect(() => {
    const requestLocation = async () => {
      try {
        console.log('🚀 Auto-requesting location permission...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          console.log('✅ Location permission granted');
          await Location.getCurrentPositionAsync();
        }
      } catch (error) {
        console.error('❌ Error requesting location permission:', error);
      }
    };

    if (fontsLoaded || fontError) {
      requestLocation();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="analysis" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}