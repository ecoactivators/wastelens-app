import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWasteData } from '@/hooks/useWasteData';
import { WasteCard } from '@/components/WasteCard';
import { StatsCard } from '@/components/StatsCard';
import { GoalCard } from '@/components/GoalCard';
import { Plus, Zap, Recycle, Leaf, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { entries, goals, stats, loading } = useWasteData();

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const recentEntries = entries.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Track your waste, save the planet</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/camera')}
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
            icon={<TrendingDown size={20} color="#6b7280" />}
          />
          <StatsCard
            title="Recycling Rate"
            value={`${Math.round(stats.recyclingRate)}%`}
            subtitle="Keep it up!"
            color="#10b981"
            icon={<Recycle size={20} color="#10b981" />}
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
            color="#f59e0b"
            icon={<Zap size={20} color="#f59e0b" />}
          />
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        {/* Recent Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Logged</Text>
          </View>
          {recentEntries.map(entry => (
            <WasteCard key={entry.id} entry={entry} />
          ))}
          {recentEntries.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No entries yet. Start by scanning an item!</Text>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push('/(tabs)/camera')}
              >
                <Plus size={20} color="#ffffff" />
                <Text style={styles.scanButtonText}>Scan Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6b7280',
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
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#10b981',
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
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
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
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#10b981',
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
});