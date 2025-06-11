import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWasteData } from '@/hooks/useWasteData';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CircularProgress } from '@/components/CircularProgress';
import { MacroCircle } from '@/components/MacroCircle';
import { RecentEntry } from '@/components/RecentEntry';
import { Recycle, Leaf, Trash2, Flame } from 'lucide-react-native';

export default function HomeScreen() {
  const { entries, stats, loading } = useWasteData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.toDateString() === selectedDate.toDateString();
  });

  const dailyTarget = 500; // grams
  const wasteLeft = Math.max(0, dailyTarget - stats.weeklyWeight / 7);
  
  const recyclableWeight = entries
    .filter(entry => entry.recyclable)
    .reduce((sum, entry) => sum + entry.weight, 0);
  
  const compostableWeight = entries
    .filter(entry => entry.compostable)
    .reduce((sum, entry) => sum + entry.weight, 0);
  
  const landfillWeight = stats.totalWeight - recyclableWeight - compostableWeight;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Trash2 size={24} color="#000000" strokeWidth={2.5} />
            </View>
            <Text style={styles.appName}>WasteLens</Text>
          </View>
          <View style={styles.streakContainer}>
            <Flame size={16} color="#f59e0b" />
            <Text style={styles.streakText}>{stats.streak}</Text>
          </View>
        </View>

        {/* Weekly Calendar */}
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Main Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressContent}>
            <View style={styles.progressLeft}>
              <Text style={styles.mainValue}>{Math.round(wasteLeft)}</Text>
              <Text style={styles.mainLabel}>Grams left</Text>
            </View>
            <CircularProgress
              value={stats.weeklyWeight / 7}
              maxValue={dailyTarget}
              size={120}
              strokeWidth={8}
              color="#000000"
            />
          </View>
        </View>

        {/* Macro Breakdown */}
        <View style={styles.macroContainer}>
          <MacroCircle
            value={recyclableWeight}
            maxValue={stats.totalWeight}
            label="Recyclable"
            color="#10b981"
            icon={<Recycle size={20} color="#10b981" />}
          />
          <MacroCircle
            value={compostableWeight}
            maxValue={stats.totalWeight}
            label="Compostable"
            color="#f59e0b"
            icon={<Leaf size={20} color="#f59e0b" />}
          />
          <MacroCircle
            value={landfillWeight}
            maxValue={stats.totalWeight}
            label="Landfill"
            color="#6b7280"
            icon={<Trash2 size={20} color="#6b7280" />}
          />
        </View>

        {/* Page Indicator */}
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>

        {/* Recently Logged */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently logged</Text>
          {todayEntries.length > 0 ? (
            todayEntries.slice(0, 3).map(entry => (
              <RecentEntry key={entry.id} entry={entry} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No entries for this day</Text>
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
    backgroundColor: '#f8f9fa',
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLeft: {
    flex: 1,
  },
  mainValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 64,
    color: '#111827',
    lineHeight: 72,
  },
  mainLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#6b7280',
    marginTop: 4,
  },
  macroContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    backgroundColor: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#9ca3af',
  },
});