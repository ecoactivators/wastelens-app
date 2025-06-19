import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
              <CheckCircle size={64} color="#ffffff" strokeWidth={2} />
            </LinearGradient>
          </Animated.View>

          {/* Sparkles */}
          <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleAnimatedStyle]}>
            <Sparkles size={20} color={theme.colors.warning} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle2, sparkleAnimatedStyle]}>
            <Sparkles size={16} color={theme.colors.primary} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleAnimatedStyle]}>
            <Sparkles size={18} color={theme.colors.accent} />
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
    height: 200,
    position: 'relative',
  },
  checkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
    top: 20,
    right: 40,
  },
  sparkle2: {
    bottom: 30,
    left: 30,
  },
  sparkle3: {
    top: 60,
    left: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  getStartedButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
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
  },
});