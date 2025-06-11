import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '@/contexts/ItemsContext';
import { WasteCard } from '@/components/WasteCard';
import { StatsCard } from '@/components/StatsCard';
import { GoalCard } from '@/components/GoalCard';
import { Plus, Zap, Recycle, Leaf, TrendingDown } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('🎨 [HomeScreen] Rendering with', recentItems.length, 'recent items');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
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
            <Text style={[styles.greeting, { color: theme.colors.text }]}>WasteLens</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track your waste, save the planet</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="This Week"
            value={`${stats.weeklyWeight} Grams`}
            subtitle="Total waste"
            icon={<TrendingDown size={20} color={theme.colors.textSecondary} />}
          />
          <StatsCard
            title="Recycling Rate"
            value={`${Math.round(stats.recyclingRate)}%`}
            subtitle="Keep it up!"
            color={theme.colors.success}
            icon={<Recycle size={20} color={theme.colors.success} />}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="CO₂ Saved"
            value={`${stats.co2Saved.toFixed(1)}kg`}
            subtitle="This month"
            color="#3b82f6"
            icon={<Leaf size={20} color="#3b82f6" />}
          />
          <StatsCard
            title="Streak"
            value={`${stats.streak} days`}
            subtitle="Amazing!"
            color={theme.colors.warning}
            icon={<Zap size={20} color={theme.colors.warning} />}
          />
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Goals</Text>
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        {/* Recently Scanned Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recently Scanned</Text>
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
              {recentItems.slice(0, 5).map(item => {
                console.log('🎯 [HomeScreen] Rendering item:', item.id, item.description);
                return (
                  <WasteCard key={item.id} entry={item} />
                );
              })}
              {recentItems.length > 5 && (
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
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No items scanned yet. Start by scanning an item!
              </Text>
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/camera')}
              >
                <Plus size={20} color="#ffffff" />
                <Text style={styles.scanButtonText}>Scan Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Camera Button */}
      <TouchableOpacity
        style={[styles.floatingCameraButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/camera')}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
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
  floatingCameraButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});