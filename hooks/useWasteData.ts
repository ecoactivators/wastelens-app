import { useState, useEffect, useCallback } from 'react';
import { WasteEntry, WasteStats, WasteType, WasteCategory, WasteGoal } from '@/types/waste';

// Start with some sample data to show the UI works
const initialEntries: WasteEntry[] = [
  {
    id: 'sample-1',
    type: WasteType.PLASTIC,
    category: WasteCategory.RECYCLABLE,
    weight: 25,
    description: 'Water bottle',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    recyclable: true,
    compostable: false,
  },
];

const mockGoals: WasteGoal[] = [
  {
    id: '1',
    type: 'reduce',
    target: 500,
    current: 25,
    period: 'weekly',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'recycle',
    target: 80,
    current: 100,
    period: 'weekly',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
];

export function useWasteData() {
  const [entries, setEntries] = useState<WasteEntry[]>(initialEntries);
  const [goals, setGoals] = useState<WasteGoal[]>(mockGoals);
  const [stats, setStats] = useState<WasteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Force re-calculation of stats whenever entries change
  const calculateStats = useCallback((): WasteStats => {
    console.log('🔄 Calculating stats for', entries.length, 'entries');
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
    const weeklyWeight = entries
      .filter(entry => entry.timestamp >= weekAgo)
      .reduce((sum, entry) => sum + entry.weight, 0);
    const monthlyWeight = entries
      .filter(entry => entry.timestamp >= monthAgo)
      .reduce((sum, entry) => sum + entry.weight, 0);

    const recyclableWeight = entries
      .filter(entry => entry.recyclable)
      .reduce((sum, entry) => sum + entry.weight, 0);
    const compostableWeight = entries
      .filter(entry => entry.compostable)
      .reduce((sum, entry) => sum + entry.weight, 0);

    const recyclingRate = totalWeight > 0 ? (recyclableWeight / totalWeight) * 100 : 0;
    const compostingRate = totalWeight > 0 ? (compostableWeight / totalWeight) * 100 : 0;

    const wasteByType = Object.values(WasteType).reduce((acc, type) => {
      acc[type] = entries
        .filter(entry => entry.type === type)
        .reduce((sum, entry) => sum + entry.weight, 0);
      return acc;
    }, {} as Record<WasteType, number>);

    const wasteByCategory = Object.values(WasteCategory).reduce((acc, category) => {
      acc[category] = entries
        .filter(entry => entry.category === category)
        .reduce((sum, entry) => sum + entry.weight, 0);
      return acc;
    }, {} as Record<WasteCategory, number>);

    // Calculate streak based on consecutive days with entries
    let streak = 0;
    if (entries.length > 0) {
      const sortedEntries = [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);
      
      for (let i = 0; i < 30; i++) { // Check last 30 days max
        const dayEntries = sortedEntries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === currentDate.getTime();
        });
        
        if (dayEntries.length > 0) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate CO2 saved (rough estimate: 1kg waste = 0.5kg CO2)
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

    console.log('📊 Calculated stats:', {
      totalEntries: entries.length,
      totalWeight,
      weeklyWeight,
      recyclingRate: Math.round(recyclingRate),
      streak,
    });

    return calculatedStats;
  }, [entries]);

  // Recalculate stats whenever entries change
  useEffect(() => {
    console.log('📈 Entries changed, recalculating stats. Current entries:', entries.length);
    const newStats = calculateStats();
    setStats(newStats);
    setLastUpdate(new Date());
    setLoading(false);
  }, [entries, calculateStats]);

  const addEntry = useCallback((entry: Omit<WasteEntry, 'id' | 'timestamp'>) => {
    const newEntry: WasteEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    console.log('➕ Adding new entry:', {
      id: newEntry.id,
      description: newEntry.description,
      weight: newEntry.weight,
      type: newEntry.type,
      timestamp: newEntry.timestamp.toISOString()
    });
    
    setEntries(prev => {
      const updated = [newEntry, ...prev];
      console.log('✅ Updated entries count:', updated.length);
      console.log('📋 All entries after update:', updated.map(e => ({ 
        id: e.id, 
        description: e.description, 
        weight: e.weight,
        timestamp: e.timestamp.toISOString()
      })));
      return updated;
    });
    
    // Update goals based on the new entry
    setGoals(prev => prev.map(goal => {
      if (goal.type === 'reduce') {
        return { ...goal, current: goal.current + entry.weight };
      } else if (goal.type === 'recycle' && entry.recyclable) {
        // Calculate new recycling rate
        const totalEntries = entries.length + 1;
        const recyclableEntries = entries.filter(e => e.recyclable).length + (entry.recyclable ? 1 : 0);
        const newRecyclingRate = (recyclableEntries / totalEntries) * 100;
        return { ...goal, current: Math.min(newRecyclingRate, 100) };
      }
      return goal;
    }));

    console.log('🎯 Entry added successfully, triggering stats recalculation');
    return newEntry; // Return the new entry for confirmation
  }, [entries]);

  const deleteEntry = useCallback((id: string) => {
    console.log('🗑️ Deleting entry:', id);
    setEntries(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      console.log('✅ Entries after deletion:', updated.length);
      return updated;
    });
  }, []);

  const updateGoal = useCallback((goal: WasteGoal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  }, []);

  // Add a refresh function for manual data refresh
  const refreshData = useCallback(() => {
    console.log('🔄 Refreshing data...');
    setLoading(true);
    setLastUpdate(new Date());
    // Force recalculation
    const newStats = calculateStats();
    setStats(newStats);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [calculateStats]);

  // Debug function to get current state
  const getDebugInfo = useCallback(() => {
    return {
      entriesCount: entries.length,
      lastUpdate: lastUpdate.toISOString(),
      recentEntries: entries.slice(0, 3).map(e => ({
        id: e.id,
        description: e.description,
        weight: e.weight,
        timestamp: e.timestamp.toISOString()
      })),
      stats: stats ? {
        totalWeight: stats.totalWeight,
        weeklyWeight: stats.weeklyWeight,
        recyclingRate: Math.round(stats.recyclingRate),
        streak: stats.streak
      } : null
    };
  }, [entries, lastUpdate, stats]);

  return {
    entries,
    goals,
    stats,
    loading,
    lastUpdate,
    addEntry,
    deleteEntry,
    updateGoal,
    refreshData,
    getDebugInfo,
  };
}