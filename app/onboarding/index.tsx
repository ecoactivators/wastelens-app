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
    backgroundColor: '#ffffff',
    borderRadius: 27,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  time: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  signal: {
    width: 12,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  wifi: {
    width: 10,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  battery: {
    width: 18,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  appContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  appTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 2,
  },
  appSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  mainNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000',
    marginBottom: 2,
  },
  mainLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#666',
  },
  progressRing: {
    position: 'absolute',
    top: -12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  progressFill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    margin: 6,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 8,
    color: '#666',
    marginBottom: 4,
  },
  miniProgress: {
    width: 28,
    height: 2,
    borderRadius: 1,
  },
  recentSection: {
    marginBottom: 12,
  },
  recentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#000',
    marginBottom: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
  },
  recentImage: {
    width: 28,
    height: 28,
    borderRadius: 5,
    marginRight: 8,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#000',
    marginBottom: 1,
  },
  recentDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 8,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  floatingButton: {
    position: 'absolute',
    right: 14,
    bottom: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  plusIcon: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
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