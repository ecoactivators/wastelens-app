import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Reward } from '@/types/rewards';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Package, Clock } from 'lucide-react-native';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onPress: () => void;
}

export function RewardCard({ reward, userPoints, onPress }: RewardCardProps) {
  const { theme } = useTheme();
  
  const canAfford = userPoints >= reward.pointsCost;
  const isLocked = !reward.available || reward.inStock <= 0;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'eco': return '#10b981';
      case 'premium': return '#8b5cf6';
      case 'experience': return '#3b82f6';
      case 'discount': return '#f59e0b';
      default: return theme.colors.textSecondary;
    }
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < rating ? '#f59e0b' : theme.colors.border}
        fill={i < rating ? '#f59e0b' : 'transparent'}
      />
    ));
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
        isLocked && styles.lockedContainer
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLocked}
    >
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceElevated]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: reward.imageUrl }} style={styles.image} />
            {!canAfford && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>Need {reward.pointsCost - userPoints} more points</Text>
              </View>
            )}
            {isLocked && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>Out of Stock</Text>
              </View>
            )}
          </View>
          
          {/* Content */}
          <View style={styles.details}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleSection}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
                  {reward.title}
                </Text>
                <View style={styles.ratingContainer}>
                  {renderStars(reward.popularity)}
                  <Text style={[styles.ratingText, { color: theme.colors.textTertiary }]}>
                    ({reward.popularity})
                  </Text>
                </View>
              </View>
              
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(reward.category) + '20' }]}>
                <Text style={[styles.categoryText, { color: getCategoryColor(reward.category) }]}>
                  {reward.category.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {/* Description */}
            <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {reward.description}
            </Text>
            
            {/* Features */}
            <View style={styles.featuresContainer}>
              {reward.features.slice(0, 2).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.featureText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {feature}
                  </Text>
                </View>
              ))}
              {reward.features.length > 2 && (
                <Text style={[styles.moreFeatures, { color: theme.colors.textTertiary }]}>
                  +{reward.features.length - 2} more features
                </Text>
              )}
            </View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.valueSection}>
                <Text style={[styles.value, { color: theme.colors.success }]}>
                  {reward.value}
                </Text>
                <View style={styles.deliveryInfo}>
                  <Clock size={12} color={theme.colors.textTertiary} />
                  <Text style={[styles.deliveryText, { color: theme.colors.textTertiary }]}>
                    {reward.estimatedDelivery}
                  </Text>
                </View>
              </View>
              
              <View style={styles.pointsSection}>
                <View style={styles.pointsContainer}>
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <Text style={[
                    styles.pointsCost,
                    { color: canAfford ? theme.colors.text : '#ef4444' }
                  ]}>
                    {reward.pointsCost}
                  </Text>
                </View>
                
                <View style={styles.stockInfo}>
                  <Package size={12} color={theme.colors.textTertiary} />
                  <Text style={[styles.stockText, { color: theme.colors.textTertiary }]}>
                    {reward.inStock} left
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
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
  lockedContainer: {
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  overlayText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 16,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    letterSpacing: 0.1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  featuresContainer: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  featureText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    flex: 1,
    letterSpacing: 0.1,
  },
  moreFeatures: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  valueSection: {
    flex: 1,
  },
  value: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    letterSpacing: 0.1,
  },
  pointsSection: {
    alignItems: 'flex-end',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pointsCost: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    letterSpacing: 0.1,
  },
});