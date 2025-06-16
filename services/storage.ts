import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { WasteEntry, WasteGoal } from '@/types/waste';

const ITEMS_KEY = 'waste_items';
const GOALS_KEY = 'waste_goals';
const GUIDELINES_SEEN_KEY = 'guidelines_seen';

// Web fallback using localStorage with error handling
const webStorage = {
  async setItem(key: string, value: string) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        console.log('💾 [WebStorage] Saved item:', key);
      } else {
        console.warn('⚠️ [WebStorage] localStorage not available');
      }
    } catch (error) {
      console.error('❌ [WebStorage] Failed to save item:', key, error);
      throw new Error('Failed to save data to local storage');
    }
  },
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        console.log('📂 [WebStorage] Retrieved item:', key, item ? 'found' : 'not found');
        return item;
      } else {
        console.warn('⚠️ [WebStorage] localStorage not available');
        return null;
      }
    } catch (error) {
      console.error('❌ [WebStorage] Failed to get item:', key, error);
      return null;
    }
  },
  async deleteItem(key: string) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        console.log('🗑️ [WebStorage] Deleted item:', key);
      } else {
        console.warn('⚠️ [WebStorage] localStorage not available');
      }
    } catch (error) {
      console.error('❌ [WebStorage] Failed to delete item:', key, error);
      throw new Error('Failed to delete data from local storage');
    }
  }
};

// Native storage adapter for SecureStore with error handling
const nativeStorage = {
  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log('💾 [NativeStorage] Saved item:', key);
    } catch (error) {
      console.error('❌ [NativeStorage] Failed to save item:', key, error);
      throw new Error('Failed to save data to secure storage');
    }
  },
  async getItem(key: string): Promise<string | null> {
    try {
      const item = await SecureStore.getItemAsync(key);
      console.log('📂 [NativeStorage] Retrieved item:', key, item ? 'found' : 'not found');
      return item;
    } catch (error) {
      console.error('❌ [NativeStorage] Failed to get item:', key, error);
      return null;
    }
  },
  async deleteItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log('🗑️ [NativeStorage] Deleted item:', key);
    } catch (error) {
      console.error('❌ [NativeStorage] Failed to delete item:', key, error);
      throw new Error('Failed to delete data from secure storage');
    }
  }
};

// Platform-specific storage
const storage = Platform.OS === 'web' ? webStorage : nativeStorage;

export class StorageService {
  static async saveItems(items: WasteEntry[]): Promise<void> {
    try {
      if (!Array.isArray(items)) {
        console.warn('⚠️ [StorageService] Items is not an array, converting...');
        items = [];
      }

      const serializedItems = JSON.stringify(items.map(item => {
        try {
          return {
            ...item,
            timestamp: item.timestamp instanceof Date ? item.timestamp.toISOString() : new Date().toISOString()
          };
        } catch (error) {
          console.error('❌ [StorageService] Error serializing item:', item, error);
          return null;
        }
      }).filter(item => item !== null));

      await storage.setItem(ITEMS_KEY, serializedItems);
      console.log('💾 [StorageService] Saved', items.length, 'items to storage');
    } catch (error) {
      console.error('❌ [StorageService] Failed to save items:', error);
      // Don't throw error to prevent app crashes
    }
  }

  static async loadItems(): Promise<WasteEntry[]> {
    try {
      const serializedItems = await storage.getItem(ITEMS_KEY);
      if (!serializedItems) {
        console.log('📂 [StorageService] No items found in storage');
        return [];
      }

      let parsedItems;
      try {
        parsedItems = JSON.parse(serializedItems);
      } catch (parseError) {
        console.error('❌ [StorageService] Failed to parse items JSON:', parseError);
        console.log('🔄 [StorageService] Clearing corrupted items data');
        await storage.deleteItem(ITEMS_KEY);
        return [];
      }

      if (!Array.isArray(parsedItems)) {
        console.warn('⚠️ [StorageService] Parsed items is not an array');
        return [];
      }

      const items = parsedItems.map((item: any) => {
        try {
          return {
            ...item,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
          };
        } catch (error) {
          console.error('❌ [StorageService] Error deserializing item:', item, error);
          return null;
        }
      }).filter((item: any) => item !== null);

      console.log('📂 [StorageService] Loaded', items.length, 'items from storage');
      return items;
    } catch (error) {
      console.error('❌ [StorageService] Failed to load items:', error);
      return [];
    }
  }

  static async saveGoals(goals: WasteGoal[]): Promise<void> {
    try {
      if (!Array.isArray(goals)) {
        console.warn('⚠️ [StorageService] Goals is not an array, converting...');
        goals = [];
      }

      const serializedGoals = JSON.stringify(goals.map(goal => {
        try {
          return {
            ...goal,
            startDate: goal.startDate instanceof Date ? goal.startDate.toISOString() : new Date().toISOString(),
            endDate: goal.endDate instanceof Date ? goal.endDate.toISOString() : new Date().toISOString()
          };
        } catch (error) {
          console.error('❌ [StorageService] Error serializing goal:', goal, error);
          return null;
        }
      }).filter(goal => goal !== null));

      await storage.setItem(GOALS_KEY, serializedGoals);
      console.log('🎯 [StorageService] Saved', goals.length, 'goals to storage');
    } catch (error) {
      console.error('❌ [StorageService] Failed to save goals:', error);
      // Don't throw error to prevent app crashes
    }
  }

  static async loadGoals(): Promise<WasteGoal[]> {
    try {
      const serializedGoals = await storage.getItem(GOALS_KEY);
      if (!serializedGoals) {
        console.log('🎯 [StorageService] No goals found in storage, using defaults');
        return [];
      }

      let parsedGoals;
      try {
        parsedGoals = JSON.parse(serializedGoals);
      } catch (parseError) {
        console.error('❌ [StorageService] Failed to parse goals JSON:', parseError);
        console.log('🔄 [StorageService] Clearing corrupted goals data');
        await storage.deleteItem(GOALS_KEY);
        return [];
      }

      if (!Array.isArray(parsedGoals)) {
        console.warn('⚠️ [StorageService] Parsed goals is not an array');
        return [];
      }

      const goals = parsedGoals.map((goal: any) => {
        try {
          return {
            ...goal,
            startDate: goal.startDate ? new Date(goal.startDate) : new Date(),
            endDate: goal.endDate ? new Date(goal.endDate) : new Date()
          };
        } catch (error) {
          console.error('❌ [StorageService] Error deserializing goal:', goal, error);
          return null;
        }
      }).filter((goal: any) => goal !== null);

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
      // Don't throw error to prevent app crashes
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
      await Promise.all([
        storage.deleteItem(ITEMS_KEY),
        storage.deleteItem(GOALS_KEY),
        storage.deleteItem(GUIDELINES_SEEN_KEY)
      ]);
      console.log('🗑️ [StorageService] Cleared all data from storage');
    } catch (error) {
      console.error('❌ [StorageService] Failed to clear data:', error);
      // Don't throw error to prevent app crashes
    }
  }

  // Health check method to verify storage is working
  static async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health_check_test';
      const testValue = 'test_value';
      
      await storage.setItem(testKey, testValue);
      const retrievedValue = await storage.getItem(testKey);
      await storage.deleteItem(testKey);
      
      const isHealthy = retrievedValue === testValue;
      console.log('🏥 [StorageService] Health check:', isHealthy ? 'PASS' : 'FAIL');
      return isHealthy;
    } catch (error) {
      console.error('❌ [StorageService] Health check failed:', error);
      return false;
    }
  }
}