import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Share, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { User, Settings as SettingsIcon, Bell, Shield, CircleHelp as HelpCircle, Star, Share2, TrendingUp, Leaf, ChevronRight, Moon, Trash2, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { stats, loading, clearAllData } = useItems();
  const { theme, toggleTheme, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [dataSharing, setDataSharing] = React.useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  if (loading || !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your snapped items and reset your goals. This action cannot be undone.',
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

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: 'Check out Waste Lens! Snap your waste, reduce your environmental impact, and earn rewards. Download it at wastelens.works',
        url: 'https://wastelens.works', // This will be included on iOS
        title: 'Waste Lens - Snap Your Waste, Reduce Your Impact'
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared via:', result.activityType);
        } else {
          // Shared
          console.log('App shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert('Error', 'Unable to share the app. Please try again.');
    }
  };

  const handleProfileImagePress = () => {
    setShowImageOptions(true);
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        setShowImageOptions(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo library to select an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        setShowImageOptions(false);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setShowImageOptions(false);
  };

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
      onPress: () => router.push('/help'),
      showChevron: true,
    },
    {
      icon: <Star size={20} color={theme.colors.textSecondary} />,
      title: 'Rate App',
      subtitle: 'Rate Waste Lens on the App Store',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Share2 size={20} color={theme.colors.textSecondary} />,
      title: 'Share App',
      subtitle: 'Share Waste Lens with friends',
      onPress: handleShareApp,
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
      style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
      onPress={item.onPress}
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <TouchableOpacity 
              style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}
              onPress={handleProfileImagePress}
              activeOpacity={0.8}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <User size={32} color="#ffffff" />
              )}
              <View style={[styles.cameraOverlay, { backgroundColor: theme.colors.primary }]}>
                <Camera size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: theme.colors.text }]}>Danielle Alexander</Text>
              <Text style={[styles.email, { color: theme.colors.textSecondary }]}>danielle@ecoactivators.com</Text>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Snapped"
            value={`${stats.totalWeight}g`}
            subtitle="All time"
            icon={<TrendingUp size={20} color={theme.colors.textSecondary} />}
          />
          <StatsCard
            title="Composting Rate"
            value={`${Math.round(stats.compostingRate)}%`}
            subtitle="Current rate"
            color={theme.colors.success}
            icon={<Leaf size={20} color={theme.colors.success} />}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App Settings</Text>
          {appItems.map(renderMenuItem)}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
          {supportItems.map(renderMenuItem)}
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Danger Zone</Text>
          {dangerItems.map(renderMenuItem)}
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowImageOptions(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Change Profile Picture</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Camera size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Take Photo</Text>
                <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                  Use your camera to take a new photo
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={handleChooseFromLibrary}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <ImageIcon size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Choose from Library</Text>
                <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                  Select an existing photo from your gallery
                </Text>
              </View>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={handleRemovePhoto}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#fee2e2' }]}>
                  <Trash2 size={24} color="#ef4444" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: '#ef4444' }]}>Remove Photo</Text>
                  <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                    Remove your current profile picture
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
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
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  menuItem: {
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
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});