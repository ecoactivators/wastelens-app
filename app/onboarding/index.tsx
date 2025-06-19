import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
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
              <View style={styles.statusBar}>
                <Text style={styles.time}>9:41</Text>
                <View style={styles.statusIcons}>
                  <View style={styles.signal} />
                  <View style={styles.wifi} />
                  <View style={styles.battery} />
                </View>
              </View>
              
              <View style={styles.appContent}>
                <Text style={styles.appTitle}>Waste Lens</Text>
                <Text style={styles.appSubtitle}>Today</Text>
                
                {/* Main Stats */}
                <View style={styles.mainStat}>
                  <Text style={styles.mainNumber}>247g</Text>
                  <Text style={styles.mainLabel}>Waste tracked</Text>
                  <View style={styles.progressRing}>
                    <View style={[styles.progressFill, { backgroundColor: theme.colors.primary }]} />
                  </View>
                </View>
                
                {/* Secondary Stats */}
                <View style={styles.secondaryStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>85%</Text>
                    <Text style={styles.statLabel}>Recycled</Text>
                    <View style={[styles.miniProgress, { backgroundColor: '#10b981' }]} />
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>15%</Text>
                    <Text style={styles.statLabel}>Composted</Text>
                    <View style={[styles.miniProgress, { backgroundColor: '#f59e0b' }]} />
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>0%</Text>
                    <Text style={styles.statLabel}>Landfill</Text>
                    <View style={[styles.miniProgress, { backgroundColor: '#ef4444' }]} />
                  </View>
                </View>
                
                {/* Recent Item */}
                <View style={styles.recentSection}>
                  <Text style={styles.recentTitle}>Recently snapped</Text>
                  <View style={styles.recentItem}>
                    <Image 
                      source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
                      style={styles.recentImage}
                    />
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName}>Apple Core</Text>
                      <Text style={styles.recentDetails}>🏠 25g • Compostable</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Tab Bar */}
              <View style={styles.tabBar}>
                <View style={styles.tabItem}>
                  <View style={[styles.tabIcon, { backgroundColor: theme.colors.primary }]} />
                </View>
                <View style={styles.tabItem}>
                  <View style={styles.tabIcon} />
                </View>
                <View style={styles.tabItem}>
                  <View style={styles.tabIcon} />
                </View>
                <View style={[styles.floatingButton, { backgroundColor: theme.colors.text }]}>
                  <Text style={[styles.plusIcon, { color: theme.colors.surface }]}>+</Text>
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
            onPress={() => router.push('/onboarding/welcome')}
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
    paddingHorizontal: 24,
  },
  phoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: height * 0.05,
  },
  phoneMockup: {
    width: Math.min(width * 0.65, 280),
    height: Math.min(width * 0.65 * 2, 560),
    borderRadius: 36,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  time: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 3,
  },
  signal: {
    width: 14,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  wifi: {
    width: 12,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  battery: {
    width: 20,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  appContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  appTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 2,
  },
  appSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  mainNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#000',
    marginBottom: 2,
  },
  mainLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  progressRing: {
    position: 'absolute',
    top: -16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  progressFill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 8,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },
  miniProgress: {
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  recentSection: {
    marginBottom: 16,
  },
  recentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
  },
  recentImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#000',
    marginBottom: 1,
  },
  recentDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  plusIcon: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  content: {
    paddingVertical: height * 0.04,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.min(width * 0.08, 32),
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: Math.min(width * 0.1, 40),
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingBottom: height * 0.05,
  },
  getStartedButton: {
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
});