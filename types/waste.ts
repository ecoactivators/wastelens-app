export interface WasteEntry {
  id: string;
  type: WasteType;
  category: WasteCategory;
  weight: number; // in grams
  description?: string;
  imageUrl?: string;
  timestamp: Date;
  location?: string;
  recyclable: boolean;
  compostable: boolean;
}

export enum WasteType {
  FOOD = 'food',
  PLASTIC = 'plastic',
  PAPER = 'paper',
  GLASS = 'glass',
  METAL = 'metal',
  ELECTRONIC = 'electronic',
  TEXTILE = 'textile',
  ORGANIC = 'organic',
  HAZARDOUS = 'hazardous',
  OTHER = 'other'
}

export enum WasteCategory {
  RECYCLABLE = 'recyclable',
  COMPOSTABLE = 'compostable',
  LANDFILL = 'landfill',
  HAZARDOUS = 'hazardous'
}

export interface WasteStats {
  totalWeight: number;
  weeklyWeight: number;
  monthlyWeight: number;
  recyclingRate: number;
  compostingRate: number;
  foodWastePercentage: number;
  otherWastePercentage: number;
  wasteByType: Record<WasteType, number>;
  wasteByCategory: Record<WasteCategory, number>;
  streak: number;
  co2Saved: number;
}

export interface WasteGoal {
  id: string;
  type: 'reduce' | 'recycle' | 'compost';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}