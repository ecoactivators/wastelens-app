import { Reward, UserReward, ShippingAddress } from '@/types/rewards';

export class RewardsService {
  /**
   * Get available rewards
   */
  static getAvailableRewards(): Reward[] {
    return [
      {
        id: 'eco-water-bottle',
        title: 'Eco Water Bottle',
        description: 'Premium stainless steel water bottle made from recycled materials',
        pointsCost: 500,
        category: 'eco',
        imageUrl: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg',
        available: true,
        inStock: 25,
        estimatedDelivery: '5-7 business days',
        features: [
          '500ml capacity',
          'Made from recycled stainless steel',
          'Keeps drinks cold for 24 hours',
          'BPA-free and leak-proof',
          'Dishwasher safe'
        ],
        value: '$35 value',
        popularity: 5
      },
      {
        id: 'reusable-mesh-bags',
        title: 'Reusable Mesh Bags Set',
        description: 'Set of 3 organic cotton mesh bags for plastic-free shopping',
        pointsCost: 300,
        category: 'eco',
        imageUrl: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg',
        available: true,
        inStock: 50,
        estimatedDelivery: '3-5 business days',
        features: [
          'Set of 3 different sizes',
          '100% organic cotton',
          'Machine washable',
          'Drawstring closure',
          'Perfect for fruits and vegetables'
        ],
        value: '$25 value',
        popularity: 4
      },
      {
        id: 'organic-coffee-beans',
        title: 'Organic Coffee Beans',
        description: 'Fair-trade organic coffee beans from sustainable farms',
        pointsCost: 600,
        category: 'premium',
        imageUrl: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg',
        available: true,
        inStock: 20,
        estimatedDelivery: '3-5 business days',
        features: [
          '1lb bag of premium beans',
          'Fair-trade certified',
          'Organic and sustainably grown',
          'Medium roast profile',
          'Freshly roasted to order'
        ],
        value: '$40 value',
        popularity: 5
      }
    ];
  }
  
  /**
   * Get reward by ID
   */
  static getRewardById(rewardId: string): Reward | null {
    const rewards = this.getAvailableRewards();
    return rewards.find(reward => reward.id === rewardId) || null;
  }
  
  /**
   * Check if user can afford reward
   */
  static canAffordReward(userPoints: number, rewardCost: number): boolean {
    return userPoints >= rewardCost;
  }
  
  /**
   * Validate shipping address
   */
  static validateShippingAddress(address: ShippingAddress): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!address.fullName?.trim()) {
      errors.push('Full name is required');
    }
    
    if (!address.addressLine1?.trim()) {
      errors.push('Address line 1 is required');
    }
    
    if (!address.city?.trim()) {
      errors.push('City is required');
    }
    
    if (!address.state?.trim()) {
      errors.push('State is required');
    }
    
    if (!address.zipCode?.trim()) {
      errors.push('ZIP code is required');
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zipCode.trim())) {
      errors.push('Invalid ZIP code format');
    }
    
    if (!address.country?.trim()) {
      errors.push('Country is required');
    }
    
    if (address.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(address.phoneNumber)) {
      errors.push('Invalid phone number format');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Calculate estimated delivery date
   */
  static calculateDeliveryDate(deliveryTimeframe: string): Date {
    const today = new Date();
    const deliveryDate = new Date(today);
    
    // Parse delivery timeframe (e.g., "5-7 business days")
    const match = deliveryTimeframe.match(/(\d+)-(\d+)\s+business\s+days/i);
    if (match) {
      const maxDays = parseInt(match[2]);
      // Add business days (skip weekends)
      let daysAdded = 0;
      while (daysAdded < maxDays) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        // Skip weekends
        if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
          daysAdded++;
        }
      }
    } else {
      // Fallback: add 7 days
      deliveryDate.setDate(deliveryDate.getDate() + 7);
    }
    
    return deliveryDate;
  }
  
  /**
   * Generate tracking number
   */
  static generateTrackingNumber(): string {
    const prefix = 'WL';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}