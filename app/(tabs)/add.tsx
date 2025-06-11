import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWasteData } from '@/hooks/useWasteData';
import { WasteType, WasteCategory } from '@/types/waste';
import { Camera, Plus, Minus, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';

const wasteTypes = [
  { type: WasteType.FOOD, label: 'Food', color: '#f59e0b' },
  { type: WasteType.PLASTIC, label: 'Plastic', color: '#3b82f6' },
  { type: WasteType.PAPER, label: 'Paper', color: '#8b5cf6' },
  { type: WasteType.GLASS, label: 'Glass', color: '#06b6d4' },
  { type: WasteType.METAL, label: 'Metal', color: '#6b7280' },
  { type: WasteType.ELECTRONIC, label: 'Electronic', color: '#ef4444' },
  { type: WasteType.TEXTILE, label: 'Textile', color: '#ec4899' },
  { type: WasteType.ORGANIC, label: 'Organic', color: '#10b981' },
  { type: WasteType.HAZARDOUS, label: 'Hazardous', color: '#dc2626' },
  { type: WasteType.OTHER, label: 'Other', color: '#64748b' },
];

export default function AddScreen() {
  const { addEntry } = useWasteData();
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [recyclable, setRecyclable] = useState(false);
  const [compostable, setCompostable] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleWeightChange = (delta: number) => {
    const currentWeight = parseInt(weight) || 0;
    const newWeight = Math.max(0, currentWeight + delta);
    setWeight(newWeight.toString());
  };

  const determineCategory = (): WasteCategory => {
    if (recyclable) return WasteCategory.RECYCLABLE;
    if (compostable) return WasteCategory.COMPOSTABLE;
    return WasteCategory.LANDFILL;
  };

  const handleSubmit = () => {
    if (!selectedType || !weight || parseInt(weight) <= 0) {
      Alert.alert('Error', 'Please select a waste type and enter a valid weight.');
      return;
    }

    addEntry({
      type: selectedType,
      category: determineCategory(),
      weight: parseInt(weight),
      description: description.trim() || undefined,
      imageUrl: imageUrl || undefined,
      recyclable,
      compostable,
    });

    // Reset form
    setSelectedType(null);
    setWeight('');
    setDescription('');
    setRecyclable(false);
    setCompostable(false);
    setImageUrl(null);

    Alert.alert('Success', 'Waste entry added successfully!', [
      { text: 'OK', onPress: () => router.push('/') }
    ]);
  };

  const handleTakePhoto = () => {
    // Mock photo URL for demonstration
    const mockPhotoUrls = [
      'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg',
      'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg',
      'https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg',
    ];
    const randomUrl = mockPhotoUrls[Math.floor(Math.random() * mockPhotoUrls.length)];
    setImageUrl(randomUrl);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Waste</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo (Optional)</Text>
          {imageUrl ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: imageUrl }} style={styles.photo} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleTakePhoto}
              >
                <Camera size={16} color="#ffffff" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Camera size={32} color="#6b7280" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Waste Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Type</Text>
          <View style={styles.typeGrid}>
            {wasteTypes.map(({ type, label, color }) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedType === type && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type && { color: '#ffffff' },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weight Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight (grams)</Text>
          <View style={styles.weightContainer}>
            <TouchableOpacity
              style={styles.weightButton}
              onPress={() => handleWeightChange(-10)}
            >
              <Minus size={20} color="#6b7280" />
            </TouchableOpacity>
            <TextInput
              style={styles.weightInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.weightButton}
              onPress={() => handleWeightChange(10)}
            >
              <Plus size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.quickWeights}>
            {[50, 100, 250, 500].map(w => (
              <TouchableOpacity
                key={w}
                style={styles.quickWeightButton}
                onPress={() => setWeight(w.toString())}
              >
                <Text style={styles.quickWeightText}>{w}g</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Properties</Text>
          <View style={styles.propertiesContainer}>
            <TouchableOpacity
              style={[styles.propertyButton, recyclable && styles.propertyButtonActive]}
              onPress={() => setRecyclable(!recyclable)}
            >
              {recyclable && <Check size={16} color="#10b981" />}
              <Text style={[styles.propertyText, recyclable && styles.propertyTextActive]}>
                Recyclable
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.propertyButton, compostable && styles.propertyButtonActive]}
              onPress={() => setCompostable(!compostable)}
            >
              {compostable && <Check size={16} color="#f59e0b" />}
              <Text style={[styles.propertyText, compostable && styles.propertyTextActive]}>
                Compostable
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details about this waste item..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedType || !weight || parseInt(weight) <= 0) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedType || !weight || parseInt(weight) <= 0}
          >
            <Text style={styles.submitButtonText}>Add Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  retakeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  retakeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#ffffff',
  },
  photoButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  photoButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6b7280',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: '30%',
    alignItems: 'center',
  },
  typeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#374151',
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  weightButton: {
    padding: 16,
  },
  weightInput: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    paddingVertical: 16,
  },
  quickWeights: {
    flexDirection: 'row',
    gap: 8,
  },
  quickWeightButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickWeightText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
  },
  propertiesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  propertyButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  propertyButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  propertyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
  },
  propertyTextActive: {
    color: '#10b981',
  },
  descriptionInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});