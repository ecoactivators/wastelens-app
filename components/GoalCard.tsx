import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WasteGoal } from '@/types/waste';
import { Target, TrendingDown, Recycle, Leaf, CircleCheck as CheckCircle } from 'lucide-react-native';
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

  const getGoalTitle = () => {
    switch (goal.type) {
      case 'reduce':
        return 'Waste Reduction';
      case 'recycle':
        return 'Recycling Rate';
      case 'compost':
        return 'Composting Goal';
      default:
        return goal.type.charAt(0).toUpperCase() + goal.type.slice(1);
    }
  };

  const getProgressText = () => {
    const unit = goal.type === 'reduce' ? 'g' : '%';
    return `${Math.round(goal.current)}${unit} / ${goal.target}${unit}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={goalGradients[goal.type]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconContainer, { backgroundColor: goalColors[goal.type] + '20' }]}>
              {goalIcons[goal.type]}
            </View>
            <View style={styles.titleText}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {getGoalTitle()}
              </Text>
              <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
                {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} goal
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
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <LinearGradient
                colors={[goalColors[goal.type], goalColors[goal.type] + 'CC']}
                style={[styles.progressFill, { width: `${progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={[styles.progressPercentage, { color: goalColors[goal.type] }]}>
              {Math.round(progress)}%
            </Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {getProgressText()}
            </Text>
            {isCompleted && (
              <Text style={[styles.completedText, { color: goalColors[goal.type] }]}>
                Goal achieved! 🎉
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  period: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
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
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    minWidth: 40,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  completedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});