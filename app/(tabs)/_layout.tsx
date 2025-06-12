import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { House, Gift, Settings, Plus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingBottom: Platform.OS === 'ios' ? 35 : 25,
            paddingTop: 20,
            height: Platform.OS === 'ios' ? 110 : 90,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            shadowOpacity: 0,
            paddingLeft: 30, // Increased for better spacing
            paddingRight: 140, // More space for plus button
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 12,
            marginTop: 6,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarItemStyle: {
            paddingHorizontal: 8, // Add horizontal padding to each tab item for better spacing
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <House size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Rewards',
            tabBarIcon: ({ size, color }) => (
              <Gift size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            href: null, // Hide this tab from the tab bar
          }}
        />
      </Tabs>

      {/* Floating Camera Button - Positioned within tab bar area */}
      <TouchableOpacity
        style={[styles.floatingCameraButton, { backgroundColor: '#2d3748' }]}
        onPress={() => router.push('/camera')}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingCameraButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 75 : 55, // Positioned within the tab bar area
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
});