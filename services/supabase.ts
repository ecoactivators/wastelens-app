import { supabase } from '@/lib/supabase';
import { WasteEntry, WasteType, WasteCategory } from '@/types/waste';
import { LocationService } from './location';

export interface SupabaseWasteItem {
  id: string;
  user_id: string;
  item_name: string;
  description?: string;
  waste_type: string;
  waste_category: string;
  weight_grams: number;
  quantity: number;
  image_url?: string;
  ai_material?: string;
  ai_environment_score?: number;
  ai_confidence?: number;
  ai_carbon_footprint?: number;
  ai_suggestions?: any[];
  ai_map_suggestions?: any[];
  recyclable: boolean;
  compostable: boolean;
  scan_location_city?: string;
  scan_location_region?: string;
  scan_location_country?: string;
  scan_latitude?: number;
  scan_longitude?: number;
  scanned_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  location_city?: string;
  location_region?: string;
  location_country?: string;
  onboarding_completed: boolean;
  guidelines_seen: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_items_scanned: number;
  total_weight_grams: number;
  total_co2_saved: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_scan_date?: string;
  current_week_grams: number;
  current_month_grams: number;
  recycling_grams: number;
  composting_grams: number;
  landfill_grams: number;
  other_category_grams: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  /**
   * Save a waste item scan to Supabase
   */
  static async saveWasteItem(wasteEntry: WasteEntry): Promise<SupabaseWasteItem | null> {
    try {
      console.log('💾 [SupabaseService] Saving waste item to Supabase...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ [SupabaseService] No authenticated user found');
        return null;
      }

      // Get current location for the scan
      let locationData = null;
      try {
        locationData = await LocationService.getCurrentLocation();
      } catch (error) {
        console.warn('⚠️ [SupabaseService] Could not get location for scan:', error);
      }

      const wasteItemData = {
        user_id: user.id,
        item_name: wasteEntry.description || wasteEntry.type,
        description: wasteEntry.description,
        waste_type: wasteEntry.type,
        waste_category: wasteEntry.category,
        weight_grams: wasteEntry.weight,
        quantity: 1,
        image_url: wasteEntry.imageUrl,
        recyclable: wasteEntry.recyclable,
        compostable: wasteEntry.compostable,
        
        // AI Analysis data
        ai_material: wasteEntry.aiAnalysis?.material,
        ai_environment_score: wasteEntry.aiAnalysis?.environmentScore,
        ai_confidence: wasteEntry.aiAnalysis?.confidence,
        ai_carbon_footprint: wasteEntry.aiAnalysis?.carbonFootprint,
        ai_suggestions: wasteEntry.aiAnalysis?.suggestions || [],
        ai_map_suggestions: wasteEntry.aiAnalysis?.mapSuggestions || [],
        
        // Location data
        scan_location_city: locationData?.city,
        scan_location_region: locationData?.region,
        scan_location_country: locationData?.country,
        scan_latitude: locationData?.latitude,
        scan_longitude: locationData?.longitude,
        
        scanned_at: wasteEntry.timestamp.toISOString(),
      };

      const { data, error } = await supabase
        .from('waste_items')
        .insert(wasteItemData)
        .select()
        .single();

      if (error) {
        console.error('❌ [SupabaseService] Error saving waste item:', error);
        return null;
      }

      console.log('✅ [SupabaseService] Waste item saved successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception saving waste item:', error);
      return null;
    }
  }

  /**
   * Get user's waste items from Supabase
   */
  static async getUserWasteItems(limit?: number): Promise<WasteEntry[]> {
    try {
      console.log('📂 [SupabaseService] Loading user waste items...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ [SupabaseService] No authenticated user found');
        return [];
      }

      let query = supabase
        .from('waste_items')
        .select('*')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [SupabaseService] Error loading waste items:', error);
        return [];
      }

      // Convert Supabase data to WasteEntry format
      const wasteEntries: WasteEntry[] = data.map((item: SupabaseWasteItem) => ({
        id: item.id,
        type: item.waste_type as WasteType,
        category: item.waste_category as WasteCategory,
        weight: item.weight_grams,
        description: item.description,
        imageUrl: item.image_url,
        timestamp: new Date(item.scanned_at),
        location: item.scan_location_city ? 
          `${item.scan_location_city}, ${item.scan_location_region}` : undefined,
        recyclable: item.recyclable,
        compostable: item.compostable,
        aiAnalysis: item.ai_material ? {
          material: item.ai_material,
          environmentScore: item.ai_environment_score || 5,
          confidence: item.ai_confidence || 0.5,
          carbonFootprint: item.ai_carbon_footprint || 0,
          suggestions: item.ai_suggestions || [],
          mapSuggestions: item.ai_map_suggestions || [],
        } : undefined,
      }));

      console.log('✅ [SupabaseService] Loaded', wasteEntries.length, 'waste items');
      return wasteEntries;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception loading waste items:', error);
      return [];
    }
  }

  /**
   * Get user profile from Supabase
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ [SupabaseService] Error loading user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception loading user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [SupabaseService] Error updating user profile:', error);
        return false;
      }

      console.log('✅ [SupabaseService] User profile updated successfully');
      return true;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception updating user profile:', error);
      return false;
    }
  }

  /**
   * Get user statistics from Supabase
   */
  static async getUserStats(): Promise<UserStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ [SupabaseService] Error loading user stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception loading user stats:', error);
      return null;
    }
  }

  /**
   * Mark onboarding as completed in Supabase
   */
  static async markOnboardingCompleted(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [SupabaseService] Error marking onboarding completed:', error);
        return false;
      }

      console.log('✅ [SupabaseService] Onboarding marked as completed');
      return true;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception marking onboarding completed:', error);
      return false;
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return profile?.onboarding_completed || false;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Save disposal location for future reference
   */
  static async saveDisposalLocation(
    name: string,
    address: string,
    locationType: 'recycling_center' | 'store' | 'facility',
    searchQuery: string,
    coordinates?: { latitude: number; longitude: number }
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      // Get current location for context
      let locationData = null;
      try {
        locationData = await LocationService.getCurrentLocation();
      } catch (error) {
        console.warn('⚠️ [SupabaseService] Could not get location for disposal location');
      }

      const { error } = await supabase
        .from('disposal_locations')
        .insert({
          user_id: user.id,
          name,
          address,
          location_type: locationType,
          search_query: searchQuery,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          city: locationData?.city,
          region: locationData?.region,
          country: locationData?.country,
        });

      if (error) {
        console.error('❌ [SupabaseService] Error saving disposal location:', error);
        return false;
      }

      console.log('✅ [SupabaseService] Disposal location saved successfully');
      return true;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception saving disposal location:', error);
      return false;
    }
  }

  /**
   * Delete a waste item
   */
  static async deleteWasteItem(itemId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('waste_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [SupabaseService] Error deleting waste item:', error);
        return false;
      }

      console.log('✅ [SupabaseService] Waste item deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception deleting waste item:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('❌ [SupabaseService] Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Sync local data with Supabase (for migration)
   */
  static async syncLocalDataToSupabase(localItems: WasteEntry[]): Promise<boolean> {
    try {
      console.log('🔄 [SupabaseService] Syncing local data to Supabase...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ [SupabaseService] No authenticated user for sync');
        return false;
      }

      // Check if user already has data in Supabase
      const existingItems = await this.getUserWasteItems(1);
      if (existingItems.length > 0) {
        console.log('ℹ️ [SupabaseService] User already has data in Supabase, skipping sync');
        return true;
      }

      // Sync local items to Supabase
      let syncedCount = 0;
      for (const item of localItems) {
        const saved = await this.saveWasteItem(item);
        if (saved) {
          syncedCount++;
        }
      }

      console.log(`✅ [SupabaseService] Synced ${syncedCount}/${localItems.length} items to Supabase`);
      return true;
    } catch (error) {
      console.error('❌ [SupabaseService] Exception syncing local data:', error);
      return false;
    }
  }
}