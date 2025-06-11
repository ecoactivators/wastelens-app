import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { WasteEntry } from '@/types/waste';
import { Trash2 } from 'lucide-react-native';

interface RecentEntryProps {
  entry: WasteEntry;
  onPress?: () => void;
}

export function RecentEntry({ entry, onPress }: RecentEntryProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getWasteWeight = () => {
    // Calculate total weight including recyclable/compostable portions
    return entry.weight;
  };

  const getRecyclableWeight = () => {
    return entry.recyclable ? Math.floor(entry.weight * 0.7) : 0;
  };

  const getCompostableWeight = () => {
    return entry.compostable ? Math.floor(entry.weight * 0.8) : 0;
  };

  const getLandfillWeight = () => {
    const recyclable = getRecyclableWeight();
    const compostable = getCompostableWeight();
    return Math.max(0, entry.weight - recyclable - compostable);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {entry.imageUrl ? (
          <Image source={{ uri: entry.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Trash2 size={24} color="#9ca3af" />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {entry.description || `${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Waste`}
          </Text>
          <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
        </View>
        
        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Trash2 size={16} color="#111827" />
            <Text style={styles.metricValue}>{getWasteWeight()}g total</Text>
          </View>
          
          <View style={styles.breakdown}>
            {entry.recyclable && (
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.breakdownText}>{getRecyclableWeight()}g</Text>
              </View>
            )}
            {entry.compostable && (
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.breakdownText}>{getCompostableWeight()}g</Text>
              </View>
            )}
            {getLandfillWeight() > 0 && (
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: '#6b7280' }]} />
                <Text style={styles.breakdownText}>{getLandfillWeight()}g</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
  },
  metrics: {
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  breakdown: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6b7280',
  },
});