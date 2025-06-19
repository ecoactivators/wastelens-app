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
    paddingTop: 60,
  },
  phoneMockup: {
    width: width * 0.7,
    height: width * 0.7 * 1.8,
    borderRadius: 40,
    padding: 8,
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
    borderRadius: 32,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  time: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  signal: {
    width: 18,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  wifi: {
    width: 16,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  battery: {
    width: 24,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  appContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  appTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  appSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  mainNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#000',
    marginBottom: 4,
  },
  mainLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  progressRing: {
    position: 'absolute',
    top: -20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  progressFill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  miniProgress: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  recentSection: {
    marginBottom: 20,
  },
  recentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
  },
  recentImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  recentDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIcon: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  content: {
    paddingVertical: 40,
    alignItems: 'center',
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
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingBottom: 40,
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