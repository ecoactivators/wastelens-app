import { useEffect, useState } from 'react';
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
import { StorageService } from '@/services/storage';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ItemsProvider>
          <AuthNavigationHandler />
        </ItemsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Separate component to handle navigation logic with access to auth context
function AuthNavigationHandler() {
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      try {
        // Wait a bit for auth to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check authentication status first
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('✅ [RootLayout] User is authenticated, going to camera');
          // Request location permission for authenticated users
          try {
            const granted = await LocationService.requestLocationPermission();
            if (granted) {
              await LocationService.getCurrentLocation();
            }
          } catch (error) {
            console.error('❌ [RootLayout] Error requesting location permission:', error);
          }
          
          router.replace('/camera');
        } else {
          console.log('🎯 [RootLayout] User not authenticated, checking onboarding status');
          // Check if user has completed onboarding (for guest users)
          const hasCompletedOnboarding = await StorageService.hasCompletedOnboarding();
          
          if (!hasCompletedOnboarding) {
            console.log('🎯 [RootLayout] User has not completed onboarding, showing onboarding flow');
            router.replace('/onboarding');
          } else {
            console.log('🎯 [RootLayout] Guest user has completed onboarding, going to camera');
            router.replace('/camera');
          }
        }
        
        setNavigationReady(true);
      } catch (error) {
        console.error('❌ [RootLayout] Error in navigation handler:', error);
        // Default to onboarding on error
        router.replace('/onboarding');
        setNavigationReady(true);
      }
    };

    handleNavigation();
  }, []);

  // Don't render anything until navigation is determined
  if (!navigationReady) {
    return null;
  }

  return <RootLayoutContent />;
}