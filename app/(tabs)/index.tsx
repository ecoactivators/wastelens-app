import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { GoalCard } from '@/components/GoalCard';
import { Plus, Zap, Recycle, Leaf, TrendingDown, Sparkles } from 'lucide-react-native';
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <Sparkles size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
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
          {/* Premium Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>Waste Lens</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Snap your waste, reduce your bill</Text>
            </View>
          </View>

          {/* Primary Stats - Switched order: Streak first, then This Week */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="Streak"
              value={`${stats.streak} days`}
              subtitle="Keep it up!"
              color={theme.colors.warning}
              icon={<Zap size={18} color={theme.colors.warning} strokeWidth={1.5} />}
            />
            <StatsCard
              title="This Week"
              value={`${stats.weeklyWeight}g`}
              subtitle="Total waste"
              icon={<TrendingDown size={18} color={theme.colors.textSecondary} strokeWidth={1.5} />}
            />
          </View>

          {/* Waste Type Stats - Food vs Other */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="Food Waste"
              value={`${Math.round(stats.foodWastePercentage)}%`}
              subtitle="Of total waste"
              color={theme.colors.warning}
              icon={<Leaf size={18} color={theme.colors.warning} strokeWidth={1.5} />}
            />
            <StatsCard
              title="Other Waste"
              value={`${Math.round(stats.otherWastePercentage)}%`}
              subtitle="Of total waste"
              color={theme.colors.accent}
              icon={<TrendingDown size={18} color={theme.colors.accent} strokeWidth={1.5} />}
            />
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your City's Goals</Text>
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </View>

          {/* Get Started Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Get Started</Text>
            <View style={[styles.getStartedCard, { backgroundColor: theme.colors.surface }]}>
              <LinearGradient
                colors={[theme.colors.surface, theme.colors.surfaceElevated]}
                style={styles.getStartedGradient}
              >
                <View style={styles.getStartedContent}>
                  <Text style={[styles.getStartedTitle, { color: theme.colors.text }]}>
                    Ready to snap your waste?
                  </Text>
                  <Text style={[styles.getStartedDescription, { color: theme.colors.textSecondary }]}>
                    Start by snapping your first waste item. Every snap helps you understand your waste patterns and work towards reducing your environmental footprint.
                  </Text>
                  <TouchableOpacity
                    style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.push('/camera')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primary]}
                      style={styles.scanButtonGradient}
                    >
                      <Plus size={20} color={theme.colors.surface} strokeWidth={2} />
                      <Text style={[styles.scanButtonText, { color: theme.colors.surface }]}>Snap Your First Item</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Environmental Impact - Moved to bottom */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Environmental Impact</Text>
            <View style={[styles.impactCard, { backgroundColor: theme.colors.surface }]}>
              <LinearGradient
                colors={[theme.colors.surface, theme.colors.surfaceElevated]}
                style={styles.impactGradient}
              >
                <View style={styles.impactRow}>
                  <Leaf size={20} color={theme.colors.success} strokeWidth={1.5} />
                  <View style={styles.impactContent}>
                    <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>
                      CO₂ Impact This Month
                    </Text>
                    <Text style={[styles.impactValue, { color: theme.colors.success }]}>
                      {stats.co2Saved.toFixed(1)}kg CO₂ saved
                    </Text>
                    <Text style={[styles.impactDescription, { color: theme.colors.textTertiary }]}>
                      Through proper waste sorting and recycling
                    </Text>
                  </View>
                </View>
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
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    letterSpacing: 0.3,
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  getStartedCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  getStartedGradient: {
    flex: 1,
  },
  getStartedContent: {
    padding: 28,
  },
  getStartedTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  getStartedDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    letterSpacing: 0.1,
  },
  scanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  scanButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  impactCard: {
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
  impactGradient: {
    flex: 1,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
  },
  impactContent: {
    flex: 1,
  },
  impactLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 6,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  impactValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  impactDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});