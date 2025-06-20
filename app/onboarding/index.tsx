import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StorageService } from '@/services/storage';

const { width, height } = Dimensions.get('window');

export default function OnboardingIntro() {
  const { theme } = useTheme();
  const [skipOnboarding, setSkipOnboarding] = useState(false);

  const handleGetStarted = async () => {
    try {
      if (skipOnboarding) {
        // Mark onboarding as completed so it won't show again
        await StorageService.setOnboardingCompleted();
        console.log('✅ [OnboardingIntro] Onboarding marked as completed');
      }
      
      // Continue to location screen
      router.push('/onboarding/location');
    } catch (error) {
      console.error('❌ [OnboardingIntro] Error saving onboarding preference:', error);
      // Continue anyway to not block the user
      router.push('/onboarding/location');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.surface, theme.colors.surfaceElevated]}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
                  Waste Lens
                </Text>
                <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                  Snap your waste, reduce your bill
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Skip Onboarding Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSkipOnboarding(!skipOnboarding)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox, 
              { 
                backgroundColor: skipOnboarding ? theme.colors.primary : 'transparent',
                borderColor: skipOnboarding ? theme.colors.primary : theme.colors.border
              }
            ]}>
              {skipOnboarding && (
                <Check size={14} color={theme.colors.surface} strokeWidth={2.5} />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: theme.colors.textSecondary }]}>
              Don't show me this again
            </Text>
          </TouchableOpacity>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: theme.colors.text }]}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.colors.text, theme.colors.text]}
              style={styles.buttonGradient}
            >
              <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: height * 0.08,
  },
  heroCard: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 0.85,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  heroGradient: {
    flex: 1,
  },
  heroContent: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.1,
    opacity: 0.9,
  },
  checkboxContainer: {
    paddingHorizontal: 8,
    paddingVertical: 20,
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  buttonContainer: {
    paddingHorizontal: 8,
    paddingBottom: height * 0.06,
  },
  getStartedButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    letterSpacing: 0.3,
  },
});