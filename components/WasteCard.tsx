import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WasteEntry, WasteType } from '@/types/waste';
import { Flame, Wheat, Droplets } from 'lucide-react-native';

interface WasteCardProps {
  entry: WasteEntry;
  onPress?: () => void;
}

const wasteTypeColors: Record<WasteType, string> = {
  [WasteType.FOOD]: '#f59e0b',
  [WasteType.PLASTIC]: '#3b82f6',
  [WasteType.PAPER]: '#8b5cf6',
  [WasteType.GLASS]: '#06b6d4',
  [WasteType.METAL]: '#6b7280',
  [WasteType.ELECTRONIC]: '#ef4444',
  [WasteType.TEXTILE]: '#ec4899',
  [WasteType.ORGANIC]: '#10b981',
  [WasteType.HAZARDOUS]: '#dc2626',
  [WasteType.OTHER]: '#64748b',
};

export function WasteCard({ entry, onPress }: WasteCardProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Mock nutritional data - in a real app this would come from the AI analysis
  const mockNutrition = {
    calories: Math.floor(Math.random() * 800) + 200,
    protein: Math.floor(Math.random() * 80) + 5,
    carbs: Math.floor(Math.random() * 90) + 10,
    fat: Math.floor(Math.random() * 30) + 5,
  };

  const getItemName = () => {
    // Extract a more descriptive name from the description or use type
    if (entry.description) {
      return entry.description.length > 20 
        ? entry.description.substring(0, 20) + '...'
        : entry.description;
    }
    return entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {entry.imageUrl ? (
            <Image source={{ uri: entry.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: wasteTypeColors[entry.type] + '20' }]}>
              <Text style={[styles.placeholderText, { color: wasteTypeColors[entry.type] }]}>
                {entry.type.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.itemName}>{getItemName()}</Text>
            <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
          </View>

          <View style={styles.caloriesContainer}>
            <Flame size={16} color="#111827" />
            <Text style={styles.calories}>{mockNutrition.calories} calories</Text>
          </View>

          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.nutritionText}>{mockNutrition.protein}g</Text>
            </View>
            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.nutritionText}>{mockNutrition.carbs}g</Text>
            </View>
            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.nutritionText}>{mockNutrition.fat}g</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    flex: 1,
  },
  time: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  calories: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  nutritionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nutritionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
  },
});