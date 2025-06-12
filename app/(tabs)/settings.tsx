import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { User, Settings as SettingsIcon, Bell, Shield, CircleHelp as HelpCircle, Star, Share2, Award, Target, TrendingUp, Recycle, Leaf, ChevronRight, Moon, Globe, Trash2, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const { stats, loading, clearAllData } = useItems();
  const { theme, toggleTheme, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [dataSharing, setDataSharing] = React.useState(false);

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#a855f7']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <Sparkles size={32} color="#ffffff" />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your scanned items and reset your goals. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All data has been cleared.');
          }
        }
      ]
    );
  };

  const accountItems = [
    {
      icon: <User size={20} color={theme.colors.textSecondary} />,
      title: 'Profile',
      subtitle: 'Edit your personal information',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Target size={20} color={theme.colors.textSecondary} />,
      title: 'Goals',
      subtitle: 'Set and manage your waste goals',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Award size={20} color={theme.colors.textSecondary} />,
      title: 'Achievements',
      subtitle: 'View your progress and badges',
      onPress: () => {},
      showChevron: true,
    },
  ];

  const appItems = [
    {
      icon: <Bell size={20} color={theme.colors.textSecondary} />,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => {},
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled,
    },
    {
      icon: <Moon size={20} color={theme.colors.textSecondary} />,
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark themes',
      onPress: toggleTheme,
      hasSwitch: true,
      switchValue: isDark,
      onSwitchChange: toggleTheme,
    },
    {
      icon: <Globe size={20} color={theme.colors.textSecondary} />,
      title: 'Language',
      subtitle: 'English',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Shield size={20} color={theme.colors.textSecondary} />,
      title: 'Privacy',
      subtitle: 'Data sharing and privacy settings',
      onPress: () => {},
      hasSwitch: true,
      switchValue: dataSharing,
      onSwitchChange: setDataSharing,
    },
  ];

  const supportItems = [
    {
      icon: <HelpCircle size={20} color={theme.colors.textSecondary} />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Star size={20} color={theme.colors.textSecondary} />,
      title: 'Rate App',
      subtitle: 'Rate WasteLens on the App Store',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Share2 size={20} color={theme.colors.textSecondary} />,
      title: 'Share App',
      subtitle: 'Share WasteLens with friends',
      onPress: () => {},
      showChevron: true,
    },
  ];

  const dangerItems = [
    {
      icon: <Trash2 size={20} color="#ef4444" />,
      title: 'Clear All Data',
      subtitle: 'Delete all your waste entries',
      onPress: handleClearAllData,
      showChevron: true,
      danger: true,
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.menuItemGradient}
      >
        <View style={styles.menuItemLeft}>
          <View style={[
            styles.menuItemIcon, 
            { backgroundColor: theme.colors.background },
            item.danger && styles.dangerIcon
          ]}>
            {item.icon}
          </View>
          <View style={styles.menuItemContent}>
            <Text style={[
              styles.menuItemTitle, 
              { color: theme.colors.text },
              item.danger && styles.dangerText
            ]}>
              {item.title}
            </Text>
            <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={styles.menuItemRight}>
          {item.hasSwitch && (
            <Switch
              value={item.switchValue}
              onValueChange={item.onSwitchChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={item.switchValue ? theme.colors.primary : '#ffffff'}
            />
          )}
          {item.showChevron && (
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#a855f7']}
        style={styles.gradientBackground}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.logoGradient}
                >
                  <SettingsIcon size={24} color="#ffffff" />
                </LinearGradient>
                <View style={styles.titleText}>
                  <Text style={styles.title}>Settings</Text>
                  <Text style={styles.subtitle}>Customize your experience</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Profile Card */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.profileCard}
            >
              <View style={styles.profileContainer}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.avatar}
                >
                  <User size={32} color="#ffffff" />
                </LinearGradient>
                <View style={styles.profileInfo}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>Eco Warrior</Text>
                  <Text style={[styles.email, { color: theme.colors.textSecondary }]}>eco.warrior@example.com</Text>
                </View>
                <View style={styles.achievementBadge}>
                  <Award size={16} color="#f59e0b" />
                  <Text style={styles.achievementText}>Level 3</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="Total Tracked"
              value={`${stats.totalWeight}g`}
              subtitle="All time"
              icon={<TrendingUp size={18} color={theme.colors.textSecondary} />}
              compact
            />
            <StatsCard
              title="CO₂ Saved"
              value={`${stats.co2Saved.toFixed(1)}kg`}
              subtitle="This month"
              color={theme.colors.success}
              icon={<Leaf size={18} color={theme.colors.success} />}
              compact
            />
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuGroup}>
              {accountItems.map(renderMenuItem)}
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.menuGroup}>
              {appItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.menuGroup}>
              {supportItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <View style={styles.menuGroup}>
              {dangerItems.map(renderMenuItem)}
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.appInfoCard}
            >
              <View style={styles.appInfo}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.appIcon}
                >
                  <Leaf size={24} color="#ffffff" />
                </LinearGradient>
                <Text style={[styles.appName, { color: theme.colors.text }]}>WasteLens</Text>
                <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>Version 1.0.0</Text>
                <Text style={[styles.appDescription, { color: theme.colors.textSecondary }]}>
                  Track your waste, reduce your impact, and help save the planet one entry at a time.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  achievementText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#f59e0b',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#ffffff',
  },
  menuGroup: {
    gap: 8,
  },
  menuItem: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#fef2f2',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  dangerText: {
    color: '#ef4444',
  },
  menuItemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  appInfo: {
    alignItems: 'center',
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  appVersion: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 12,
  },
  appDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 140,
  },
});