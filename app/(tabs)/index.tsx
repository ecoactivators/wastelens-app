import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { WasteCard } from '@/components/WasteCard';
import { StatsCard } from '@/components/StatsCard';
import { GoalCard } from '@/components/GoalCard';
import { Plus, Zap, Recycle, Leaf, TrendingDown, Camera, Sparkles } from 'lucide-react-native';
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
          colors={['#f0f9ff', '#e0f2fe', '#ffffff']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <Sparkles size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Analyzing your impact...</Text>
            <Text style={[styles.loadingSubtext, { color: theme.colors.textSecondary }]}>Just a moment</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  console.log('🎨 [HomeScreen] Rendering with', recentItems.length, 'recent items');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe', '#ffffff']}
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.logoGradient}
                >
                  <Leaf size={24} color="#ffffff" />
                </LinearGradient>
                <View style={styles.titleText}>
                  <Text style={[styles.greeting, { color: theme.colors.text }]}>WasteLens</Text>
                  <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track • Reduce • Impact</Text>
                </View>
              </View>
              
              {/* Quick Scan Button */}
              <TouchableOpacity
                style={[styles.quickScanButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/camera')}
              >
                <Camera size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Stats Card */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Your Environmental Impact</Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>{stats.co2Saved.toFixed(1)}kg</Text>
                    <Text style={styles.heroStatLabel}>CO₂ Saved</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>{stats.streak}</Text>
                    <Text style={styles.heroStatLabel}>Day Streak</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>{Math.round(stats.recyclingRate)}%</Text>
                    <Text style={styles.heroStatLabel}>Recycled</Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroDecoration}>
                <Sparkles size={40} color="rgba(255, 255, 255, 0.2)" />
              </View>
            </LinearGradient>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                title="Total Waste"
                value={`${stats.weeklyWeight}g`}
                subtitle="Tracked items"
                icon={<TrendingDown size={18} color="#6b7280" />}
                compact
              />
              <StatsCard
                title="Items Scanned"
                value={`${recentItems.length}`}
                subtitle="This week"
                color="#3b82f6"
                icon={<Camera size={18} color="#3b82f6" />}
                compact
              />
            </View>
          </View>

          {/* Goals Section */}
          {goals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Goals</Text>
                <TouchableOpacity style={styles.sectionAction}>
                  <Text style={[styles.sectionActionText, { color: theme.colors.primary }]}>View All</Text>
                </TouchableOpacity>
              </View>
              {goals.slice(0, 2).map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </View>
          )}

          {/* Recently Scanned Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Scans</Text>
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
                {recentItems.slice(0, 4).map(item => {
                  console.log('🎯 [HomeScreen] Rendering item:', item.id, item.description);
                  return (
                    <WasteCard key={item.id} entry={item} />
                  );
                })}
                {recentItems.length > 4 && (
                  <TouchableOpacity 
                    style={[styles.viewAllButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => {
                      // Navigate to a full list view - for now just show an alert
                      console.log('View all items');
                    }}
                  >
                    <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                      View all {recentItems.length} items
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
                <LinearGradient
                  colors={['#f0f9ff', '#e0f2fe']}
                  style={styles.emptyStateGradient}
                >
                  <View style={styles.emptyStateIcon}>
                    <Camera size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                    Start Your Journey
                  </Text>
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                    Scan your first waste item to begin tracking your environmental impact
                  </Text>
                  <TouchableOpacity
                    style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.push('/camera')}
                  >
                    <Camera size={20} color="#ffffff" />
                    <Text style={styles.scanButtonText}>Scan First Item</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Bottom Spacing for Tab Bar */}
          <View style={styles.bottomSpacing} />
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
    marginBottom: 20,
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  quickScanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    opacity: 0.9,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  heroDecoration: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 0,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
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
  sectionAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionActionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
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
    borderRadius: 16,
    marginTop: 12,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  bottomSpacing: {
    height: 20,
  },
});