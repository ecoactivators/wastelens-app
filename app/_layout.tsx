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
import { SplashScreen } from 'expo-router'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ItemsProvider } from '@/contexts/ItemsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationService } from '@/services/location';
import { router } from 'expo-router';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isDark } = useTheme();
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="analysis" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="items" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

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

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // For now, always show onboarding. In a real app, you'd check storage
        // const hasCompletedOnboarding = await StorageService.hasCompletedOnboarding();
        const hasCompletedOnboarding = false;
        
        if (fontsLoaded || fontError) {
          if (!hasCompletedOnboarding) {
            router.replace('/onboarding');
          } else {
            // Request location permission when app starts for returning users
            try {
              console.log('🚀 [RootLayout] Requesting location permission for returning user...');
              const granted = await LocationService.requestLocationPermission();
              if (granted) {
                console.log('✅ [RootLayout] Location permission granted');
                await LocationService.getCurrentLocation();
              }
            } catch (error) {
              console.error('❌ [RootLayout] Error requesting location permission:', error);
            }
            
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.error('❌ [RootLayout] Error checking onboarding status:', error);
        // Default to showing onboarding on error
        if (fontsLoaded || fontError) {
          router.replace('/onboarding');
        }
      }
    };

    checkOnboardingStatus();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ItemsProvider>
          <RootLayoutContent />
        </ItemsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}