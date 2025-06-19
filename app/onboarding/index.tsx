import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Camera, Leaf, Award, TrendingDown } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingIntro() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {/* App Icon/Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.logoGradient}
            >
              <Camera size={32} color="#ffffff" strokeWidth={1.5} />
            </LinearGradient>
          </View>

          {/* Main Title */}
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            Waste Lens
          </Text>
          
          {/* Tagline */}
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            Snap your waste, reduce your bill
          </Text>

          {/* Feature Preview Cards */}
          <View style={styles.featuresContainer}>
            <View style={[styles.featureCard, { backgroundColor: '#ffffff' }]}>
              <View style={styles.featureIcon}>
                <Camera size={20} color="#1e293b" strokeWidth={1.5} />
              </View>
              <Text style={styles.featureTitle}>AI Analysis</Text>
              <Text style={styles.featureDescription}>Smart waste identification</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: '#ffffff' }]}>
              <View style={styles.featureIcon}>
                <TrendingDown size={20} color="#059669" strokeWidth={1.5} />
              </View>
              <Text style={styles.featureTitle}>Track Impact</Text>
              <Text style={styles.featureDescription}>Monitor your progress</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: '#ffffff' }]}>
              <View style={styles.featureIcon}>
                <Award size={20} color="#dc2626" strokeWidth={1.5} />
              </View>
              <Text style={styles.featureTitle}>Earn Rewards</Text>
              <Text style={styles.featureDescription}>Get eco-friendly prizes</Text>
            </View>
          </View>

          {/* Environmental Impact Preview */}
          <View style={[styles.impactCard, { backgroundColor: '#ffffff' }]}>
            <View style={styles.impactHeader}>
              <Leaf size={18} color="#059669" strokeWidth={1.5} />
              <Text style={styles.impactTitle}>Join the movement</Text>
            </View>
            <Text style={styles.impactDescription}>
              Help reduce waste and earn rewards for sustainable choices
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: '#1e293b' }]}
            onPress={() => router.push('/onboarding/location')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
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
  },
  heroContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 0.2,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  impactCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  impactTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
  impactDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: height * 0.06,
  },
  getStartedButton: {
    borderRadius: 24,
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
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});