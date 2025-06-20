import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 [AuthScreen] Starting Google sign in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.OS === 'web' ? `${window.location.origin}/onboarding/complete` : undefined,
        },
      });

      if (error) {
        console.error('❌ [AuthScreen] Google sign in error:', error);
        Alert.alert('Sign In Error', 'Failed to sign in with Google. Please try again.');
        return;
      }

      console.log('✅ [AuthScreen] Google sign in initiated successfully');
      
      // On mobile, we need to handle the redirect differently
      if (Platform.OS !== 'web') {
        router.push('/onboarding/complete');
      }
    } catch (error) {
      console.error('❌ [AuthScreen] Google sign in exception:', error);
      Alert.alert('Sign In Error', 'An unexpected error occurred. Please try again.');
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
            <View style={[styles.progressBar, { backgroundColor: theme.colors.text, width: '100%' }]} />
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

        {/* Auth Button */}
        <View style={styles.authContainer}>
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <Image 
              source={require('@/assets/images/Google__G__logo.svg.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
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
    marginBottom: height * 0.04,
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
  googleIcon: {
    width: 20,
    height: 20,
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