import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WasteEntry, WasteType } from '@/types/waste';
import { Package, Weight } from 'lucide-react-native';
import { router } from 'expo-router';

interface WasteCardProps {
  entry: WasteEntry;
  onPress?: () => void;
}

const wasteTypeColors: Record<WasteType, string> = {
  [WasteType.FOOD]: '#ea580c',
  [WasteType.PLASTIC]: '#3b82f6',
  [WasteType.PAPER]: '#8b5cf6',
  [WasteType.GLASS]: '#06b6d4',
  [WasteType.METAL]: '#6b7280',
  [WasteType.ELECTRONIC]: '#ef4444',
  [WasteType.TEXTILE]: '#ec4899',
  [WasteType.ORGANIC]: '#16a34a',
  [WasteType.HAZARDOUS]: '#dc2626',
  [WasteType.PLASTIC_FILM]: '#3b82f6',
  [WasteType.BATTERIES]: '#dc2626',
  [WasteType.LIGHT_BULBS]: '#f59e0b',
  [WasteType.PAINT]: '#dc2626',
  [WasteType.CERAMICS]: '#8b5cf6',
  [WasteType.CHIP_BAGS]: '#64748b',
  [WasteType.OTHER]: '#64748b',
};

export function WasteCard({ entry, onPress }: WasteCardProps) {
  const getItemName = () => {
    if (entry.description) {
      return entry.description.length > 35 
        ? entry.description.substring(0, 35) + '...'
        : entry.description;
    }
    return entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
  };

  const formatWeight = (weight: number) => {
    return `${weight} Grams`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/item/${entry.id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: '#ffffff' }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
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
            <Text style={[styles.itemName, { color: '#0a0a0a' }]} numberOfLines={2}>
              {getItemName()}
            </Text>
            <View style={[styles.dateContainer, { backgroundColor: '#f5f5f5', borderColor: '#e5e5e5' }]}>
              <Text style={[styles.dateText, { color: '#525252' }]}>
                {formatDate(entry.timestamp)}
              </Text>
            </View>
          </View>

          <View style={styles.quantityContainer}>
            <Package size={14} color="#525252" strokeWidth={1.5} />
            <Text style={[styles.quantity, { color: '#525252' }]}>Quantity: 1</Text>
          </View>

          <View style={styles.weightContainer}>
            <Weight size={16} color="#0a0a0a" strokeWidth={1.5} />
            <Text style={[styles.weight, { color: '#0a0a0a' }]}>{formatWeight(entry.weight)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  dateContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  quantity: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  weight: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    letterSpacing: -0.3,
  },
});