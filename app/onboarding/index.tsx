import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function OnboardingIntro() {
  const { theme } = useTheme();

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

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: theme.colors.text }]}
            onPress={() => router.push('/onboarding/location')}
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