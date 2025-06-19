import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WasteEntry, WasteStats, WasteType, WasteCategory, WasteGoal } from '@/types/waste';
import { StorageService } from '@/services/storage';

interface ItemsContextType {
  // Items state
  items: WasteEntry[];
  recentItems: WasteEntry[];
  
  // Stats
  stats: WasteStats | null;
  goals: WasteGoal[];
  
  // Loading states
  loading: boolean;
  lastUpdate: Date;
  error: string | null;
  
  // Actions
  addItem: (item: Omit<WasteEntry, 'id' | 'timestamp'>) => WasteEntry;
  removeItem: (id: string) => void;
  updateGoal: (goal: WasteGoal) => void;
  refreshData: () => void;
  clearAllData: () => void;
  clearError: () => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Default goals that will be created if none exist - REMOVED COMPOST GOAL
const createDefaultGoals = (): WasteGoal[] => {
  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        type: 'reduce',
        target: 500,
        current: 0,
        period: 'weekly',
        startDate: weekStart,
        endDate: weekEnd,
      },
    ];
  } catch (error) {
    console.error('❌ [ItemsContext] Error creating default goals:', error);
    return [];
  }
};

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WasteEntry[]>([]);
  const [goals, setGoals] = useState<WasteGoal[]>([]);
  const [stats, setStats] = useState<WasteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Calculate recent items (last 10 items, sorted by timestamp) with error handling
  const recentItems = React.useMemo(() => {
    try {
      if (!Array.isArray(items)) {
        console.warn('⚠️ [ItemsContext] Items is not an array');
        return [];
      }

      return items
        .filter(item => item && item.timestamp instanceof Date)
        .sort((a, b) => {
          try {
            return b.timestamp.getTime() - a.timestamp.getTime();
          } catch (error) {
            console.error('❌ [ItemsContext] Error sorting items:', error);
            return 0;
          }
        })
        .slice(0, 10);
    } catch (error) {
      console.error('❌ [ItemsContext] Error calculating recent items:', error);
      return [];
    }
  }, [items]);

  // Load data from storage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      console.log('🔄 [ItemsContext] Loading data from storage...');
      setLoading(true);
      setError(null);
      
      try {
        // Check storage health first
        const isStorageHealthy = await StorageService.healthCheck();
        if (!isStorageHealthy) {
          console.warn('⚠️ [ItemsContext] Storage health check failed, proceeding with caution');
        }

        const [storedItems, storedGoals] = await Promise.all([
          StorageService.loadItems().catch(error => {
            console.error('❌ [ItemsContext] Failed to load items:', error);
            return [];
          }),
          StorageService.loadGoals().catch(error => {
            console.error('❌ [ItemsContext] Failed to load goals:', error);
            return [];
          })
        ]);

        // Validate loaded items
        const validItems = Array.isArray(storedItems) ? storedItems.filter(item => {
          try {
            return item && typeof item === 'object' && item.id && item.timestamp instanceof Date;
          } catch (error) {
            console.error('❌ [ItemsContext] Invalid item found:', item, error);
            return false;
          }
        }) : [];

        setItems(validItems);
        
        // Use stored goals or create defaults if none exist
        if (Array.isArray(storedGoals) && storedGoals.length > 0) {
          const validGoals = storedGoals.filter(goal => {
            try {
              return goal && typeof goal === 'object' && goal.id;
            } catch (error) {
              console.error('❌ [ItemsContext] Invalid goal found:', goal, error);
              return false;
            }
          });
          setGoals(validGoals);
        } else {
          const defaultGoals = createDefaultGoals();
          setGoals(defaultGoals);
          await StorageService.saveGoals(defaultGoals);
        }

        console.log('✅ [ItemsContext] Data loaded successfully:', {
          items: validItems.length,
          goals: storedGoals.length > 0 ? storedGoals.length : 'using defaults'
        });
      } catch (error) {
        console.error('❌ [ItemsContext] Failed to load data:', error);
        setError('Failed to load data from storage');
        
        // Initialize with defaults on error
        const defaultGoals = createDefaultGoals();
        setGoals(defaultGoals);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Save items to storage whenever items change
  useEffect(() => {
    if (!loading && Array.isArray(items)) {
      StorageService.saveItems(items).catch(error => {
        console.error('❌ [ItemsContext] Failed to save items:', error);
        setError('Failed to save items to storage');
      });
    }
  }, [items, loading]);

  // Save goals to storage whenever goals change
  useEffect(() => {
    if (!loading && Array.isArray(goals) && goals.length > 0) {
      StorageService.saveGoals(goals).catch(error => {
        console.error('❌ [ItemsContext] Failed to save goals:', error);
        setError('Failed to save goals to storage');
      });
    }
  }, [goals, loading]);

  // Calculate stats from items with comprehensive error handling
  const calculateStats = useCallback((): WasteStats => {
    try {
      console.log('📊 [ItemsContext] Calculating stats for', items.length, 'items');
      
      if (!Array.isArray(items)) {
        console.warn('⚠️ [ItemsContext] Items is not an array for stats calculation');
        return createEmptyStats();
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Filter valid items
      const validItems = items.filter(item => {
        try {
          return item && 
                 typeof item === 'object' && 
                 typeof item.weight === 'number' && 
                 !isNaN(item.weight) && 
                 item.weight >= 0 &&
                 item.timestamp instanceof Date;
        } catch (error) {
          console.error('❌ [ItemsContext] Invalid item in stats calculation:', item, error);
          return false;
        }
      });

      const totalWeight = validItems.reduce((sum, item) => {
        try {
          return sum + (item.weight || 0);
        } catch (error) {
          console.error('❌ [ItemsContext] Error adding weight:', error);
          return sum;
        }
      }, 0);

      const weeklyWeight = validItems
        .filter(item => {
          try {
            return item.timestamp >= weekAgo;
          } catch (error) {
            console.error('❌ [ItemsContext] Error filtering weekly items:', error);
            return false;
          }
        })
        .reduce((sum, item) => sum + (item.weight || 0), 0);

      const monthlyWeight = validItems
        .filter(item => {
          try {
            return item.timestamp >= monthAgo;
          } catch (error) {
            console.error('❌ [ItemsContext] Error filtering monthly items:', error);
            return false;
          }
        })
        .reduce((sum, item) => sum + (item.weight || 0), 0);

      const compostableWeight = validItems
        .filter(item => {
          try {
            return item.compostable === true;
          } catch (error) {
            console.error('❌ [ItemsContext] Error filtering compostable items:', error);
            return false;
          }
        })
        .reduce((sum, item) => sum + (item.weight || 0), 0);

      const compostingRate = totalWeight > 0 ? Math.min(100, Math.max(0, (compostableWeight / totalWeight) * 100)) : 0;

      // Calculate food waste vs other waste percentages
      const foodWasteWeight = validItems
        .filter(item => {
          try {
            return item.type === WasteType.FOOD;
          } catch (error) {
            console.error('❌ [ItemsContext] Error filtering food waste:', error);
            return false;
          }
        })
        .reduce((sum, item) => sum + (item.weight || 0), 0);

      const otherWasteWeight = Math.max(0, totalWeight - foodWasteWeight);
      
      const foodWastePercentage = totalWeight > 0 ? Math.min(100, Math.max(0, (foodWasteWeight / totalWeight) * 100)) : 0;
      const otherWastePercentage = totalWeight > 0 ? Math.min(100, Math.max(0, (otherWasteWeight / totalWeight) * 100)) : 0;

      // Calculate waste by type with error handling
      const wasteByType = Object.values(WasteType).reduce((acc, type) => {
        try {
          acc[type] = validItems
            .filter(item => item.type === type)
            .reduce((sum, item) => sum + (item.weight || 0), 0);
        } catch (error) {
          console.error('❌ [ItemsContext] Error calculating waste by type:', type, error);
          acc[type] = 0;
        }
        return acc;
      }, {} as Record<WasteType, number>);

      // Calculate waste by category with error handling
      const wasteByCategory = Object.values(WasteCategory).reduce((acc, category) => {
        try {
          acc[category] = validItems
            .filter(item => item.category === category)
            .reduce((sum, item) => sum + (item.weight || 0), 0);
        } catch (error) {
          console.error('❌ [ItemsContext] Error calculating waste by category:', category, error);
          acc[category] = 0;
        }
        return acc;
      }, {} as Record<WasteCategory, number>);

      // Calculate streak with error handling
      let streak = 0;
      try {
        if (validItems.length > 0) {
          const sortedItems = [...validItems].sort((a, b) => {
            try {
              return b.timestamp.getTime() - a.timestamp.getTime();
            } catch (error) {
              console.error('❌ [ItemsContext] Error sorting for streak:', error);
              return 0;
            }
          });
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let currentDate = new Date(today);
          
          for (let i = 0; i < Math.min(30, sortedItems.length); i++) {
            try {
              const dayItems = sortedItems.filter(item => {
                const itemDate = new Date(item.timestamp);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate.getTime() === currentDate.getTime();
              });
              
              if (dayItems.length > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
              } else {
                break;
              }
            } catch (error) {
              console.error('❌ [ItemsContext] Error calculating streak day:', error);
              break;
            }
          }
        }
      } catch (error) {
        console.error('❌ [ItemsContext] Error calculating streak:', error);
        streak = 0;
      }

      const co2Saved = Math.max(0, compostableWeight * 0.0005);

      const calculatedStats = {
        totalWeight: Math.max(0, totalWeight),
        weeklyWeight: Math.max(0, weeklyWeight),
        monthlyWeight: Math.max(0, monthlyWeight),
        compostingRate: Math.max(0, Math.min(100, compostingRate)),
        foodWastePercentage: Math.max(0, Math.min(100, foodWastePercentage)),
        otherWastePercentage: Math.max(0, Math.min(100, otherWastePercentage)),
        wasteByType,
        wasteByCategory,
        streak: Math.max(0, streak),
        co2Saved: Math.max(0, co2Saved),
      };

      console.log('📈 [ItemsContext] Stats calculated successfully:', {
        totalItems: validItems.length,
        totalWeight: calculatedStats.totalWeight,
        weeklyWeight: calculatedStats.weeklyWeight,
        compostingRate: Math.round(calculatedStats.compostingRate),
        foodWastePercentage: Math.round(calculatedStats.foodWastePercentage),
        otherWastePercentage: Math.round(calculatedStats.otherWastePercentage),
        streak: calculatedStats.streak,
      });

      return calculatedStats;
    } catch (error) {
      console.error('❌ [ItemsContext] Error calculating stats:', error);
      setError('Failed to calculate statistics');
      return createEmptyStats();
    }
  }, [items]);

  // Helper function to create empty stats
  const createEmptyStats = (): WasteStats => ({
    totalWeight: 0,
    weeklyWeight: 0,
    monthlyWeight: 0,
    compostingRate: 0,
    foodWastePercentage: 0,
    otherWastePercentage: 0,
    wasteByType: Object.values(WasteType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<WasteType, number>),
    wasteByCategory: Object.values(WasteCategory).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<WasteCategory, number>),
    streak: 0,
    co2Saved: 0,
  });

  // Recalculate stats when items change
  useEffect(() => {
    if (!loading) {
      try {
        console.log('🔄 [ItemsContext] Items changed, recalculating stats. Count:', items.length);
        const newStats = calculateStats();
        setStats(newStats);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('❌ [ItemsContext] Error updating stats:', error);
        setError('Failed to update statistics');
      }
    }
  }, [items, calculateStats, loading]);

  // Add new item with comprehensive error handling
  const addItem = useCallback((itemData: Omit<WasteEntry, 'id' | 'timestamp'>) => {
    try {
      if (!itemData || typeof itemData !== 'object') {
        throw new Error('Invalid item data provided');
      }

      const newItem: WasteEntry = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        weight: Math.max(0, itemData.weight || 0), // Ensure positive weight
        recyclable: Boolean(itemData.recyclable),
        compostable: Boolean(itemData.compostable),
      };
      
      console.log('➕ [ItemsContext] Adding new item:', {
        id: newItem.id,
        description: newItem.description,
        weight: newItem.weight,
        type: newItem.type,
        recyclable: newItem.recyclable,
        timestamp: newItem.timestamp.toISOString()
      });
      
      setItems(prev => {
        try {
          const updated = [newItem, ...prev];
          console.log('✅ [ItemsContext] Items updated. New count:', updated.length);
          return updated;
        } catch (error) {
          console.error('❌ [ItemsContext] Error updating items array:', error);
          setError('Failed to add item');
          return prev;
        }
      });
      
      // Update goals with error handling - ONLY REDUCE GOAL NOW
      setGoals(prev => prev.map(goal => {
        try {
          if (goal.type === 'reduce') {
            return { ...goal, current: Math.max(0, goal.current + newItem.weight) };
          }
          return goal;
        } catch (error) {
          console.error('❌ [ItemsContext] Error updating goal:', goal, error);
          return goal;
        }
      }));

      console.log('🎯 [ItemsContext] Item added successfully, will be saved to storage');
      return newItem;
    } catch (error) {
      console.error('❌ [ItemsContext] Failed to add item:', error);
      setError('Failed to add item');
      
      // Return a fallback item to prevent crashes
      const fallbackItem: WasteEntry = {
        id: `fallback-${Date.now()}`,
        type: WasteType.OTHER,
        category: WasteCategory.LANDFILL,
        weight: 0,
        timestamp: new Date(),
        recyclable: false,
        compostable: false,
      };
      return fallbackItem;
    }
  }, [items]);

  // Remove item with error handling
  const removeItem = useCallback((id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid item ID provided');
      }

      console.log('🗑️ [ItemsContext] Removing item:', id);
      
      // Find the item to be removed to get its weight
      const itemToRemove = items.find(item => item.id === id);
      
      setItems(prev => {
        try {
          const updated = prev.filter(item => item.id !== id);
          console.log('✅ [ItemsContext] Item removed. New count:', updated.length);
          return updated;
        } catch (error) {
          console.error('❌ [ItemsContext] Error removing item from array:', error);
          setError('Failed to remove item');
          return prev;
        }
      });

      // Update goals - subtract the removed item's weight from reduce goal
      if (itemToRemove) {
        setGoals(prev => prev.map(goal => {
          try {
            if (goal.type === 'reduce') {
              const newCurrent = Math.max(0, goal.current - (itemToRemove.weight || 0));
              console.log('🎯 [ItemsContext] Updating reduce goal:', {
                oldCurrent: goal.current,
                removedWeight: itemToRemove.weight,
                newCurrent
              });
              return { ...goal, current: newCurrent };
            }
            return goal;
          } catch (error) {
            console.error('❌ [ItemsContext] Error updating goal after removal:', goal, error);
            return goal;
          }
        }));
      }
    } catch (error) {
      console.error('❌ [ItemsContext] Failed to remove item:', error);
      setError('Failed to remove item');
    }
  }, [items]);

  // Update goal with error handling
  const updateGoal = useCallback((goal: WasteGoal) => {
    try {
      if (!goal || typeof goal !== 'object' || !goal.id) {
        throw new Error('Invalid goal data provided');
      }

      setGoals(prev => prev.map(g => {
        try {
          return g.id === goal.id ? goal : g;
        } catch (error) {
          console.error('❌ [ItemsContext] Error updating individual goal:', error);
          return g;
        }
      }));
    } catch (error) {
      console.error('❌ [ItemsContext] Failed to update goal:', error);
      setError('Failed to update goal');
    }
  }, []);

  // Clear all data with error handling
  const clearAllData = useCallback(async () => {
    try {
      console.log('🗑️ [ItemsContext] Clearing all data...');
      setItems([]);
      const defaultGoals = createDefaultGoals();
      setGoals(defaultGoals);
      await StorageService.clearAllData();
      await StorageService.saveGoals(defaultGoals);
      setError(null);
      console.log('✅ [ItemsContext] All data cleared');
    } catch (error) {
      console.error('❌ [ItemsContext] Failed to clear all data:', error);
      setError('Failed to clear all data');
    }
  }, []);

  // Refresh data with error handling
  const refreshData = useCallback(() => {
    try {
      console.log('🔄 [ItemsContext] Manual refresh triggered');
      setLoading(true);
      setError(null);
      setLastUpdate(new Date());
      const newStats = calculateStats();
      setStats(newStats);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('❌ [ItemsContext] Failed to refresh data:', error);
      setError('Failed to refresh data');
      setLoading(false);
    }
  }, [calculateStats]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ItemsContextType = {
    items,
    recentItems,
    stats,
    goals,
    loading,
    lastUpdate,
    error,
    addItem,
    removeItem,
    updateGoal,
    refreshData,
    clearAllData,
    clearError,
  };

  return (
    <ItemsContext.Provider value={value}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}