import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useItems } from '@/contexts/ItemsContext';
import { StatsCard } from '@/components/StatsCard';
import { Gift, Star, Trophy, Sparkles, Award, Lock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  imageUrl: string;
  category: 'eco' | 'discount' | 'experience';
  available: boolean;
  featured?: boolean;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    title: 'Premium Water Bottle',
    description: 'Stainless steel insulated bottle',
    points: 500,
    imageUrl: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg',
    category: 'eco',
    available: true,
    featured: true,
  },
  {
    id: '2',
    title: '15% Off Eco Store',
    description: 'Discount at participating stores',
    points: 250,
    imageUrl: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg',
    category: 'discount',
    available: true,
  },
  {
    id: '3',
    title: 'Plant a Tree',
    description: 'Tree planting certificate',
    points: 1000,
    imageUrl: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
    category: 'experience',
    available: false,
  },
  {
    id: '4',
    title: 'Bamboo Utensil Set',
    description: 'Portable cutlery set',
    points: 300,
    imageUrl: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg',
    category: 'eco',
    available: true,
  },
  {
    id: '5',
    title: 'Eco Workshop',
    description: 'Sustainability masterclass',
    points: 750,
    imageUrl: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
    category: 'experience',
    available: false,
  },
];

export default function RewardsScreen() {
  const { stats, loading } = useItems();
  const { theme } = useTheme();
  const userPoints = 320; // Simulated points for demo

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#fef3c7', '#fbbf24', '#f59e0b']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <Sparkles size={32} color="#ffffff" />
            <Text style={styles.loadingText}>Loading rewards...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const availableRewards = mockRewards.filter(reward => reward.available && reward.points <= userPoints);
  const lockedRewards = mockRewards.filter(reward => reward.points > userPoints);
  const featuredReward = mockRewards.find(reward => reward.featured);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fef3c7', '#fbbf24', '#f59e0b']}
        style={styles.gradientBackground}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.logoGradient}
                >
                  <Gift size={24} color="#ffffff" />
                </LinearGradient>
                <View style={styles.titleText}>
                  <Text style={styles.title}>Rewards</Text>
                  <Text style={styles.subtitle}>Earn points by tracking waste</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Points Balance Card */}
          <View style={styles.pointsSection}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.pointsCard}
            >
              <View style={styles.pointsHeader}>
                <View style={styles.pointsIconContainer}>
                  <Star size={24} color="#f59e0b" />
                </View>
                <View style={styles.pointsInfo}>
                  <Text style={[styles.pointsTitle, { color: theme.colors.textSecondary }]}>Your Points</Text>
                  <Text style={styles.pointsValue}>{userPoints.toLocaleString()}</Text>
                </View>
                <View style={styles.pointsDecoration}>
                  <Sparkles size={32} color="rgba(245, 158, 11, 0.2)" />
                </View>
              </View>
              <Text style={[styles.pointsSubtitle, { color: theme.colors.textSecondary }]}>
                Keep tracking waste to earn more points!
              </Text>
            </LinearGradient>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="This Week"
              value={`+${Math.round(stats.weeklyWeight / 10)}`}
              subtitle="Points earned"
              color="#10b981"
              icon={<Star size={18} color="#10b981" />}
              compact
            />
            <StatsCard
              title="Total Earned"
              value={`${userPoints}`}
              subtitle="All time points"
              color="#f59e0b"
              icon={<Trophy size={18} color="#f59e0b" />}
              compact
            />
          </View>

          {/* Featured Reward */}
          {featuredReward && userPoints >= featuredReward.points && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured Reward</Text>
              <TouchableOpacity style={styles.featuredRewardCard}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredInfo}>
                      <View style={styles.featuredBadge}>
                        <Award size={16} color="#ffffff" />
                        <Text style={styles.featuredBadgeText}>FEATURED</Text>
                      </View>
                      <Text style={styles.featuredTitle}>{featuredReward.title}</Text>
                      <Text style={styles.featuredDescription}>{featuredReward.description}</Text>
                      <View style={styles.featuredPoints}>
                        <Star size={16} color="#ffffff" />
                        <Text style={styles.featuredPointsText}>{featuredReward.points} points</Text>
                      </View>
                    </View>
                    <Image source={{ uri: featuredReward.imageUrl }} style={styles.featuredImage} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Available Rewards */}
          {availableRewards.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Now</Text>
              <View style={styles.rewardsGrid}>
                {availableRewards.filter(r => !r.featured).map(reward => (
                  <TouchableOpacity key={reward.id} style={styles.rewardCard}>
                    <LinearGradient
                      colors={['#ffffff', '#f8fafc']}
                      style={styles.rewardGradient}
                    >
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
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Locked Rewards */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Unlock Next</Text>
            <View style={styles.rewardsGrid}>
              {lockedRewards.slice(0, 4).map(reward => (
                <View key={reward.id} style={[styles.rewardCard, styles.lockedCard]}>
                  <LinearGradient
                    colors={['#f1f5f9', '#e2e8f0']}
                    style={styles.rewardGradient}
                  >
                    <View style={styles.lockedOverlay}>
                      <Lock size={20} color="#64748b" />
                    </View>
                    <Image source={{ uri: reward.imageUrl }} style={[styles.rewardImage, styles.lockedImage]} />
                    <View style={styles.rewardContent}>
                      <Text style={[styles.rewardTitle, { color: theme.colors.textTertiary }]}>{reward.title}</Text>
                      <Text style={[styles.rewardDescription, { color: theme.colors.textTertiary }]}>{reward.description}</Text>
                      <View style={styles.rewardFooter}>
                        <View style={[styles.pointsBadge, styles.lockedBadge]}>
                          <Star size={12} color="#64748b" />
                          <Text style={[styles.pointsText, { color: '#64748b' }]}>{reward.points} pts</Text>
                        </View>
                        <Text style={styles.needPointsText}>
                          Need {reward.points - userPoints} more
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
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
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pointsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pointsCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  pointsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
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
    color: '#f59e0b',
  },
  pointsDecoration: {
    position: 'absolute',
    top: -10,
    right: 0,
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 16,
    color: '#ffffff',
  },
  featuredRewardCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredGradient: {
    padding: 24,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredInfo: {
    flex: 1,
    marginRight: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  featuredBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#ffffff',
  },
  featuredTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 4,
  },
  featuredDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  featuredPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredPointsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  featuredImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedCard: {
    position: 'relative',
  },
  rewardGradient: {
    padding: 16,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rewardImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  lockedImage: {
    opacity: 0.5,
  },
  rewardContent: {
    gap: 8,
  },
  rewardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  rewardDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  rewardFooter: {
    gap: 6,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  lockedBadge: {
    backgroundColor: '#f1f5f9',
  },
  pointsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#f59e0b',
  },
  needPointsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#64748b',
  },
  bottomSpacing: {
    height: 140,
  },
});