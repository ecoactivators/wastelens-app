import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { RewardCard } from '@/components/RewardCard';
import { RewardRedemptionModal } from '@/components/RewardRedemptionModal';
import { Gift, Star, Trophy, Package } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Reward, UserReward, ShippingAddress, UserPoints } from '@/types/rewards';
import { RewardsService } from '@/services/rewards';
import { PointsService } from '@/services/points';

export default function RewardsScreen() {
  const { stats, loading, recentItems, refreshData } = useItems();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [userPoints, setUserPoints] = useState<UserPoints>({
    totalEarned: 0,
    currentBalance: 0,
    totalSpent: 0,
    lifetimeRank: 'Eco Beginner',
    weeklyEarned: 0,
    monthlyEarned: 0
  });
  const [redeemedRewards, setRedeemedRewards] = useState<UserReward[]>([]);

  // Calculate user points
  useEffect(() => {
    if (stats && recentItems) {
      // Calculate total points earned from all scans
      const totalPointsFromScans = recentItems.reduce((total, item) => {
        return total + PointsService.calculatePointsFromScan(item);
      }, 0);

      // Add streak bonus
      const streakBonus = PointsService.calculateStreakBonus(stats.streak);
      const totalEarned = totalPointsFromScans + streakBonus;

      // Calculate points spent on redeemed rewards
      const totalSpent = redeemedRewards.reduce((total, redemption) => {
        const reward = RewardsService.getRewardById(redemption.rewardId);
        return total + (reward?.pointsCost || 0);
      }, 0);

      const currentBalance = totalEarned - totalSpent;
      const lifetimeRank = PointsService.getUserRank(totalEarned);

      // Calculate weekly/monthly earnings (simplified)
      const weeklyEarned = Math.floor(totalEarned * 0.3);
      const monthlyEarned = Math.floor(totalEarned * 0.7);

      setUserPoints({
        totalEarned,
        currentBalance,
        totalSpent,
        lifetimeRank,
        weeklyEarned,
        monthlyEarned
      });
    }
  }, [stats, recentItems, redeemedRewards]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshData]);

  const handleRewardPress = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedemptionModal(true);
  };

  const handleRewardRedeem = (reward: Reward, address: ShippingAddress) => {
    // Create new user reward redemption
    const newRedemption: UserReward = {
      id: `redemption-${Date.now()}`,
      rewardId: reward.id,
      userId: 'current-user', // In real app, get from auth context
      redeemedAt: new Date(),
      status: 'processing',
      shippingAddress: address,
      estimatedDelivery: RewardsService.calculateDeliveryDate(reward.estimatedDelivery),
      trackingNumber: RewardsService.generateTrackingNumber()
    };

    // Add to redeemed rewards
    setRedeemedRewards(prev => [...prev, newRedemption]);

    // Close modal
    setShowRedemptionModal(false);
    setSelectedReward(null);

    console.log('✅ Reward redeemed:', {
      reward: reward.title,
      points: reward.pointsCost,
      address: address,
      tracking: newRedemption.trackingNumber
    });
  };

  if (loading || !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const availableRewards = RewardsService.getAvailableRewards();
  const affordableRewards = availableRewards.filter(reward => 
    RewardsService.canAffordReward(userPoints.currentBalance, reward.pointsCost)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Rewards</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Redeem points for eco-friendly rewards
          </Text>
        </View>

        {/* Points Balance */}
        <View style={styles.section}>
          <View style={[styles.pointsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.pointsHeader}>
              <View style={[styles.pointsIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Gift size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.pointsInfo}>
                <Text style={[styles.pointsTitle, { color: theme.colors.textSecondary }]}>Available Points</Text>
                <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
                  {userPoints.currentBalance.toLocaleString()}
                </Text>
              </View>
            </View>
            <Text style={[styles.pointsSubtitle, { color: theme.colors.textSecondary }]}>
              Earn more points by scanning waste items and completing quests!
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="This Week"
            value={`+${userPoints.weeklyEarned}`}
            subtitle="Points earned"
            color={theme.colors.success}
            icon={<Star size={20} color={theme.colors.success} />}
          />
          <StatsCard
            title="Available"
            value={`${affordableRewards.length}`}
            subtitle="Rewards to redeem"
            color="#3b82f6"
            icon={<Package size={20} color="#3b82f6" />}
          />
        </View>

        {/* Redeemed Rewards */}
        {redeemedRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Rewards</Text>
            {redeemedRewards.map(redemption => {
              const reward = RewardsService.getRewardById(redemption.rewardId);
              if (!reward) return null;
              
              return (
                <View key={redemption.id} style={[styles.redeemedCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.redeemedHeader}>
                    <Text style={[styles.redeemedTitle, { color: theme.colors.text }]}>
                      {reward.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                      <Text style={[styles.statusText, { color: '#16a34a' }]}>
                        {redemption.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.redeemedInfo, { color: theme.colors.textSecondary }]}>
                    Tracking: {redemption.trackingNumber}
                  </Text>
                  <Text style={[styles.redeemedInfo, { color: theme.colors.textSecondary }]}>
                    Estimated delivery: {redemption.estimatedDelivery.toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Available Rewards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Rewards</Text>
          {availableRewards.map(reward => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={userPoints.currentBalance}
              onPress={() => handleRewardPress(reward)}
            />
          ))}
        </View>

        {/* Empty State for New Users */}
        {userPoints.currentBalance === 0 && (
          <View style={styles.section}>
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Gift size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>Start Earning Points!</Text>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                Snap your waste items to earn points and unlock amazing eco-friendly rewards.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Reward Redemption Modal */}
      <RewardRedemptionModal
        visible={showRedemptionModal}
        reward={selectedReward}
        userPoints={userPoints.currentBalance}
        onClose={() => {
          setShowRedemptionModal(false);
          setSelectedReward(null);
        }}
        onRedeem={handleRewardRedeem}
      />
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
  scrollContent: {
    paddingBottom: 120, // Added extra padding for tab bar
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
  redeemedCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  redeemedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  redeemedTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
  },
  redeemedInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 2,
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