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
        {/* Phone Mockup */}
        <View style={styles.phoneContainer}>
          <View style={[styles.phoneMockup, { backgroundColor: theme.colors.text }]}>
            <View style={styles.phoneScreen}>
              {/* Status Bar */}
              <View style={styles.statusBar}>
                <Text style={styles.time}>1:40</Text>
                <View style={styles.statusIcons}>
                  <View style={styles.signal} />
                  <View style={styles.wifi} />
                  <View style={styles.battery} />
                </View>
              </View>
              
              {/* Camera Interface */}
              <View style={styles.cameraContent}>
                {/* Top Controls */}
                <View style={styles.topControls}>
                  <View style={styles.backButton}>
                    <Text style={styles.backArrow}>‹</Text>
                  </View>
                  <View style={styles.flashButton}>
                    <Text style={styles.flashIcon}>⚡</Text>
                  </View>
                </View>

                {/* Plant Image Background */}
                <View style={styles.plantImageContainer}>
                  <View style={styles.plantPlaceholder}>
                    <Text style={styles.plantEmoji}>🌿</Text>
                  </View>
                </View>

                {/* Scan Frame */}
                <View style={styles.scanFrame}>
                  <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
                  <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
                </View>

                {/* Instruction Text */}
                <View style={styles.instructionContainer}>
                  <Text style={styles.instructionText}>Position the waste item within the frame</Text>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                  <View style={styles.galleryButton}>
                    <Text style={styles.galleryIcon}>🖼</Text>
                  </View>
                  <View style={styles.captureButton}>
                    <View style={styles.captureButtonInner} />
                  </View>
                  <View style={styles.homeButton}>
                    <Text style={styles.homeIcon}>🏠</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Waste tracking{'\n'}made easy
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Snap your waste, reduce your environmental impact, and earn rewards for sustainable choices.
          </Text>
        </View>

        {/* Get Started Button */}
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
  phoneContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.06,
  },
  phoneMockup: {
    width: Math.min(width * 0.55, 240),
    height: Math.min(width * 0.55 * 2.1, 500),
    borderRadius: 32,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 27,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  time: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  signal: {
    width: 12,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  wifi: {
    width: 10,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  battery: {
    width: 18,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  cameraContent: {
    flex: 1,
    position: 'relative',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
    zIndex: 2,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  flashButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  plantImageContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantPlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 60,
  },
  plantEmoji: {
    fontSize: 48,
  },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    right: '20%',
    bottom: '35%',
    zIndex: 1,
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  scanCornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  scanCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  instructionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIcon: {
    fontSize: 12,
  },
  captureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  captureButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
  },
  homeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIcon: {
    fontSize: 12,
  },
  content: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.min(width * 0.07, 28),
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: Math.min(width * 0.085, 34),
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flex: 0.15,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  getStartedButton: {
    borderRadius: 24,
    paddingVertical: 16,
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