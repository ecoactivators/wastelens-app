import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { Gift, Star, Trophy } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  imageUrl: string;
  category: 'eco' | 'discount' | 'experience';
  available: boolean;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    title: 'Reusable Water Bottle',
    description: 'Premium stainless steel water bottle',
    points: 500,
    imageUrl: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg',
    category: 'eco',
    available: true,
  },
  {
    id: '2',
    title: '10% Off Eco Store',
    description: 'Discount at participating eco-friendly stores',
    points: 250,
    imageUrl: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg',
    category: 'discount',
    available: true,
  },
  {
    id: '3',
    title: 'Tree Planting Certificate',
    description: 'Plant a tree in your name',
    points: 1000,
    imageUrl: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
    category: 'experience',
    available: true,
  },
  {
    id: '4',
    title: 'Bamboo Utensil Set',
    description: 'Portable bamboo cutlery set',
    points: 300,
    imageUrl: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg',
    category: 'eco',
    available: true,
  },
];

export default function RewardsScreen() {
  const { stats, loading } = useItems();
  const { theme } = useTheme();
  const userPoints = 0; // Start with 0 points

  if (loading || !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const availableRewards = mockRewards.filter(reward => reward.available && reward.points <= userPoints);
  const lockedRewards = mockRewards.filter(reward => reward.points > userPoints);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Rewards</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Earn points by tracking waste</Text>
        </View>

        {/* Points Balance */}
        <View style={styles.section}>
          <View style={[styles.pointsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.pointsHeader}>
              <View style={[styles.pointsIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Gift size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.pointsInfo}>
                <Text style={[styles.pointsTitle, { color: theme.colors.textSecondary }]}>Your Points</Text>
                <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>{userPoints.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={[styles.pointsSubtitle, { color: theme.colors.textSecondary }]}>
              Start tracking waste to earn your first points!
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="This Week"
            value={`+${Math.round(stats.weeklyWeight / 10)}`}
            subtitle="Points earned"
            color={theme.colors.success}
            icon={<Star size={20} color={theme.colors.success} />}
          />
          <StatsCard
            title="Total Earned"
            value={`${userPoints}`}
            subtitle="All time points"
            color="#3b82f6"
            icon={<Trophy size={20} color="#3b82f6" />}
          />
        </View>

        {/* Available Rewards */}
        {availableRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Rewards</Text>
            {availableRewards.map(reward => (
              <TouchableOpacity key={reward.id} style={[styles.rewardCard, { backgroundColor: theme.colors.surface }]}>
                <Image source={{ uri: reward.imageUrl }} style={styles.rewardImage} />
                <View style={styles.rewardContent}>
                  <Text style={[styles.rewardTitle, { color: theme.colors.text }]}>{reward.title}</Text>
                  <Text style={[styles.rewardDescription, { color: theme.colors.textSecondary }]}>{reward.description}</Text>
                  <View style={styles.rewardFooter}>
                    <View style={styles.pointsBadge}>
                      <Star size={12} color="#f59e0b" />
                      <Text style={styles.pointsText}>{reward.points} pts</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Locked Rewards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Earn Points to Unlock</Text>
          {lockedRewards.map(reward => (
            <View key={reward.id} style={[styles.rewardCard, styles.lockedReward, { backgroundColor: theme.colors.surface }]}>
              <Image source={{ uri: reward.imageUrl }} style={[styles.rewardImage, styles.lockedImage]} />
              <View style={styles.rewardContent}>
                <Text style={[styles.rewardTitle, { color: theme.colors.textTertiary }]}>{reward.title}</Text>
                <Text style={[styles.rewardDescription, { color: theme.colors.textTertiary }]}>{reward.description}</Text>
                <View style={styles.rewardFooter}>
                  <View style={[styles.pointsBadge, styles.lockedBadge, { backgroundColor: theme.colors.background }]}>
                    <Star size={12} color={theme.colors.textTertiary} />
                    <Text style={[styles.lockedPointsText, { color: theme.colors.textTertiary }]}>{reward.points} pts</Text>
                  </View>
                  <Text style={[styles.lockedLabel, { color: theme.colors.textTertiary }]}>
                    Need {reward.points} points
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State for New Users */}
        {userPoints === 0 && (
          <View style={styles.section}>
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Gift size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>Start Earning Points!</Text>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                Track your waste items to earn points and unlock amazing eco-friendly rewards.
              </Text>
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pointsCard: {
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
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  pointsTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
  },
  pointsSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 16,
  },
  rewardCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  rewardDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#f59e0b',
  },
  lockedReward: {
    opacity: 0.6,
  },
  lockedImage: {
    opacity: 0.5,
  },
  lockedBadge: {},
  lockedPointsText: {},
  lockedLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});