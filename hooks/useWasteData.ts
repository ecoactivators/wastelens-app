import { useState, useEffect } from 'react';
import { WasteEntry, WasteStats, WasteType, WasteCategory, WasteGoal } from '@/types/waste';

// Mock data for demonstration
const mockEntries: WasteEntry[] = [
  {
    id: '1',
    type: WasteType.FOOD,
    category: WasteCategory.COMPOSTABLE,
    weight: 150,
    description: 'Apple core and banana peel',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    recyclable: false,
    compostable: true,
  },
  {
    id: '2',
    type: WasteType.PLASTIC,
    category: WasteCategory.RECYCLABLE,
    weight: 25,
    description: 'Water bottle',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    recyclable: true,
    compostable: false,
  },
  {
    id: '3',
    type: WasteType.PAPER,
    category: WasteCategory.RECYCLABLE,
    weight: 50,
    description: 'Newspaper',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    recyclable: true,
    compostable: false,
  },
];

const mockGoals: WasteGoal[] = [
  {
    id: '1',
    type: 'reduce',
    target: 500,
    current: 225,
    period: 'weekly',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'recycle',
    target: 80,
    current: 65,
    period: 'weekly',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
];

export function useWasteData() {
  const [entries, setEntries] = useState<WasteEntry[]>(mockEntries);
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

      return {
        totalWeight,
        weeklyWeight,
        monthlyWeight,
        recyclingRate,
        compostingRate,
        wasteByType,
        wasteByCategory,
        streak: 7, // Mock streak
        co2Saved,
      };
    };

    setStats(calculateStats());
    setLoading(false);
  }, [entries]);

  const addEntry = (entry: Omit<WasteEntry, 'id' | 'timestamp'>) => {
    const newEntry: WasteEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setEntries(prev => [newEntry, ...prev]);
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