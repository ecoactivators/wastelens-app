import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWasteData } from '@/hooks/useWasteData';
import { StatsCard } from '@/components/StatsCard';
import { Gift, Star, Trophy, Target, Zap, Leaf, Award, ChevronRight } from 'lucide-react-native';

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
    available: false,
  },
];

const achievements = [
  {
    id: '1',
    title: 'First Entry',
    description: 'Log your first waste item',
    icon: <Star size={20} color="#f59e0b" />,
    completed: true,
    points: 50,
  },
  {
    id: '2',
    title: 'Week Warrior',
    description: 'Track waste for 7 consecutive days',
    icon: <Zap size={20} color="#3b82f6" />,
    completed: true,
    points: 100,
  },
  {
    id: '3',
    title: 'Recycling Champion',
    description: 'Recycle 80% of your waste this month',
    icon: <Leaf size={20} color="#10b981" />,
    completed: false,
    points: 200,
  },
  {
    id: '4',
    title: 'Waste Reducer',
    description: 'Reduce waste by 50% compared to last month',
    icon: <Trophy size={20} color="#ef4444" />,
    completed: false,
    points: 300,
  },
];

export default function RewardsScreen() {
  const { stats, loading } = useWasteData();
  const userPoints = 750; // Mock user points

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const availableRewards = mockRewards.filter(reward => reward.available && reward.points <= userPoints);
  const unavailableRewards = mockRewards.filter(reward => !reward.available || reward.points > userPoints);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rewards</Text>
          <Text style={styles.subtitle}>Earn points by tracking waste</Text>
        </View>

        {/* Points Balance */}
        <View style={styles.section}>
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View style={styles.pointsIcon}>
                <Gift size={24} color="#10b981" />
              </View>
              <View style={styles.pointsInfo}>
                <Text style={styles.pointsTitle}>Your Points</Text>
                <Text style={styles.pointsValue}>{userPoints.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.pointsSubtitle}>
              Keep tracking to earn more points!
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="This Week"
            value={`+${Math.round(stats.weeklyWeight / 10)}`}
            subtitle="Points earned"
            color="#10b981"
            icon={<Star size={20} color="#10b981" />}
          />
          <StatsCard
            title="Total Earned"
            value={`${userPoints + 250}`}
            subtitle="All time points"
            color="#3b82f6"
            icon={<Trophy size={20} color="#3b82f6" />}
          />
        </View>

        {/* Available Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          {availableRewards.map(reward => (
            <TouchableOpacity key={reward.id} style={styles.rewardCard}>
              <Image source={{ uri: reward.imageUrl }} style={styles.rewardImage} />
              <View style={styles.rewardContent}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                <View style={styles.rewardFooter}>
                  <View style={styles.pointsBadge}>
                    <Star size={12} color="#f59e0b" />
                    <Text style={styles.pointsText}>{reward.points} pts</Text>
                  </View>
                  <ChevronRight size={16} color="#6b7280" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.map(achievement => (
            <View key={achievement.id} style={[
              styles.achievementCard,
              achievement.completed && styles.achievementCompleted
            ]}>
              <View style={[
                styles.achievementIcon,
                achievement.completed && styles.achievementIconCompleted
              ]}>
                {achievement.icon}
              </View>
              <View style={styles.achievementContent}>
                <Text style={[
                  styles.achievementTitle,
                  achievement.completed && styles.achievementTitleCompleted
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
              <View style={styles.achievementPoints}>
                <Text style={[
                  styles.achievementPointsText,
                  achievement.completed && styles.achievementPointsCompleted
                ]}>
                  +{achievement.points}
                </Text>
                {achievement.completed && (
                  <View style={styles.completedBadge}>
                    <Award size={12} color="#10b981" />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Locked Rewards */}
        {unavailableRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            {unavailableRewards.map(reward => (
              <View key={reward.id} style={[styles.rewardCard, styles.lockedReward]}>
                <Image source={{ uri: reward.imageUrl }} style={[styles.rewardImage, styles.lockedImage]} />
                <View style={styles.rewardContent}>
                  <Text style={[styles.rewardTitle, styles.lockedText]}>{reward.title}</Text>
                  <Text style={[styles.rewardDescription, styles.lockedText]}>{reward.description}</Text>
                  <View style={styles.rewardFooter}>
                    <View style={[styles.pointsBadge, styles.lockedBadge]}>
                      <Star size={12} color="#9ca3af" />
                      <Text style={styles.lockedPointsText}>{reward.points} pts</Text>
                    </View>
                    <Text style={styles.lockedLabel}>
                      {reward.points > userPoints ? `Need ${reward.points - userPoints} more pts` : 'Coming Soon'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
  pointsCard: {
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
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
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
    color: '#6b7280',
    marginBottom: 4,
  },
  pointsValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#10b981',
  },
  pointsSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
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
    color: '#111827',
    marginBottom: 16,
  },
  rewardCard: {
    backgroundColor: '#ffffff',
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
    color: '#111827',
    marginBottom: 4,
  },
  rewardDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
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
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCompleted: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconCompleted: {
    backgroundColor: '#dcfce7',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  achievementTitleCompleted: {
    color: '#10b981',
  },
  achievementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  achievementPoints: {
    alignItems: 'center',
  },
  achievementPointsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#6b7280',
  },
  achievementPointsCompleted: {
    color: '#10b981',
  },
  completedBadge: {
    marginTop: 4,
  },
  lockedReward: {
    opacity: 0.6,
  },
  lockedImage: {
    opacity: 0.5,
  },
  lockedText: {
    color: '#9ca3af',
  },
  lockedBadge: {
    backgroundColor: '#f3f4f6',
  },
  lockedPointsText: {
    color: '#9ca3af',
  },
  lockedLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#9ca3af',
  },
});