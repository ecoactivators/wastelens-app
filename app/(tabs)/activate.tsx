import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { 
  Zap, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Circle,
  Flame,
  Trophy,
  Star,
  Gift,
  Bell,
  Smartphone,
  Mail
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  type: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  icon: React.ReactNode;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
  color: string;
}

export default function ActivateScreen() {
  const { stats, loading } = useItems();
  const { theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);

  // Mock challenges data
  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Daily Scanner',
      description: 'Scan 3 items today',
      points: 50,
      progress: 1,
      target: 3,
      type: 'daily',
      completed: false,
      icon: <Zap size={20} color="#f59e0b" />,
      color: '#f59e0b'
    },
    {
      id: '2',
      title: 'Recycling Hero',
      description: 'Recycle 5 items this week',
      points: 200,
      progress: 3,
      target: 5,
      type: 'weekly',
      completed: false,
      icon: <Target size={20} color="#10b981" />,
      color: '#10b981'
    },
    {
      id: '3',
      title: 'Waste Warrior',
      description: 'Track 100g of waste this month',
      points: 500,
      progress: 75,
      target: 100,
      type: 'monthly',
      completed: false,
      icon: <Trophy size={20} color="#3b82f6" />,
      color: '#3b82f6'
    },
    {
      id: '4',
      title: 'Perfect Day',
      description: 'Complete all daily tasks',
      points: 100,
      progress: 2,
      target: 3,
      type: 'daily',
      completed: false,
      icon: <Star size={20} color="#8b5cf6" />,
      color: '#8b5cf6'
    }
  ];

  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Scan',
      description: 'Scanned your first waste item',
      icon: <Zap size={24} color="#f59e0b" />,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: '#f59e0b'
    },
    {
      id: '2',
      title: 'Eco Beginner',
      description: 'Tracked 10 items',
      icon: <Flame size={24} color="#10b981" />,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      color: '#10b981'
    },
    {
      id: '3',
      title: 'Recycling Champion',
      description: 'Achieve 80% recycling rate',
      icon: <Award size={24} color="#3b82f6" />,
      unlocked: false,
      color: '#3b82f6'
    },
    {
      id: '4',
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: <Trophy size={24} color="#8b5cf6" />,
      unlocked: false,
      color: '#8b5cf6'
    }
  ];

  if (loading || !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={['#e5e7eb', '#f9fafb', '#ffffff']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  const formatTimeRemaining = (type: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    switch (type) {
      case 'daily':
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const hoursLeft = Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));
        return `${hoursLeft}h left`;
      case 'weekly':
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        const daysLeft = Math.ceil((endOfWeek.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `${daysLeft}d left`;
      case 'monthly':
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthDaysLeft = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `${monthDaysLeft}d left`;
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#e5e7eb', '#f9fafb', '#ffffff']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>Activate</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Complete challenges and unlock achievements
              </Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: theme.colors.primaryLight }]}>
              <Flame size={20} color={theme.colors.primary} />
              <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                {stats.streak} day streak
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="Challenges"
              value={`${completedChallenges}/${challenges.length}`}
              subtitle="Completed today"
              color={theme.colors.primary}
              icon={<Target size={20} color={theme.colors.primary} />}
            />
            <StatsCard
              title="Points Earned"
              value={`${totalPoints}`}
              subtitle="This week"
              color="#f59e0b"
              icon={<Star size={20} color="#f59e0b" />}
            />
          </View>

          {/* Active Challenges */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Challenges</Text>
            {challenges.map(challenge => (
              <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeInfo}>
                    <View style={styles.challengeTitleRow}>
                      <View style={[styles.challengeIcon, { backgroundColor: challenge.color + '20' }]}>
                        {challenge.icon}
                      </View>
                      <View style={styles.challengeDetails}>
                        <Text style={[styles.challengeTitle, { color: theme.colors.text }]}>
                          {challenge.title}
                        </Text>
                        <Text style={[styles.challengeDescription, { color: theme.colors.textSecondary }]}>
                          {challenge.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.challengeReward}>
                    <Text style={[styles.challengePoints, { color: challenge.color }]}>
                      +{challenge.points}
                    </Text>
                    <Text style={[styles.challengeTime, { color: theme.colors.textTertiary }]}>
                      {formatTimeRemaining(challenge.type)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                          backgroundColor: challenge.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                    {challenge.progress}/{challenge.target}
                  </Text>
                </View>

                {challenge.completed && (
                  <View style={styles.completedBadge}>
                    <CheckCircle size={16} color={theme.colors.success} />
                    <Text style={[styles.completedText, { color: theme.colors.success }]}>
                      Completed!
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
              <Text style={[styles.achievementCount, { color: theme.colors.textSecondary }]}>
                {unlockedAchievements}/{achievements.length} unlocked
              </Text>
            </View>
            
            <View style={styles.achievementsGrid}>
              {achievements.map(achievement => (
                <View 
                  key={achievement.id} 
                  style={[
                    styles.achievementCard, 
                    { backgroundColor: theme.colors.surface },
                    !achievement.unlocked && styles.lockedAchievement
                  ]}
                >
                  <View style={[
                    styles.achievementIcon, 
                    { backgroundColor: achievement.color + '20' },
                    !achievement.unlocked && styles.lockedIcon
                  ]}>
                    {achievement.icon}
                  </View>
                  <Text style={[
                    styles.achievementTitle, 
                    { color: achievement.unlocked ? theme.colors.text : theme.colors.textTertiary }
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription, 
                    { color: achievement.unlocked ? theme.colors.textSecondary : theme.colors.textTertiary }
                  ]}>
                    {achievement.description}
                  </Text>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <Text style={[styles.unlockedDate, { color: theme.colors.textTertiary }]}>
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Notifications Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
            
            <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Bell size={20} color={theme.colors.textSecondary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                      Challenge Notifications
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                      Get notified about new challenges
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={notificationsEnabled ? theme.colors.primary : '#ffffff'}
                />
              </View>
            </View>

            <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Calendar size={20} color={theme.colors.textSecondary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                      Daily Reminders
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                      Remind me to track waste daily
                    </Text>
                  </View>
                </View>
                <Switch
                  value={dailyReminders}
                  onValueChange={setDailyReminders}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={dailyReminders ? theme.colors.primary : '#ffffff'}
                />
              </View>
            </View>
          </View>

          {/* Motivational Quote */}
          <View style={styles.section}>
            <View style={[styles.quoteCard, { backgroundColor: theme.colors.surface }]}>
              <LinearGradient
                colors={[theme.colors.primary + '20', theme.colors.primary + '10']}
                style={styles.quoteGradient}
              >
                <Text style={[styles.quote, { color: theme.colors.text }]}>
                  "Every small action towards sustainability creates a ripple effect of positive change."
                </Text>
                <Text style={[styles.quoteAuthor, { color: theme.colors.textSecondary }]}>
                  — WasteLens Team
                </Text>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  streakText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  achievementCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  challengeCard: {
    borderRadius: 16,
    padding: 20,
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
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeDetails: {
    flex: 1,
  },
  challengeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  challengeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  challengeReward: {
    alignItems: 'flex-end',
  },
  challengePoints: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  challengeTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
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
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  unlockedDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    textAlign: 'center',
  },
  settingCard: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  quoteCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteGradient: {
    padding: 24,
  },
  quote: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});