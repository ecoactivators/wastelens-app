import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWasteData } from '@/hooks/useWasteData';
import { StatsCard } from '@/components/StatsCard';
import { User, Settings as SettingsIcon, Bell, Shield, CircleHelp as HelpCircle, Star, Share2, Award, Target, TrendingUp, Recycle, Leaf, ChevronRight, Moon, Globe, Trash2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const { stats, loading } = useWasteData();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [dataSharing, setDataSharing] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const accountItems = [
    {
      icon: <User size={20} color="#6b7280" />,
      title: 'Profile',
      subtitle: 'Edit your personal information',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Target size={20} color="#6b7280" />,
      title: 'Goals',
      subtitle: 'Set and manage your waste goals',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Award size={20} color="#6b7280" />,
      title: 'Achievements',
      subtitle: 'View your progress and badges',
      onPress: () => {},
      showChevron: true,
    },
  ];

  const appItems = [
    {
      icon: <Bell size={20} color="#6b7280" />,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => {},
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled,
    },
    {
      icon: <Moon size={20} color="#6b7280" />,
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark themes',
      onPress: () => {},
      hasSwitch: true,
      switchValue: darkMode,
      onSwitchChange: setDarkMode,
    },
    {
      icon: <Globe size={20} color="#6b7280" />,
      title: 'Language',
      subtitle: 'English',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Shield size={20} color="#6b7280" />,
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
      icon: <HelpCircle size={20} color="#6b7280" />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Star size={20} color="#6b7280" />,
      title: 'Rate App',
      subtitle: 'Rate WasteLens on the App Store',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Share2 size={20} color="#6b7280" />,
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
      onPress: () => {},
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
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, item.danger && styles.dangerIcon]}>
          {item.icon}
        </View>
        <View style={styles.menuItemContent}>
          <Text style={[styles.menuItemTitle, item.danger && styles.dangerText]}>
            {item.title}
          </Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.hasSwitch && (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
            thumbColor={item.switchValue ? '#10b981' : '#ffffff'}
          />
        )}
        {item.showChevron && (
          <ChevronRight size={16} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <User size={32} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>Eco Warrior</Text>
              <Text style={styles.email}>eco.warrior@example.com</Text>
            </View>
          </View>
        </View>

        {/* Achievement Badge */}
        <View style={styles.section}>
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Award size={24} color="#f59e0b" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Waste Reduction Champion</Text>
              <Text style={styles.achievementSubtitle}>
                {stats.streak} day streak • Level 3
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Tracked"
            value={`${stats.totalWeight}g`}
            subtitle="All time"
            icon={<TrendingUp size={20} color="#6b7280" />}
          />
          <StatsCard
            title="CO₂ Saved"
            value={`${stats.co2Saved.toFixed(1)}kg`}
            subtitle="This month"
            color="#10b981"
            icon={<Leaf size={20} color="#10b981" />}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {accountItems.map(renderMenuItem)}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          {appItems.map(renderMenuItem)}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportItems.map(renderMenuItem)}
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          {dangerItems.map(renderMenuItem)}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>WasteLens</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Track your waste, reduce your impact, and help save the planet one entry at a time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
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
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  achievementSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#f9fafb',
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
    color: '#111827',
    marginBottom: 2,
  },
  dangerText: {
    color: '#ef4444',
  },
  menuItemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  appVersion: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  appDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});