import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Quest } from '@/types/rewards';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Star, CircleCheck as CheckCircle } from 'lucide-react-native';

interface QuestCardProps {
  quest: Quest;
  onPress?: () => void;
}

export function QuestCard({ quest, onPress }: QuestCardProps) {
  const { theme } = useTheme();
  
  const progressPercentage = Math.min((quest.progress / quest.target) * 100, 100);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return theme.colors.textSecondary;
    }
  };
  
  const getTimeRemaining = () => {
    if (!quest.expiresAt) return null;
    
    const now = new Date();
    const timeLeft = quest.expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    if (hours < 24) {
      return `${hours}h left`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={quest.completed}
    >
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceElevated]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.questInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.emoji}>{quest.icon}</Text>
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, { color: theme.colors.text }]}>
                    {quest.title}
                  </Text>
                  <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    {quest.description}
                  </Text>
                </View>
              </View>
              
              <View style={styles.badges}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quest.difficulty) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(quest.difficulty) }]}>
                    {quest.difficulty.toUpperCase()}
                  </Text>
                </View>
                
                <View style={[styles.typeBadge, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={[styles.typeText, { color: theme.colors.primary }]}>
                    {quest.type.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.reward}>
              <View style={styles.pointsContainer}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <Text style={[styles.points, { color: theme.colors.text }]}>
                  +{quest.pointsReward}
                </Text>
              </View>
              
              {quest.expiresAt && (
                <View style={styles.timeContainer}>
                  <Clock size={12} color={theme.colors.textTertiary} />
                  <Text style={[styles.timeText, { color: theme.colors.textTertiary }]}>
                    {getTimeRemaining()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                Progress: {quest.progress}/{quest.target}
              </Text>
              <Text style={[styles.progressPercentage, { color: quest.completed ? '#10b981' : theme.colors.primary }]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <LinearGradient
                colors={quest.completed ? ['#10b981', '#059669'] : [quest.color, quest.color]}
                style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
          
          {/* Completion Status */}
          {quest.completed && (
            <View style={styles.completedSection}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={[styles.completedText, { color: '#10b981' }]}>
                Quest Completed! Points awarded.
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questInfo: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  reward: {
    alignItems: 'flex-end',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  points: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  progressPercentage: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    letterSpacing: 0.1,
  },
});