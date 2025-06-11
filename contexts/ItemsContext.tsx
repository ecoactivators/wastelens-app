import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WasteEntry, WasteStats, WasteType, WasteCategory, WasteGoal } from '@/types/waste';

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
  
  // Actions
  addItem: (item: Omit<WasteEntry, 'id' | 'timestamp'>) => WasteEntry;
  removeItem: (id: string) => void;
  updateGoal: (goal: WasteGoal) => void;
  refreshData: () => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Initial empty state - no sample data
const initialItems: WasteEntry[] = [];

const mockGoals: WasteGoal[] = [
  {
    id: '1',
    type: 'reduce',
    target: 500,
    current: 0,
    period: 'weekly',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'recycle',
    target: 80,
    current: 0,
    period: 'weekly',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
];

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WasteEntry[]>(initialItems);
  const [goals, setGoals] = useState<WasteGoal[]>(mockGoals);
  const [stats, setStats] = useState<WasteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calculate recent items (last 10 items, sorted by timestamp)
  const recentItems = items
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  // Calculate stats from items
  const calculateStats = useCallback((): WasteStats => {
    console.log('📊 [ItemsContext] Calculating stats for', items.length, 'items');
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const weeklyWeight = items
      .filter(item => item.timestamp >= weekAgo)
      .reduce((sum, item) => sum + item.weight, 0);
    const monthlyWeight = items
      .filter(item => item.timestamp >= monthAgo)
      .reduce((sum, item) => sum + item.weight, 0);

    const recyclableWeight = items
      .filter(item => item.recyclable)
      .reduce((sum, item) => sum + item.weight, 0);
    const compostableWeight = items
      .filter(item => item.compostable)
      .reduce((sum, item) => sum + item.weight, 0);

    const recyclingRate = totalWeight > 0 ? (recyclableWeight / totalWeight) * 100 : 0;
    const compostingRate = totalWeight > 0 ? (compostableWeight / totalWeight) * 100 : 0;

    const wasteByType = Object.values(WasteType).reduce((acc, type) => {
      acc[type] = items
        .filter(item => item.type === type)
        .reduce((sum, item) => sum + item.weight, 0);
      return acc;
    }, {} as Record<WasteType, number>);

    const wasteByCategory = Object.values(WasteCategory).reduce((acc, category) => {
      acc[category] = items
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + item.weight, 0);
      return acc;
    }, {} as Record<WasteCategory, number>);

    // Calculate streak
    let streak = 0;
    if (items.length > 0) {
      const sortedItems = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);
      
      for (let i = 0; i < 30; i++) {
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
      }
    }

    const co2Saved = (recyclableWeight + compostableWeight) * 0.0005;

    const calculatedStats = {
      totalWeight,
      weeklyWeight,
      monthlyWeight,
      recyclingRate,
      compostingRate,
      wasteByType,
      wasteByCategory,
      streak,
      co2Saved,
    };

    console.log('📈 [ItemsContext] Stats calculated:', {
      totalItems: items.length,
      totalWeight,
      weeklyWeight,
      recyclingRate: Math.round(recyclingRate),
      streak,
    });

    return calculatedStats;
  }, [items]);

  // Recalculate stats when items change
  useEffect(() => {
    console.log('🔄 [ItemsContext] Items changed, recalculating stats. Count:', items.length);
    const newStats = calculateStats();
    setStats(newStats);
    setLastUpdate(new Date());
    setLoading(false);
  }, [items, calculateStats]);

  // Add new item
  const addItem = useCallback((itemData: Omit<WasteEntry, 'id' | 'timestamp'>) => {
    const newItem: WasteEntry = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
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
      const updated = [newItem, ...prev];
      console.log('✅ [ItemsContext] Items updated. New count:', updated.length);
      console.log('📋 [ItemsContext] Recent items:', updated.slice(0, 3).map(i => ({
        id: i.id,
        description: i.description,
        weight: i.weight
      })));
      return updated;
    });
    
    // Update goals
    setGoals(prev => prev.map(goal => {
      if (goal.type === 'reduce') {
        return { ...goal, current: goal.current + itemData.weight };
      } else if (goal.type === 'recycle' && itemData.recyclable) {
        const totalItems = items.length + 1;
        const recyclableItems = items.filter(i => i.recyclable).length + (itemData.recyclable ? 1 : 0);
        const newRecyclingRate = (recyclableItems / totalItems) * 100;
        return { ...goal, current: Math.min(newRecyclingRate, 100) };
      }
      return goal;
    }));

    console.log('🎯 [ItemsContext] Item added successfully, stats will recalculate');
    return newItem;
  }, [items]);

  // Remove item
  const removeItem = useCallback((id: string) => {
    console.log('🗑️ [ItemsContext] Removing item:', id);
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      console.log('✅ [ItemsContext] Item removed. New count:', updated.length);
      return updated;
    });
  }, []);

  // Update goal
  const updateGoal = useCallback((goal: WasteGoal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    console.log('🔄 [ItemsContext] Manual refresh triggered');
    setLoading(true);
    setLastUpdate(new Date());
    const newStats = calculateStats();
    setStats(newStats);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [calculateStats]);

  const value: ItemsContextType = {
    items,
    recentItems,
    stats,
    goals,
    loading,
    lastUpdate,
    addItem,
    removeItem,
    updateGoal,
    refreshData,
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