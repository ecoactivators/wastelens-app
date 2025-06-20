export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'milestone';
  category: 'scanning' | 'environmental' | 'streak' | 'special';
  target: number;
  progress: number;
  pointsReward: number;
  completed: boolean;
  completedAt?: Date;
  expiresAt?: Date;
  icon: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'eco' | 'discount' | 'experience' | 'premium';
  imageUrl: string;
  available: boolean;
  inStock: number;
  estimatedDelivery: string;
  features: string[];
  value: string; // e.g., "$25 value"
  popularity: number; // 1-5 stars
}

export interface UserReward {
  id: string;
  rewardId: string;
  userId: string;
  redeemedAt: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  shippingAddress: ShippingAddress;
  estimatedDelivery: Date;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
}

export interface UserPoints {
  totalEarned: number;
  currentBalance: number;
  totalSpent: number;
  lifetimeRank: string;
  weeklyEarned: number;
  monthlyEarned: number;
}