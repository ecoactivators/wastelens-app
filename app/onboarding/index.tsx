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

        {/* Get Started Button - Centered */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: theme.colors.text }]}
            onPress={() => router.push('/onboarding/location')}
            activeOpacity={0.9}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Get Started
            </Text>
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
    paddingHorizontal: 20,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.06,
    paddingBottom: height * 0.06,
  },
  heroCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  heroGradient: {
    flex: 1,
  },
  heroContent: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: height * 0.08,
  },
  getStartedButton: {
    borderRadius: 24,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
});