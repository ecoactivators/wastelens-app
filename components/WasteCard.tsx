import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WasteEntry, WasteType } from '@/types/waste';
import { Package, Weight, Clock, Recycle, Leaf } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getItemName = () => {
    if (entry.description) {
      return entry.description.length > 25 
        ? entry.description.substring(0, 25) + '...'
        : entry.description;
    }
    return entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
    return `${weight}g`;
  };

  const getTypeColor = () => wasteTypeColors[entry.type];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Image */}
          <View style={styles.imageContainer}>
            {entry.imageUrl ? (
              <Image source={{ uri: entry.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: getTypeColor() + '20' }]}>
                <Text style={[styles.placeholderText, { color: getTypeColor() }]}>
                  {entry.type.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            {/* Type Badge */}
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
              <Text style={styles.typeBadgeText}>
                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1, 3)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.details}>
            <View style={styles.header}>
              <Text style={[styles.itemName, { color: theme.colors.text }]}>{getItemName()}</Text>
              <View style={styles.timeContainer}>
                <Clock size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.time, { color: theme.colors.textSecondary }]}>{formatTime(entry.timestamp)}</Text>
              </View>
            </View>

            <View style={styles.metaContainer}>
              <View style={styles.weightContainer}>
                <Weight size={16} color={theme.colors.text} />
                <Text style={[styles.weight, { color: theme.colors.text }]}>{formatWeight(entry.weight)}</Text>
              </View>

              <View style={styles.propertiesContainer}>
                {entry.recyclable && (
                  <View style={[styles.propertyBadge, styles.recyclableBadge]}>
                    <Recycle size={12} color="#10b981" />
                    <Text style={styles.recyclableText}>Recyclable</Text>
                  </View>
                )}
                {entry.compostable && (
                  <View style={[styles.propertyBadge, styles.compostableBadge]}>
                    <Leaf size={12} color="#f59e0b" />
                    <Text style={styles.compostableText}>Compostable</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 16,
    position: 'relative',
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
  typeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  typeBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#ffffff',
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
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  time: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  metaContainer: {
    gap: 8,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weight: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  propertiesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  propertyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recyclableBadge: {
    backgroundColor: '#dcfce7',
  },
  recyclableText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#10b981',
  },
  compostableBadge: {
    backgroundColor: '#fef3c7',
  },
  compostableText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#f59e0b',
  },
});