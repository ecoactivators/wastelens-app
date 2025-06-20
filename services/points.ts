import { WasteEntry, WasteType, WasteCategory } from '@/types/waste';
import { Quest, UserPoints } from '@/types/rewards';

export class PointsService {
  /**
   * Calculate points earned from a waste item scan
   */
  static calculatePointsFromScan(wasteEntry: WasteEntry): number {
    let basePoints = 0;
    
    // Base points from weight (1 point per 10g)
    basePoints += Math.floor(wasteEntry.weight / 10);
    
    // Bonus points for disposal method
    if (wasteEntry.recyclable) {
      basePoints += 5; // Recycling bonus
    }
    
    if (wasteEntry.compostable) {
      basePoints += 8; // Composting bonus (higher environmental impact)
    }
    
    // Bonus points for special waste types that require effort
    switch (wasteEntry.type) {
      case WasteType.ELECTRONIC:
        basePoints += 15; // Electronics recycling requires special handling
        break;
      case WasteType.BATTERIES:
        basePoints += 12; // Battery disposal requires special handling
        break;
      case WasteType.HAZARDOUS:
        basePoints += 20; // Hazardous waste disposal is most important
        break;
      case WasteType.TEXTILE:
        basePoints += 8; // Textile recycling/donation
        break;
      case WasteType.PLASTIC_FILM:
        basePoints += 6; // Plastic film recycling requires special bins
        break;
      default:
        basePoints += 2; // Standard bonus for any scan
    }
    
    // Environmental score multiplier
    if (wasteEntry.aiAnalysis?.environmentScore) {
      const scoreMultiplier = wasteEntry.aiAnalysis.environmentScore / 10;
      basePoints = Math.floor(basePoints * (1 + scoreMultiplier * 0.5));
    }
    
    // Minimum 3 points per scan to keep users engaged
    return Math.max(basePoints, 3);
  }
  
  /**
   * Calculate streak bonus points
   */
  static calculateStreakBonus(streakDays: number): number {
    if (streakDays < 3) return 0;
    if (streakDays < 7) return 5;
    if (streakDays < 14) return 10;
    if (streakDays < 30) return 20;
    return 30; // 30+ day streak
  }
  
  /**
   * Get user's rank based on lifetime points
   */
  static getUserRank(lifetimePoints: number): string {
    if (lifetimePoints < 100) return 'Eco Beginner';
    if (lifetimePoints < 500) return 'Waste Warrior';
    if (lifetimePoints < 1000) return 'Green Guardian';
    if (lifetimePoints < 2500) return 'Sustainability Star';
    if (lifetimePoints < 5000) return 'Environmental Expert';
    if (lifetimePoints < 10000) return 'Planet Protector';
    return 'Eco Legend';
  }
  
  /**
   * Generate daily quests based on user's activity
   */
  static generateDailyQuests(userStats: any): Quest[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return [
      {
        id: `daily-scan-${today.toDateString()}`,
        title: 'Daily Scanner',
        description: 'Scan 3 waste items today',
        type: 'daily',
        category: 'scanning',
        target: 3,
        progress: Math.min(userStats?.todayScans || 0, 3),
        pointsReward: 25,
        completed: (userStats?.todayScans || 0) >= 3,
        expiresAt: tomorrow,
        icon: '📸',
        color: '#3b82f6',
        difficulty: 'easy'
      },
      {
        id: `daily-recycle-${today.toDateString()}`,
        title: 'Recycling Hero',
        description: 'Scan 2 recyclable items',
        type: 'daily',
        category: 'environmental',
        target: 2,
        progress: Math.min(userStats?.todayRecyclable || 0, 2),
        pointsReward: 35,
        completed: (userStats?.todayRecyclable || 0) >= 2,
        expiresAt: tomorrow,
        icon: '♻️',
        color: '#10b981',
        difficulty: 'medium'
      },
      {
        id: `daily-weight-${today.toDateString()}`,
        title: 'Weight Tracker',
        description: 'Scan 100g of waste',
        type: 'daily',
        category: 'scanning',
        target: 100,
        progress: Math.min(userStats?.todayWeight || 0, 100),
        pointsReward: 20,
        completed: (userStats?.todayWeight || 0) >= 100,
        expiresAt: tomorrow,
        icon: '⚖️',
        color: '#f59e0b',
        difficulty: 'easy'
      }
    ];
  }
  
  /**
   * Generate weekly quests
   */
  static generateWeeklyQuests(userStats: any): Quest[] {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + (7 - today.getDay()));
    nextWeek.setHours(0, 0, 0, 0);
    
    return [
      {
        id: `weekly-streak-${today.getFullYear()}-${today.getMonth()}-${Math.floor(today.getDate() / 7)}`,
        title: 'Streak Master',
        description: 'Maintain a 7-day scanning streak',
        type: 'weekly',
        category: 'streak',
        target: 7,
        progress: Math.min(userStats?.streak || 0, 7),
        pointsReward: 100,
        completed: (userStats?.streak || 0) >= 7,
        expiresAt: nextWeek,
        icon: '🔥',
        color: '#ef4444',
        difficulty: 'hard'
      },
      {
        id: `weekly-variety-${today.getFullYear()}-${today.getMonth()}-${Math.floor(today.getDate() / 7)}`,
        title: 'Waste Variety',
        description: 'Scan 5 different waste types',
        type: 'weekly',
        category: 'scanning',
        target: 5,
        progress: Math.min(userStats?.weeklyWasteTypes || 0, 5),
        pointsReward: 75,
        completed: (userStats?.weeklyWasteTypes || 0) >= 5,
        expiresAt: nextWeek,
        icon: '🌈',
        color: '#8b5cf6',
        difficulty: 'medium'
      },
      {
        id: `weekly-environmental-${today.getFullYear()}-${today.getMonth()}-${Math.floor(today.getDate() / 7)}`,
        title: 'Environmental Champion',
        description: 'Achieve average environmental score of 7+',
        type: 'weekly',
        category: 'environmental',
        target: 7,
        progress: Math.min(userStats?.weeklyAvgEnvScore || 0, 7),
        pointsReward: 120,
        completed: (userStats?.weeklyAvgEnvScore || 0) >= 7,
        expiresAt: nextWeek,
        icon: '🌱',
        color: '#16a34a',
        difficulty: 'hard'
      }
    ];
  }
  
  /**
   * Generate milestone quests
   */
  static generateMilestoneQuests(userStats: any): Quest[] {
    const milestones = [];
    
    // Total scans milestones
    const totalScans = userStats?.totalScans || 0;
    const scanMilestones = [10, 25, 50, 100, 250, 500, 1000];
    
    for (const milestone of scanMilestones) {
      if (totalScans < milestone) {
        milestones.push({
          id: `milestone-scans-${milestone}`,
          title: `${milestone} Scans`,
          description: `Reach ${milestone} total scans`,
          type: 'milestone' as const,
          category: 'scanning' as const,
          target: milestone,
          progress: totalScans,
          pointsReward: milestone * 2,
          completed: false,
          icon: '🎯',
          color: '#3b82f6',
          difficulty: milestone <= 50 ? 'easy' : milestone <= 250 ? 'medium' : 'hard'
        });
        break; // Only show next milestone
      }
    }
    
    // Weight milestones
    const totalWeight = userStats?.totalWeight || 0;
    const weightMilestones = [500, 1000, 2500, 5000, 10000]; // in grams
    
    for (const milestone of weightMilestones) {
      if (totalWeight < milestone) {
        milestones.push({
          id: `milestone-weight-${milestone}`,
          title: `${milestone}g Tracked`,
          description: `Track ${milestone}g of waste`,
          type: 'milestone' as const,
          category: 'scanning' as const,
          target: milestone,
          progress: totalWeight,
          pointsReward: Math.floor(milestone / 10),
          completed: false,
          icon: '⚖️',
          color: '#f59e0b',
          difficulty: milestone <= 1000 ? 'easy' : milestone <= 5000 ? 'medium' : 'hard'
        });
        break;
      }
    }
    
    return milestones;
  }
  
  /**
   * Check if quest is completed and award points
   */
  static checkQuestCompletion(quest: Quest, userStats: any): { completed: boolean; pointsAwarded: number } {
    let progress = 0;
    
    switch (quest.category) {
      case 'scanning':
        if (quest.title.includes('Daily Scanner')) {
          progress = userStats?.todayScans || 0;
        } else if (quest.title.includes('Weight')) {
          progress = userStats?.todayWeight || 0;
        } else if (quest.title.includes('Variety')) {
          progress = userStats?.weeklyWasteTypes || 0;
        } else if (quest.title.includes('total scans')) {
          progress = userStats?.totalScans || 0;
        }
        break;
      case 'environmental':
        if (quest.title.includes('Recycling')) {
          progress = userStats?.todayRecyclable || 0;
        } else if (quest.title.includes('Environmental Champion')) {
          progress = userStats?.weeklyAvgEnvScore || 0;
        }
        break;
      case 'streak':
        progress = userStats?.streak || 0;
        break;
    }
    
    const wasCompleted = quest.completed;
    const isNowCompleted = progress >= quest.target;
    
    if (!wasCompleted && isNowCompleted) {
      return { completed: true, pointsAwarded: quest.pointsReward };
    }
    
    return { completed: isNowCompleted, pointsAwarded: 0 };
  }
}