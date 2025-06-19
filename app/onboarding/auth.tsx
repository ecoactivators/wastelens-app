import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

// Apple Logo SVG Component
const AppleLogo = ({ size = 20, color = "#ffffff" }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size * 0.9, color }}>🍎</Text>
  </View>
);

// Google Logo SVG Component
const GoogleLogo = ({ size = 20 }) => (
  <View style={{ 
    width: size, 
    height: size, 
    borderRadius: size / 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }}>
    <Text style={{ fontSize: size * 0.6, fontWeight: 'bold' }}>G</Text>
  </View>
);

export default function AuthScreen() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: Platform.OS === 'web' ? `${window.location.origin}/onboarding/complete` : undefined,
        },
      });

      if (error) {
        console.error('Apple sign in error:', error);
        Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
        return;
      }

      // On mobile, we need to handle the redirect differently
      if (Platform.OS !== 'web') {
        router.push('/onboarding/complete');
      }
    } catch (error) {
      console.error('Apple sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.OS === 'web' ? `${window.location.origin}/onboarding/complete` : undefined,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
        return;
      }

      // On mobile, we need to handle the redirect differently
      if (Platform.OS !== 'web') {
        router.push('/onboarding/complete');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
          </TouchableOpacity>
          
          {/* Progress Bar */}
          <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.text, width: '75%' }]} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Create an account
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sign up to save your progress, sync across devices, and unlock personalized insights.
          </Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authContainer}>
          <TouchableOpacity
            style={[styles.appleButton, { backgroundColor: theme.colors.text }]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <AppleLogo size={22} color={theme.colors.surface} />
            <Text style={[styles.appleButtonText, { color: theme.colors.surface }]}>
              Sign in with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <GoogleLogo size={22} />
            <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>
              Sign in with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: theme.colors.textTertiary }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.termsLink, { color: theme.colors.primary }]}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={[styles.termsLink, { color: theme.colors.primary }]}>Privacy Policy</Text>
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: height * 0.02,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.min(width * 0.075, 30),
    marginBottom: 16,
    lineHeight: Math.min(width * 0.09, 36),
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  authContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: height * 0.04,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appleButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  termsContainer: {
    paddingHorizontal: 20,
    paddingBottom: height * 0.04,
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    fontFamily: 'Inter-Medium',
  },
});