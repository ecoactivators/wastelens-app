import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WasteEntry, WasteType } from '@/types/waste';
import { Trash2, Recycle, Leaf, Clock } from 'lucide-react-native';

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

const wasteTypeIcons: Record<WasteType, React.ReactNode> = {
  [WasteType.FOOD]: <Leaf size={16} color="#f59e0b" />,
  [WasteType.PLASTIC]: <Recycle size={16} color="#3b82f6" />,
  [WasteType.PAPER]: <Trash2 size={16} color="#8b5cf6" />,
  [WasteType.GLASS]: <Recycle size={16} color="#06b6d4" />,
  [WasteType.METAL]: <Recycle size={16} color="#6b7280" />,
  [WasteType.ELECTRONIC]: <Trash2 size={16} color="#ef4444" />,
  [WasteType.TEXTILE]: <Trash2 size={16} color="#ec4899" />,
  [WasteType.ORGANIC]: <Leaf size={16} color="#10b981" />,
  [WasteType.HAZARDOUS]: <Trash2 size={16} color="#dc2626" />,
  [WasteType.OTHER]: <Trash2 size={16} color="#64748b" />,
};

export function WasteCard({ entry, onPress }: WasteCardProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          {wasteTypeIcons[entry.type]}
          <Text style={[styles.typeText, { color: wasteTypeColors[entry.type] }]}>
            {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={12} color="#6b7280" />
          <Text style={styles.timeText}>{formatTime(entry.timestamp)}</Text>
        </View>
      </View>

      {entry.imageUrl && (
        <Image source={{ uri: entry.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.weight}>{entry.weight}g</Text>
        {entry.description && (
          <Text style={styles.description}>{entry.description}</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.badges}>
          {entry.recyclable && (
            <View style={[styles.badge, styles.recyclableBadge]}>
              <Recycle size={12} color="#10b981" />
              <Text style={styles.recyclableText}>Recyclable</Text>
            </View>
          )}
          {entry.compostable && (
            <View style={[styles.badge, styles.compostableBadge]}>
              <Leaf size={12} color="#f59e0b" />
              <Text style={styles.compostableText}>Compostable</Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6b7280',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  content: {
    marginBottom: 12,
  },
  weight: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
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
    fontSize: 12,
    color: '#10b981',
  },
  compostableBadge: {
    backgroundColor: '#fef3c7',
  },
  compostableText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#f59e0b',
  },
});