import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WasteGoal } from '@/types/waste';
import { Target, TrendingDown, Recycle, Leaf, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GoalCardProps {
  goal: WasteGoal;
}

const goalIcons = {
  reduce: <TrendingDown size={20} color="#ef4444" />,
  recycle: <Recycle size={20} color="#10b981" />,
  compost: <Leaf size={20} color="#f59e0b" />,
};

const goalColors = {
  reduce: '#ef4444',
  recycle: '#10b981',
  compost: '#f59e0b',
};

const goalGradients = {
  reduce: ['#fef2f2', '#fee2e2'],
  recycle: ['#f0fdf4', '#dcfce7'],
  compost: ['#fffbeb', '#fef3c7'],
};

export function GoalCard({ goal }: GoalCardProps) {
  const { theme } = useTheme();
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = goal.current >= goal.target;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={goalGradients[goal.type]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${goalColors[goal.type]}20` }]}>
                {goalIcons[goal.type]}
              </View>
              <View style={styles.titleText}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
                </Text>
                <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
                  {goal.period}
                </Text>
              </View>
            </View>
            {isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: goalColors[goal.type] }]}>
                <CheckCircle size={16} color="#ffffff" />
              </View>
            )}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: `${goalColors[goal.type]}20` }]}>
                <LinearGradient
                  colors={[goalColors[goal.type], `${goalColors[goal.type]}CC`]}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={[styles.progressText, { color: goalColors[goal.type] }]}>
                {Math.round(progress)}%
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.current, { color: theme.colors.textSecondary }]}>
                {goal.current}{goal.type === 'reduce' ? 'g' : '%'} of {goal.target}{goal.type === 'reduce' ? 'g' : '%'}
              </Text>
              {isCompleted && (
                <Text style={[styles.completedText, { color: goalColors[goal.type] }]}>
                  Completed!
                </Text>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
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
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 2,
  },
  period: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    gap: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    minWidth: 45,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  current: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  completedText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
});