import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WasteGoal } from '@/types/waste';
import { Target, TrendingDown, Recycle, Leaf } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface GoalCardProps {
  goal: WasteGoal;
}

const goalIcons = {
  reduce: <TrendingDown size={18} color="#ef4444" strokeWidth={1.5} />,
  recycle: <Recycle size={18} color="#16a34a" strokeWidth={1.5} />,
  compost: <Leaf size={18} color="#ea580c" strokeWidth={1.5} />,
};

const goalColors = {
  reduce: '#ef4444',
  recycle: '#16a34a',
  compost: '#ea580c',
};

export function GoalCard({ goal }: GoalCardProps) {
  const { theme } = useTheme();
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = goal.current >= goal.target;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceElevated]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {goalIcons[goal.type]}
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
              </Text>
            </View>
            <Text style={[styles.period, { color: theme.colors.textSecondary }]}>{goal.period}</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <LinearGradient
                colors={[goalColors[goal.type], goalColors[goal.type]]}
                style={[styles.progressFill, { width: `${progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.text }]}>
              {Math.round(progress)}%
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.current, { color: theme.colors.textSecondary }]}>
              {goal.current}{goal.type === 'reduce' ? 'g' : '%'} / {goal.target}{goal.type === 'reduce' ? 'g' : '%'}
            </Text>
            {isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Target size={12} color={theme.colors.success} strokeWidth={1.5} />
                <Text style={[styles.completedText, { color: theme.colors.success }]}>Completed!</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  period: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    minWidth: 40,
    textAlign: 'right',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  current: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});