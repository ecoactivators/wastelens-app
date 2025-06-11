import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Calculate stats from entries
    const calculateStats = (): WasteStats => {
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

      // Calculate CO2 saved (rough estimate: 1kg waste = 0.5kg CO2)
      const co2Saved = (recyclableWeight + compostableWeight) * 0.0005;

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

      return {
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
    };

    const newStats = calculateStats();
    console.log('Calculated stats:', newStats);
    console.log('Current entries:', entries.length);
    setStats(newStats);
    setLoading(false);
  }, [entries]);

  const addEntry = (entry: Omit<WasteEntry, 'id' | 'timestamp'>) => {
    const newEntry: WasteEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    console.log('Adding new entry:', newEntry);
    
    setEntries(prev => {
      const updated = [newEntry, ...prev];
      console.log('Updated entries count:', updated.length);
      console.log('All entries:', updated.map(e => ({ id: e.id, description: e.description, timestamp: e.timestamp })));
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
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateGoal = (goal: WasteGoal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };

  return {
    entries,
    goals,
    stats,
    loading,
    addEntry,
    deleteEntry,
    updateGoal,
  };
}