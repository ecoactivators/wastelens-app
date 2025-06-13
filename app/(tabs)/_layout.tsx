import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { House, Gift, Settings, Plus, Zap } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopWidth: 0,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            paddingTop: 16,
            height: Platform.OS === 'ios' ? 100 : 80,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            shadowColor: theme.colors.shadow,
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            paddingLeft: 24,
            paddingRight: 24,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 10,
            marginTop: 4,
            letterSpacing: 0.5,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
          tabBarItemStyle: {
            paddingHorizontal: 8,
            flex: 1,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <House size={20} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="activate"
          options={{
            title: 'Activate',
            tabBarIcon: ({ size, color }) => (
              <Zap size={20} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            href: null, // Hide this tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Rewards',
            tabBarIcon: ({ size, color }) => (
              <Gift size={20} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={20} color={color} strokeWidth={1.5} />
            ),
          }}
        />
      </Tabs>

      {/* Premium Floating Camera Button */}
      <View style={styles.floatingButtonContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#000000']}
          style={styles.floatingButtonGradient}
        >
          <TouchableOpacity
            style={styles.floatingCameraButton}
            onPress={() => router.push('/camera')}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 66 : 50,
    left: '50%',
    marginLeft: -28,
    borderRadius: 28,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingButtonGradient: {
    borderRadius: 28,
    padding: 2,
  },
  floatingCameraButton: {
    width: 56,
    height: 56,
    borderRadius: 26,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
});