import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CheckCircle, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function CompleteScreen() {
  const { theme } = useTheme();
  const checkScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate check mark
    checkScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    
    // Animate sparkles
    sparkleOpacity.value = withDelay(300, withSequence(
      withSpring(1),
      withSpring(0.7),
      withSpring(1)
    ));
    
    // Animate content
    contentOpacity.value = withDelay(600, withSpring(1));
  }, []);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleGetStarted = () => {
    // Mark onboarding as complete and navigate to main app
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.gradient}
      >
        {/* Progress Bar - Complete */}
        <View style={styles.header}>
          <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.text, width: '100%' }]} />
          </View>
        </View>

        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.checkGradient}
            >
              <CheckCircle size={56} color="#ffffff" strokeWidth={2} />
            </LinearGradient>
          </Animated.View>

          {/* Sparkles */}
          <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleAnimatedStyle]}>
            <Sparkles size={18} color={theme.colors.warning} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle2, sparkleAnimatedStyle]}>
            <Sparkles size={14} color={theme.colors.primary} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleAnimatedStyle]}>
            <Sparkles size={16} color={theme.colors.accent} />
          </Animated.View>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            You're all set!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Welcome to Waste Lens. Start snapping your waste items to track your environmental impact and earn rewards.
          </Text>

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={styles.featureEmoji}>📸</Text>
              </View>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Snap waste items with AI analysis
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#dcfce7' }]}>
                <Text style={styles.featureEmoji}>🌱</Text>
              </View>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Track your environmental impact
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#fef3c7' }]}>
                <Text style={styles.featureEmoji}>🎁</Text>
              </View>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Earn rewards for sustainable choices
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View style={[styles.buttonContainer, contentAnimatedStyle]}>
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
                Start Snapping Waste
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: height * 0.03,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Math.min(height * 0.25, 180),
    position: 'relative',
  },
  checkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  checkGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 16,
    right: 32,
  },
  sparkle2: {
    bottom: 24,
    left: 24,
  },
  sparkle3: {
    top: 48,
    left: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.min(width * 0.08, 32),
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: Math.min(width * 0.1, 38),
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: height * 0.04,
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: height * 0.04,
  },
  getStartedButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});