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
  compact?: boolean;
}

export function StatsCard({ title, value, subtitle, color, icon, compact = false }: StatsCardProps) {
  const { theme } = useTheme();
  const valueColor = color || theme.colors.primary;

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: '#ffffff' }]}>
        <View style={styles.compactHeader}>
          {icon && <View style={styles.compactIconContainer}>{icon}</View>}
          <Text style={[styles.compactTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
        </View>
        <Text style={[styles.compactValue, { color: valueColor }]}>{value}</Text>
        {subtitle && <Text style={[styles.compactSubtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
        </View>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  // Compact styles
  compactContainer: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactIconContainer: {
    marginRight: 6,
  },
  compactTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  compactValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 2,
  },
  compactSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
});