import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWasteData } from '@/hooks/useWasteData';
import { WasteCard } from '@/components/WasteCard';
import { StatsCard } from '@/components/StatsCard';
import { GoalCard } from '@/components/GoalCard';
import { Plus, Zap, Recycle, Leaf, TrendingDown } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { entries, goals, stats, loading, refreshData } = useWasteData();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 Home screen focused');
      console.log('📊 Current entries count:', entries.length);
      console.log('📋 Recent entries:', entries.slice(0, 3).map(e => ({ 
        id: e.id, 
        description: e.description, 
        weight: e.weight,
        timestamp: e.timestamp.toLocaleString()
      })));
    }, [entries])
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

  const recentEntries = entries.slice(0, 5);
  console.log('🎨 Rendering recent entries:', recentEntries.length);

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
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/camera')}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="This Week"
            value={`${stats.weeklyWeight}g`}
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

        {/* Recent Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recently Logged</Text>
            {entries.length > 0 && (
              <View style={[styles.entryCountBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.entryCount, { color: theme.colors.primary }]}>
                  {entries.length}
                </Text>
              </View>
            )}
          </View>
          
          {recentEntries.length > 0 ? (
            <>
              {recentEntries.map(entry => {
                console.log('🎯 Rendering entry:', entry.id, entry.description);
                return (
                  <WasteCard key={entry.id} entry={entry} />
                );
              })}
              {entries.length > 5 && (
                <TouchableOpacity 
                  style={[styles.viewAllButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => {
                    // Navigate to a full list view - for now just show an alert
                    console.log('View all entries');
                  }}
                >
                  <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                    View all {entries.length} entries
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No entries yet. Start by scanning an item!
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

        {/* Debug Info (remove in production) */}
        {__DEV__ && (
          <View style={[styles.debugSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.debugTitle, { color: theme.colors.text }]}>Debug Info</Text>
            <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
              Total entries: {entries.length}
            </Text>
            <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
              Recent entries: {recentEntries.length}
            </Text>
            <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
              Last update: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        )}
      </ScrollView>
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  debugSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  debugText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
});