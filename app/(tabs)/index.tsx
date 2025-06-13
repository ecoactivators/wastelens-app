import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { GoalCard } from '@/components/GoalCard';
import { Plus, Zap, Recycle, Leaf, TrendingDown } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Platform } from 'react-native';

export default function HomeScreen() {
  const { 
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

  return (
    <SafeAreaView style={styles.container}>
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
              <Text style={[styles.greeting, { color: theme.colors.text }]}>Waste Lens</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Snap your waste, reduce your bill</Text>
            </View>
          </View>

          {/* Primary Stats - Focus on waste tracking */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="This Week"
              value={`${stats.weeklyWeight} Grams`}
              subtitle="Total waste"
              icon={<TrendingDown size={20} color={theme.colors.textSecondary} />}
            />
            <StatsCard
              title="Streak"
              value={`${stats.streak} days`}
              subtitle="Keep it up!"
              color={theme.colors.warning}
              icon={<Zap size={20} color={theme.colors.warning} />}
            />
          </View>

          <View style={styles.statsContainer}>
            <StatsCard
              title="Recycling Rate"
              value={`${Math.round(stats.recyclingRate)}%`}
              subtitle="Great progress!"
              color={theme.colors.success}
              icon={<Recycle size={20} color={theme.colors.success} />}
            />
            <StatsCard
              title="Items Tracked"
              value={`${stats.totalWeight > 0 ? Math.ceil(stats.totalWeight / 50) : 0}`}
              subtitle="All time"
              color="#3b82f6"
              icon={<TrendingDown size={20} color="#3b82f6" />}
            />
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Goals</Text>
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </View>

          {/* Get Started Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Get Started</Text>
            <View style={[styles.getStartedCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.getStartedTitle, { color: theme.colors.text }]}>
                Ready to track your waste?
              </Text>
              <Text style={[styles.getStartedDescription, { color: theme.colors.textSecondary }]}>
                Start by scanning your first waste item. Every scan helps you understand your waste patterns and work towards reducing your environmental footprint.
              </Text>
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/camera')}
              >
                <Plus size={20} color="#ffffff" />
                <Text style={styles.scanButtonText}>Scan Your First Item</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Waste Reduction Tips</Text>
            <View style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.tipItem}>
                <View style={[styles.tipBullet, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Clean containers before recycling to improve processing efficiency
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={[styles.tipBullet, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Choose reusable alternatives to reduce single-use waste
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={[styles.tipBullet, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Track your waste patterns to identify reduction opportunities
                </Text>
              </View>
            </View>
          </View>

          {/* Environmental Impact - Moved to bottom */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Environmental Impact</Text>
            <View style={[styles.impactCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.impactRow}>
                <Leaf size={20} color="#3b82f6" />
                <View style={styles.impactContent}>
                  <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>
                    CO₂ Impact This Month
                  </Text>
                  <Text style={[styles.impactValue, { color: "#3b82f6" }]}>
                    {stats.co2Saved.toFixed(1)}kg CO₂ saved
                  </Text>
                  <Text style={[styles.impactDescription, { color: theme.colors.textTertiary }]}>
                    Through proper waste sorting and recycling
                  </Text>
                </View>
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
    paddingBottom: 140, // Adjusted padding for tab bar integration
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
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 16,
  },
  getStartedCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  getStartedTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 12,
  },
  getStartedDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  tipsCard: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  impactCard: {
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
  impactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  impactContent: {
    flex: 1,
  },
  impactLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  impactValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  impactDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
});