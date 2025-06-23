import React, { createContext, useContext, useState, useCallback } from 'react';
import { WasteEntry, WasteType, WasteCategory } from '@/types/waste';

interface ItemsContextType {
  // Items state
  items: WasteEntry[];
  
  // Loading states
  loading: boolean;
  
  // Actions
  addItem: (item: Omit<WasteEntry, 'id' | 'timestamp'>) => WasteEntry;
  removeItem: (id: string) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Add new item
  const addItem = useCallback((itemData: Omit<WasteEntry, 'id' | 'timestamp'>) => {
    const newItem: WasteEntry = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      weight: Math.max(0, itemData.weight || 0),
      recyclable: Boolean(itemData.recyclable),
      compostable: Boolean(itemData.compostable),
    };
    
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const value: ItemsContextType = {
    items,
    loading,
    addItem,
    removeItem,
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