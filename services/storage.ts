import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { WasteEntry, WasteGoal } from '@/types/waste';

const ITEMS_KEY = 'waste_items';
const GOALS_KEY = 'waste_goals';
const GUIDELINES_SEEN_KEY = 'guidelines_seen';

// Web fallback using localStorage
const webStorage = {
  async setItem(key: string, value: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async deleteItem(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

// Platform-specific storage
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

export class StorageService {
  static async saveItems(items: WasteEntry[]): Promise<void> {
    try {
      const serializedItems = JSON.stringify(items.map(item => ({
        ...item,
        timestamp: item.timestamp.toISOString()
      })));
      await storage.setItem(ITEMS_KEY, serializedItems);
      console.log('💾 [StorageService] Saved', items.length, 'items to storage');
    } catch (error) {
      console.error('❌ [StorageService] Failed to save items:', error);
    }
  }

  static async loadItems(): Promise<WasteEntry[]> {
    try {
      const serializedItems = await storage.getItem(ITEMS_KEY);
      if (!serializedItems) {
        console.log('📂 [StorageService] No items found in storage');
        return [];
      }

      const parsedItems = JSON.parse(serializedItems);
      const items = parsedItems.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));

      console.log('📂 [StorageService] Loaded', items.length, 'items from storage');
      return items;
    } catch (error) {
      console.error('❌ [StorageService] Failed to load items:', error);
      return [];
    }
  }

  static async saveGoals(goals: WasteGoal[]): Promise<void> {
    try {
      const serializedGoals = JSON.stringify(goals.map(goal => ({
        ...goal,
        startDate: goal.startDate.toISOString(),
        endDate: goal.endDate.toISOString()
      })));
      await storage.setItem(GOALS_KEY, serializedGoals);
      console.log('🎯 [StorageService] Saved', goals.length, 'goals to storage');
    } catch (error) {
      console.error('❌ [StorageService] Failed to save goals:', error);
    }
  }

  static async loadGoals(): Promise<WasteGoal[]> {
    try {
      const serializedGoals = await storage.getItem(GOALS_KEY);
      if (!serializedGoals) {
        console.log('🎯 [StorageService] No goals found in storage, using defaults');
        return [];
      }

      const parsedGoals = JSON.parse(serializedGoals);
      const goals = parsedGoals.map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate)
      }));

      console.log('🎯 [StorageService] Loaded', goals.length, 'goals from storage');
      return goals;
    } catch (error) {
      console.error('❌ [StorageService] Failed to load goals:', error);
      return [];
    }
  }

  static async setGuidelinesSeen(): Promise<void> {
    try {
      await storage.setItem(GUIDELINES_SEEN_KEY, 'true');
      console.log('📋 [StorageService] Marked guidelines as seen');
    } catch (error) {
      console.error('❌ [StorageService] Failed to save guidelines seen status:', error);
    }
  }

  static async hasSeenGuidelines(): Promise<boolean> {
    try {
      const seen = await storage.getItem(GUIDELINES_SEEN_KEY);
      const hasSeen = seen === 'true';
      console.log('📋 [StorageService] Guidelines seen status:', hasSeen);
      return hasSeen;
    } catch (error) {
      console.error('❌ [StorageService] Failed to load guidelines seen status:', error);
      return false;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await storage.deleteItem(ITEMS_KEY);
      await storage.deleteItem(GOALS_KEY);
      await storage.deleteItem(GUIDELINES_SEEN_KEY);
      console.log('🗑️ [StorageService] Cleared all data from storage');
    } catch (error) {
      console.error('❌ [StorageService] Failed to clear data:', error);
    }
  }
}