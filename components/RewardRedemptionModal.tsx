import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Reward, ShippingAddress } from '@/types/rewards';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Star, Package, Truck, Gift, Sparkles, CircleCheck as CheckCircle } from 'lucide-react-native';
import { RewardsService } from '@/services/rewards';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated';

interface RewardRedemptionModalProps {
  visible: boolean;
  reward: Reward | null;
  userPoints: number;
  onClose: () => void;
  onRedeem: (reward: Reward, address: ShippingAddress) => void;
}

export function RewardRedemptionModal({ 
  visible, 
  reward, 
  userPoints, 
  onClose, 
  onRedeem 
}: RewardRedemptionModalProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<'details' | 'address' | 'celebration'>('details');
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  // Animation values
  const celebrationScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  if (!reward) return null;

  const canAfford = userPoints >= reward.pointsCost;

  const handleContinue = () => {
    if (!canAfford) {
      Alert.alert('Insufficient Points', `You need ${reward.pointsCost - userPoints} more points to redeem this reward.`);
      return;
    }
    setStep('address');
  };

  const handleRedeem = () => {
    const validation = RewardsService.validateShippingAddress(address);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors([]);
    setStep('celebration');
    
    // Start celebration animation
    celebrationScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    sparkleOpacity.value = withDelay(300, withSequence(
      withSpring(1),
      withSpring(0.7),
      withSpring(1)
    ));
    contentOpacity.value = withDelay(600, withSpring(1));
    
    // Call the redeem function after a short delay
    setTimeout(() => {
      onRedeem(reward, address);
    }, 2000);
  };

  const handleClose = () => {
    setStep('details');
    setAddress({
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phoneNumber: ''
    });
    setErrors([]);
    celebrationScale.value = 0;
    sparkleOpacity.value = 0;
    contentOpacity.value = 0;
    onClose();
  };

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        color={i < rating ? '#f59e0b' : theme.colors.border}
        fill={i < rating ? '#f59e0b' : 'transparent'}
      />
    ));
  };

  const renderDetailsStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Reward Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: reward.imageUrl }} style={styles.rewardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.imageOverlay}
        />
      </View>

      {/* Reward Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleSection}>
          <Text style={[styles.rewardTitle, { color: theme.colors.text }]}>
            {reward.title}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStars(reward.popularity)}
            <Text style={[styles.ratingText, { color: theme.colors.textTertiary }]}>
              ({reward.popularity}/5)
            </Text>
          </View>
        </View>

        <Text style={[styles.rewardDescription, { color: theme.colors.textSecondary }]}>
          {reward.description}
        </Text>

        {/* Value and Delivery */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Gift size={16} color={theme.colors.success} />
            <Text style={[styles.infoText, { color: theme.colors.success }]}>
              {reward.value}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Truck size={16} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {reward.estimatedDelivery}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
            What's Included:
          </Text>
          {reward.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <CheckCircle size={16} color={theme.colors.success} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Points Cost */}
        <View style={[styles.costContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.costInfo}>
            <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              Redemption Cost
            </Text>
            <View style={styles.pointsRow}>
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
              <Text style={[styles.costPoints, { color: theme.colors.text }]}>
                {reward.pointsCost} points
              </Text>
            </View>
          </View>
          <View style={styles.balanceInfo}>
            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              Your Balance
            </Text>
            <Text style={[
              styles.balancePoints,
              { color: canAfford ? theme.colors.success : '#ef4444' }
            ]}>
              {userPoints} points
            </Text>
          </View>
        </View>

        {!canAfford && (
          <View style={styles.insufficientContainer}>
            <Text style={[styles.insufficientText, { color: '#ef4444' }]}>
              You need {reward.pointsCost - userPoints} more points to redeem this reward.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderAddressStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.addressContainer}>
        <Text style={[styles.addressTitle, { color: theme.colors.text }]}>
          Shipping Information
        </Text>
        <Text style={[styles.addressSubtitle, { color: theme.colors.textSecondary }]}>
          We'll ship your reward to this address within {reward.estimatedDelivery}.
        </Text>

        {errors.length > 0 && (
          <View style={styles.errorsContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={[styles.errorText, { color: '#ef4444' }]}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Full Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={address.fullName}
              onChangeText={(text) => setAddress(prev => ({ ...prev, fullName: text }))}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Address Line 1 *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={address.addressLine1}
              onChangeText={(text) => setAddress(prev => ({ ...prev, addressLine1: text }))}
              placeholder="Street address"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Address Line 2</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={address.addressLine2}
              onChangeText={(text) => setAddress(prev => ({ ...prev, addressLine2: text }))}
              placeholder="Apartment, suite, etc. (optional)"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>City *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={address.city}
                onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
                placeholder="City"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>State *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={address.state}
                onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
                placeholder="State"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>ZIP Code *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={address.zipCode}
                onChangeText={(text) => setAddress(prev => ({ ...prev, zipCode: text }))}
                placeholder="12345"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Country *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={address.country}
                onChangeText={(text) => setAddress(prev => ({ ...prev, country: text }))}
                placeholder="Country"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={address.phoneNumber}
              onChangeText={(text) => setAddress(prev => ({ ...prev, phoneNumber: text }))}
              placeholder="(555) 123-4567 (optional)"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCelebrationStep = () => (
    <View style={styles.celebrationContainer}>
      {/* Success Animation */}
      <View style={styles.animationContainer}>
        <Animated.View style={[styles.celebrationIcon, celebrationAnimatedStyle]}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.celebrationGradient}
          >
            <Gift size={48} color="#ffffff" strokeWidth={2} />
          </LinearGradient>
        </Animated.View>

        {/* Sparkles */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleAnimatedStyle]}>
          <Sparkles size={20} color="#f59e0b" />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle2, sparkleAnimatedStyle]}>
          <Sparkles size={16} color="#3b82f6" />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleAnimatedStyle]}>
          <Sparkles size={18} color="#8b5cf6" />
        </Animated.View>
      </View>

      {/* Celebration Content */}
      <Animated.View style={[styles.celebrationContent, contentAnimatedStyle]}>
        <Text style={[styles.celebrationTitle, { color: theme.colors.text }]}>
          Reward Redeemed! 🎉
        </Text>
        <Text style={[styles.celebrationSubtitle, { color: theme.colors.textSecondary }]}>
          Your {reward.title} will be shipped to you within {reward.estimatedDelivery}.
        </Text>

        <View style={[styles.celebrationDetails, { backgroundColor: theme.colors.background }]}>
          <View style={styles.celebrationRow}>
            <Text style={[styles.celebrationLabel, { color: theme.colors.textSecondary }]}>
              Points Used:
            </Text>
            <View style={styles.celebrationPoints}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Text style={[styles.celebrationValue, { color: theme.colors.text }]}>
                {reward.pointsCost}
              </Text>
            </View>
          </View>
          
          <View style={styles.celebrationRow}>
            <Text style={[styles.celebrationLabel, { color: theme.colors.textSecondary }]}>
              Remaining Balance:
            </Text>
            <Text style={[styles.celebrationValue, { color: theme.colors.success }]}>
              {userPoints - reward.pointsCost} points
            </Text>
          </View>
          
          <View style={styles.celebrationRow}>
            <Text style={[styles.celebrationLabel, { color: theme.colors.textSecondary }]}>
              Estimated Delivery:
            </Text>
            <Text style={[styles.celebrationValue, { color: theme.colors.text }]}>
              {reward.estimatedDelivery}
            </Text>
          </View>
        </View>

        <Text style={[styles.celebrationNote, { color: theme.colors.textTertiary }]}>
          You'll receive a confirmation email with tracking information once your order ships.
        </Text>
      </Animated.View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {step === 'details' ? 'Reward Details' : 
             step === 'address' ? 'Shipping Address' : 
             'Success!'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {step === 'details' && renderDetailsStep()}
          {step === 'address' && renderAddressStep()}
          {step === 'celebration' && renderCelebrationStep()}
        </View>

        {/* Footer */}
        {step !== 'celebration' && (
          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            {step === 'address' && (
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => setStep('details')}
              >
                <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: canAfford ? theme.colors.text : theme.colors.border },
                step === 'address' && styles.flexButton
              ]}
              onPress={step === 'details' ? handleContinue : handleRedeem}
              disabled={!canAfford}
            >
              <Text style={[
                styles.actionButtonText,
                { color: canAfford ? theme.colors.surface : theme.colors.textTertiary }
              ]}>
                {step === 'details' ? 'Continue' : 'Redeem Reward'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Details Step
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  detailsContainer: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  rewardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  rewardDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  costInfo: {
    flex: 1,
  },
  costLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costPoints: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  balancePoints: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  insufficientContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  insufficientText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Address Step
  addressContainer: {
    padding: 20,
  },
  addressTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  addressSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  errorsContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Celebration Step
  celebrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
    marginBottom: 40,
  },
  celebrationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  celebrationGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 20,
    right: 20,
  },
  sparkle2: {
    bottom: 30,
    left: 30,
  },
  sparkle3: {
    top: 60,
    left: 20,
  },
  celebrationContent: {
    alignItems: 'center',
    width: '100%',
  },
  celebrationTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
  },
  celebrationSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  celebrationDetails: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  celebrationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  celebrationLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  celebrationPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  celebrationValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  celebrationNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  actionButton: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  flexButton: {
    flex: 2,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});