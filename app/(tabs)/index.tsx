import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { WasteCard } from '@/components/WasteCard';
import { StatsCard } from '@/components/StatsCard';
import { GoalCard } from '@/components/GoalCard';
import { Plus, Zap, Recycle, Leaf, TrendingDown, Sparkles, Target, Award } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { 
    recentItems, 
    goals, 
    stats, 
    loading, 
    refreshData
  } = useItems();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 [HomeScreen] Screen focused');
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshData]);

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#f3f4f6', '#e5e7eb', '#ffffff']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <Sparkles size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Analyzing your impact...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  console.log('🎨 [HomeScreen] Rendering with', recentItems.length, 'recent items');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f3f4f6', '#e5e7eb', '#ffffff']}
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
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* App Title */}
          <View style={styles.appHeader}>
            <Text style={styles.appTitle}>WasteLens</Text>
            <Text style={styles.appSubtitle}>Track • Reduce • Impact</Text>
          </View>

          {/* Environmental Impact Card */}
          <View style={styles.impactSection}>
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              style={styles.impactGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.impactHeader}>
                <Text style={styles.impactTitle}>Your Environmental Impact</Text>
                <View style={styles.impactIcon}>
                  <Sparkles size={24} color="#ffffff" />
                </View>
              </View>
              
              {/* Impact Stats */}
              <View style={styles.impactStats}>
                <View style={styles.impactItem}>
                  <Text style={styles.impactValue}>{stats.co2Saved.toFixed(1)}kg</Text>
                  <Text style={styles.impactLabel}>CO₂ Saved</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactItem}>
                  <Text style={styles.impactValue}>{stats.streak}</Text>
                  <Text style={styles.impactLabel}>Day Streak</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactItem}>
                  <Text style={styles.impactValue}>{Math.round(stats.recyclingRate)}%</Text>
                  <Text style={styles.impactLabel}>Recycled</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week's Impact</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatsCard
                  title="Total Waste"
                  value={`${stats.weeklyWeight}g`}
                  subtitle="Tracked this week"
                  icon={<TrendingDown size={20} color="#6366f1" />}
                  color="#6366f1"
                />
                <StatsCard
                  title="Recycling"
                  value={`${Math.round(stats.recyclingRate)}%`}
                  subtitle="Great progress!"
                  color="#10b981"
                  icon={<Recycle size={20} color="#10b981" />}
                />
              </View>
              <View style={styles.statsRow}>
                <StatsCard
                  title="CO₂ Impact"
                  value={`${stats.co2Saved.toFixed(1)}kg`}
                  subtitle="Carbon saved"
                  color="#f59e0b"
                  icon={<Leaf size={20} color="#f59e0b" />}
                />
                <StatsCard
                  title="Streak"
                  value={`${stats.streak} days`}
                  subtitle="Keep it up!"
                  color="#ef4444"
                  icon={<Zap size={20} color="#ef4444" />}
                />
              </View>
            </View>
          </View>

          {/* Goals Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Target size={24} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Goals</Text>
              </View>
              <TouchableOpacity style={styles.sectionAction}>
                <Text style={[styles.sectionActionText, { color: theme.colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.goalsContainer}>
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Award size={24} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
              </View>
              {recentItems.length > 0 && (
                <View style={styles.entryCountBadge}>
                  <Text style={styles.entryCount}>{recentItems.length}</Text>
                </View>
              )}
            </View>
            
            {recentItems.length > 0 ? (
              <View style={styles.recentItemsContainer}>
                {recentItems.slice(0, 5).map(item => {
                  console.log('🎯 [HomeScreen] Rendering item:', item.id, item.description);
                  return (
                    <WasteCard key={item.id} entry={item} />
                  );
                })}
                {recentItems.length > 5 && (
                  <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>
                      View all {recentItems.length} items
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['#f8fafc', '#f1f5f9']}
                  style={styles.emptyStateGradient}
                >
                  <View style={styles.emptyStateIcon}>
                    <Sparkles size={48} color="#94a3b8" />
                  </View>
                  <Text style={styles.emptyStateTitle}>Start Your Journey</Text>
                  <Text style={styles.emptyStateText}>
                    Begin tracking your waste to see your environmental impact and earn rewards!
                  </Text>
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => router.push('/camera')}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.scanButtonGradient}
                    >
                      <View style={styles.scanButtonContent}>
                        <Plus size={20} color="#ffffff" />
                        <Text style={styles.scanButtonText}>Scan Your First Item</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
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
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  
  // App Header
  appHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  appTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1f2937',
    marginBottom: 4,
  },
  appSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
  },

  // Environmental Impact Section
  impactSection: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  impactGradient: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  impactTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    flex: 1,
  },
  impactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
  },
  impactValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 4,
  },
  impactLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  impactDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
  },
  sectionAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  sectionActionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },

  // Goals
  goalsContainer: {
    gap: 12,
  },

  // Recent Items
  recentItemsContainer: {
    gap: 12,
  },
  entryCountBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  entryCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  viewAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#64748b',
  },

  // Empty State
  emptyState: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyStateGradient: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  scanButton: {
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
});