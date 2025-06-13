import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceElevated]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
          </View>
          <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});