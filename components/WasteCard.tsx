import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WasteEntry, WasteType } from '@/types/waste';
import { Package, Weight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
  [WasteType.OTHER]: '#64748b',
};

export function WasteCard({ entry, onPress }: WasteCardProps) {
  const { theme } = useTheme();
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
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

  const formatWeight = (weight: number) => {
    return `${weight} Grams`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to item detail page
      router.push(`/item/${entry.id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceElevated]}
        style={styles.gradient}
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
              <Text style={[styles.itemName, { color: theme.colors.text }]}>{getItemName()}</Text>
              <View style={[styles.timeContainer, { backgroundColor: theme.colors.surfacePressed, borderColor: theme.colors.border }]}>
                <Text style={[styles.time, { color: theme.colors.textSecondary }]}>{formatTime(entry.timestamp)}</Text>
              </View>
            </View>

            <View style={styles.quantityContainer}>
              <Package size={14} color={theme.colors.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.quantity, { color: theme.colors.textSecondary }]}>Quantity: 1</Text>
            </View>

            <View style={styles.weightContainer}>
              <Weight size={16} color={theme.colors.text} strokeWidth={1.5} />
              <Text style={[styles.weight, { color: theme.colors.text }]}>{formatWeight(entry.weight)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
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
  gradient: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    flex: 1,
    letterSpacing: -0.2,
  },
  timeContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  time: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    letterSpacing: 0.3,
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