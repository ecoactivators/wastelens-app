import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, subtitle, color, icon }: StatsCardProps) {
  const { theme } = useTheme();
  const valueColor = color || theme.colors.primary;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: `${valueColor}15` }]}>
                {icon}
              </View>
            )}
            <Text style={[styles.title, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
          
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
              {value}
            </Text>
          </View>
          
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    flex: 1,
  },
  valueContainer: {
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});