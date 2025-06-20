import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { WasteCard } from '@/components/WasteCard';
import { QuestCard } from '@/components/QuestCard';
import { Zap, Target, Award, TrendingUp, Calendar, Flame, Trophy, Star, Gift, Bell, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Quest, UserPoints } from '@/types/rewards';
import { PointsService } from '@/services/points';

export default function ActivateScreen() {
  const { stats, loading, recentItems, refreshData } = useItems();
  const { theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints>({
    totalEarned: 0,
    currentBalance: 0,
    totalSpent: 0,
    lifetimeRank: 'Eco Beginner',
    weeklyEarned: 0,
    monthlyEarned: 0
  });

  // Calculate user points and generate quests
  useEffect(() => {
    if (stats && recentItems) {
      // Calculate total points earned from all scans
      const totalPointsFromScans = recentItems.reduce((total, item) => {
        return total + PointsService.calculatePointsFromScan(item);
      }, 0);

      // Add streak bonus
      const streakBonus = PointsService.calculateStreakBonus(stats.streak);
      const totalEarned = totalPointsFromScans + streakBonus;

      // For demo purposes, assume no points spent yet
      const currentBalance = totalEarned;
      const lifetimeRank = PointsService.getUserRank(totalEarned);

      // Calculate weekly/monthly earnings (simplified)
      const weeklyEarned = Math.floor(totalEarned * 0.3); // Assume 30% earned this week
      const monthlyEarned = Math.floor(totalEarned * 0.7); // Assume 70% earned this month

      setUserPoints({
        totalEarned,
        currentBalance,
        totalSpent: 0,
        lifetimeRank,
        weeklyEarned,
        monthlyEarned
      });

      // Generate quests based on current stats
      const userStatsForQuests = {
        todayScans: recentItems.filter(item => {
          const today = new Date();
          const itemDate = new Date(item.timestamp);
          return itemDate.toDateString() === today.toDateString();
        }).length,
        todayRecyclable: recentItems.filter(item => {
          const today = new Date();
          const itemDate = new Date(item.timestamp);
          return itemDate.toDateString() === today.toDateString() && item.recyclable;
        }).length,
        todayWeight: recentItems.filter(item => {
          const today = new Date();
          const itemDate = new Date(item.timestamp);
          return itemDate.toDateString() === today.toDateString();
        }).reduce((sum, item) => sum + item.weight, 0),
        streak: stats.streak,
        totalScans: recentItems.length,
        totalWeight: stats.totalWeight,
        weeklyWasteTypes: new Set(recentItems.map(item => item.type)).size,
        weeklyAvgEnvScore: recentItems.reduce((sum, item) => {
          return sum + (item.aiAnalysis?.environmentScore || 5);
        }, 0) / Math.max(recentItems.length, 1)
      };

      const dailyQuests = PointsService.generateDailyQuests(userStatsForQuests);
      const weeklyQuests = PointsService.generateWeeklyQuests(userStatsForQuests);
      const milestoneQuests = PointsService.generateMilestoneQuests(userStatsForQuests);

      setQuests([...dailyQuests, ...weeklyQuests, ...milestoneQuests]);
    }
  }, [stats, recentItems]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshData]);

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

  const completedQuests = quests.filter(q => q.completed).length;

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>Activate</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Complete quests and earn rewards
              </Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: theme.colors.primaryLight }]}>
              <Flame size={20} color={theme.colors.primary} />
              <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                {stats.streak} day streak
              </Text>
            </View>
          </View>

          {/* Points Overview */}
          <View style={[styles.pointsOverview, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.surface, theme.colors.surfaceElevated]}
              style={styles.pointsGradient}
            >
              <View style={styles.pointsContent}>
                <View style={styles.pointsHeader}>
                  <View style={[styles.pointsIcon, { backgroundColor: '#fef3c7' }]}>
                    <Star size={24} color="#f59e0b" fill="#f59e0b" />
                  </View>
                  <View style={styles.pointsInfo}>
                    <Text style={[styles.pointsBalance, { color: theme.colors.text }]}>
                      {userPoints.currentBalance}
                    </Text>
                    <Text style={[styles.pointsLabel, { color: theme.colors.textSecondary }]}>
                      Available Points
                    </Text>
                  </View>
                  <View style={styles.rankBadge}>
                    <Text style={[styles.rankText, { color: theme.colors.primary }]}>
                      {userPoints.lifetimeRank}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.pointsStats}>
                  <View style={styles.pointsStat}>
                    <Text style={[styles.pointsStatValue, { color: theme.colors.text }]}>
                      +{userPoints.weeklyEarned}
                    </Text>
                    <Text style={[styles.pointsStatLabel, { color: theme.colors.textSecondary }]}>
                      This Week
                    </Text>
                  </View>
                  <View style={styles.pointsStat}>
                    <Text style={[styles.pointsStatValue, { color: theme.colors.text }]}>
                      {userPoints.totalEarned}
                    </Text>
                    <Text style={[styles.pointsStatLabel, { color: theme.colors.textSecondary }]}>
                      Lifetime
                    </Text>
                  </View>
                  <View style={styles.pointsStat}>
                    <Text style={[styles.pointsStatValue, { color: theme.colors.text }]}>
                      {completedQuests}
                    </Text>
                    <Text style={[styles.pointsStatLabel, { color: theme.colors.textSecondary }]}>
                      Completed
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="Quests"
              value={`${completedQuests}/${quests.length}`}
              subtitle="Completed today"
              color={theme.colors.primary}
              icon={<Target size={20} color={theme.colors.primary} />}
            />
            <StatsCard
              title="Points Earned"
              value={`+${userPoints.weeklyEarned}`}
              subtitle="This week"
              color="#f59e0b"
              icon={<Star size={20} color="#f59e0b" />}
            />
          </View>

          {/* Active Quests */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Quests</Text>
              <View style={[styles.questCountBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.questCount, { color: theme.colors.primary }]}>
                  {quests.filter(q => !q.completed).length}
                </Text>
              </View>
            </View>
            
            {quests.length > 0 ? (
              quests.map(quest => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest}
                  onPress={() => {
                    // Could navigate to quest detail or show tips
                    console.log('Quest pressed:', quest.title);
                  }}
                />
              ))
            ) : (
              <View style={[styles.emptyQuests, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.emptyQuestsText, { color: theme.colors.textSecondary }]}>
                  No active quests. Start scanning to unlock new challenges!
                </Text>
              </View>
            )}
          </View>

          {/* Recently Snapped Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recently Snapped</Text>
              {recentItems.length > 0 && (
                <View style={[styles.entryCountBadge, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={[styles.entryCount, { color: theme.colors.primary }]}>
                    {recentItems.length}
                  </Text>
                </View>
              )}
            </View>
            
            {recentItems.length > 0 ? (
              <>
                {recentItems.slice(0, 3).map(item => {
                  const pointsEarned = PointsService.calculatePointsFromScan(item);
                  return (
                    <View key={item.id} style={styles.itemWithPoints}>
                      <WasteCard entry={item} />
                      <View style={[styles.pointsEarned, { backgroundColor: '#fef3c7' }]}>
                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                        <Text style={[styles.pointsEarnedText, { color: '#92400e' }]}>
                          +{pointsEarned} points
                        </Text>
                      </View>
                    </View>
                  );
                })}
                {recentItems.length > 3 && (
                  <TouchableOpacity 
                    style={[styles.viewAllButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => router.push('/items')}
                  >
                    <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                      View all {recentItems.length} items
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                  No items snapped yet. Start by snapping an item!
                </Text>
                <TouchableOpacity
                  style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push('/camera')}
                >
                  <Plus size={20} color="#ffffff" />
                  <Text style={styles.scanButtonText}>Snap Item</Text>
                </TouchableOpacity>
              </View>
            )}
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
                      Quest Notifications
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                      Get notified about new quests and completions
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
                      Remind me to complete daily quests
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
  
  // Points Overview
  pointsOverview: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
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
  pointsGradient: {
    flex: 1,
  },
  pointsContent: {
    padding: 20,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsBalance: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 4,
  },
  pointsLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  rankBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  pointsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointsStat: {
    alignItems: 'center',
  },
  pointsStatValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  pointsStatLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
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
  questCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  questCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  emptyQuests: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyQuestsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Items with points
  itemWithPoints: {
    position: 'relative',
    marginBottom: 16,
  },
  pointsEarned: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsEarnedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  
  entryCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  entryCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  viewAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scanButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
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
});