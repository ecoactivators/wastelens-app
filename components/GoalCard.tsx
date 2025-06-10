import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WasteGoal } from '@/types/waste';
import { Target, TrendingDown, Recycle, Leaf } from 'lucide-react-native';

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

export function GoalCard({ goal }: GoalCardProps) {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = goal.current >= goal.target;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {goalIcons[goal.type]}
          <Text style={styles.title}>
            {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
          </Text>
        </View>
        <Text style={styles.period}>{goal.period}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: goalColors[goal.type],
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress)}%
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.current}>
          {goal.current}{goal.type === 'reduce' ? 'g' : '%'} / {goal.target}{goal.type === 'reduce' ? 'g' : '%'}
        </Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Target size={12} color="#10b981" />
            <Text style={styles.completedText}>Completed!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    gap: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  period: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#111827',
    minWidth: 40,
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
    color: '#6b7280',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#10b981',
  },
});