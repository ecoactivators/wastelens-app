import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWasteData } from '@/hooks/useWasteData';
import { WasteCard } from '@/components/WasteCard';
import { StatsCard } from '@/components/StatsCard';
import { BarChart3, TrendingUp, Recycle, Leaf, Calendar, Filter } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const { entries, stats, loading } = useWasteData();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recyclable' | 'compostable'>('all');

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredEntries = entries.filter(entry => {
    if (selectedFilter === 'recyclable') return entry.recyclable;
    if (selectedFilter === 'compostable') return entry.compostable;
    return true;
  });

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  const filters = [
    { key: 'all', label: 'All Waste' },
    { key: 'recyclable', label: 'Recyclable' },
    { key: 'compostable', label: 'Compostable' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Analyze your waste patterns</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.section}>
          <View style={styles.selectorContainer}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.selectorButton,
                  selectedPeriod === period.key && styles.selectorButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.key as any)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    selectedPeriod === period.key && styles.selectorTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <StatsCard
            title="Total Waste"
            value={`${selectedPeriod === 'week' ? stats.weeklyWeight : stats.monthlyWeight}g`}
            subtitle={`This ${selectedPeriod}`}
            icon={<BarChart3 size={20} color="#6b7280" />}
          />
          <StatsCard
            title="Recycling Rate"
            value={`${Math.round(stats.recyclingRate)}%`}
            subtitle="Great progress!"
            color="#10b981"
            icon={<Recycle size={20} color="#10b981" />}
          />
        </View>

        <View style={styles.metricsContainer}>
          <StatsCard
            title="Composting Rate"
            value={`${Math.round(stats.compostingRate)}%`}
            subtitle="Keep it up!"
            color="#f59e0b"
            icon={<Leaf size={20} color="#f59e0b" />}
          />
          <StatsCard
            title="Environmental Impact"
            value={`${stats.co2Saved.toFixed(1)}kg`}
            subtitle="CO₂ saved"
            color="#3b82f6"
            icon={<TrendingUp size={20} color="#3b82f6" />}
          />
        </View>

        {/* Waste Breakdown Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Breakdown</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartPlaceholder}>
              <BarChart3 size={48} color="#d1d5db" />
              <Text style={styles.chartPlaceholderText}>
                Interactive charts coming soon
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter Entries</Text>
          <View style={styles.filterContainer}>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.key && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Entries List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Entries</Text>
            <View style={styles.entriesCount}>
              <Text style={styles.entriesCountText}>
                {filteredEntries.length} entries
              </Text>
            </View>
          </View>
          {filteredEntries.map(entry => (
            <WasteCard key={entry.id} entry={entry} />
          ))}
          {filteredEntries.length === 0 && (
            <View style={styles.emptyState}>
              <Filter size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No entries match your filter</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectorButtonActive: {
    backgroundColor: '#10b981',
  },
  selectorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartPlaceholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#10b981',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entriesCount: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  entriesCountText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});