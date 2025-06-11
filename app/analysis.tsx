import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trash2, CreditCard as Edit3, Send, X, Sparkles, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { openAIService } from '@/services/openai';
import { useWasteData } from '@/hooks/useWasteData';
import { WasteType, WasteCategory } from '@/types/waste';

interface WasteAnalysis {
  itemName: string;
  quantity: number;
  weight: number;
  material: string;
  environmentScore: number;
  recyclable: boolean;
  compostable: boolean;
  carbonFootprint: number;
  suggestions: string[];
  confidence?: number;
}

export default function AnalysisScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { addEntry } = useWasteData();
  const [analysis, setAnalysis] = useState<WasteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [showFixModal, setShowFixModal] = useState(false);
  const [fixMessage, setFixMessage] = useState('');
  const [fixLoading, setFixLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (photoUri) {
      analyzeWaste();
    }
  }, [photoUri]);

  const analyzeWaste = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await openAIService.analyzeWasteImage(photoUri);
      setAnalysis(result);
      setQuantity(result.quantity.toString());
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze waste');
      
      // Fallback to mock data if API fails
      const mockAnalysis: WasteAnalysis = {
        itemName: 'Unidentified Item',
        quantity: 1,
        weight: 50,
        material: 'Mixed Material',
        environmentScore: 5,
        recyclable: false,
        compostable: false,
        carbonFootprint: 0.1,
        suggestions: [
          'Check local recycling guidelines',
          'Consider reusable alternatives',
          'Dispose of responsibly'
        ],
        confidence: 0.3
      };
      
      setAnalysis(mockAnalysis);
      setQuantity(mockAnalysis.quantity.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleFixResults = async () => {
    if (!fixMessage.trim()) {
      Alert.alert('Error', 'Please describe what needs to be fixed.');
      return;
    }

    if (!analysis) {
      Alert.alert('Error', 'No analysis to fix.');
      return;
    }

    setFixLoading(true);
    try {
      const correctedAnalysis = await openAIService.fixAnalysisWithFeedback(
        analysis,
        fixMessage,
        photoUri
      );
      
      setAnalysis(correctedAnalysis);
      setQuantity(correctedAnalysis.quantity.toString());
      setShowFixModal(false);
      setFixMessage('');
      setError(null);
      Alert.alert('Success', 'Analysis has been updated based on your feedback.');
    } catch (error) {
      console.error('Fix error:', error);
      Alert.alert('Error', 'Failed to update analysis. Please try again.');
    } finally {
      setFixLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this scanned item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleDone = () => {
    if (analysis) {
      // Determine waste type based on material
      let wasteType = WasteType.OTHER;
      const material = analysis.material.toLowerCase();
      
      if (material.includes('plastic')) wasteType = WasteType.PLASTIC;
      else if (material.includes('paper') || material.includes('cardboard')) wasteType = WasteType.PAPER;
      else if (material.includes('glass')) wasteType = WasteType.GLASS;
      else if (material.includes('metal') || material.includes('aluminum')) wasteType = WasteType.METAL;
      else if (material.includes('food') || material.includes('organic')) wasteType = WasteType.FOOD;
      else if (material.includes('textile') || material.includes('fabric')) wasteType = WasteType.TEXTILE;
      else if (material.includes('electronic')) wasteType = WasteType.ELECTRONIC;

      // Determine category
      let category = WasteCategory.LANDFILL;
      if (analysis.recyclable) category = WasteCategory.RECYCLABLE;
      else if (analysis.compostable) category = WasteCategory.COMPOSTABLE;

      // Add entry to the data
      addEntry({
        type: wasteType,
        category: category,
        weight: analysis.weight,
        description: analysis.itemName,
        imageUrl: photoUri,
        recyclable: analysis.recyclable,
        compostable: analysis.compostable,
      });

      Alert.alert('Success', 'Item has been logged successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/')
        }
      ]);
    } else {
      router.push('/');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return '#10b981';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 7) return ['#10b981', '#059669'];
    if (score >= 4) return ['#f59e0b', '#d97706'];
    return ['#ef4444', '#dc2626'];
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return '#6b7280';
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Analyzing waste with AI...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to analyze waste</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={analyzeWaste}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Analysis</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
          <Trash2 size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
          
          {/* Confidence Badge */}
          {analysis.confidence !== undefined && (
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(analysis.confidence) }]}>
              <Text style={styles.confidenceText}>
                {getConfidenceText(analysis.confidence)}
              </Text>
            </View>
          )}
        </View>

        {/* Analysis Card */}
        <View style={styles.analysisCard}>
          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color="#f59e0b" />
              <Text style={styles.errorBannerText}>
                Using fallback analysis - API unavailable
              </Text>
            </View>
          )}

          {/* Item Info */}
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{analysis.itemName}</Text>
              <Text style={styles.timestamp}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.quantityContainer}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <Edit3 size={16} color="#6b7280" />
            </View>
          </View>

          {/* Weight and Material */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{analysis.weight}g</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Material</Text>
              <Text style={styles.detailValue}>{analysis.material}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Carbon</Text>
              <Text style={styles.detailValue}>{analysis.carbonFootprint}kg CO₂</Text>
            </View>
          </View>

          {/* Properties */}
          <View style={styles.propertiesContainer}>
            {analysis.recyclable && (
              <View style={[styles.propertyBadge, styles.recyclableBadge]}>
                <Text style={styles.recyclableText}>Recyclable</Text>
              </View>
            )}
            {analysis.compostable && (
              <View style={[styles.propertyBadge, styles.compostableBadge]}>
                <Text style={styles.compostableText}>Compostable</Text>
              </View>
            )}
            {!analysis.recyclable && !analysis.compostable && (
              <View style={[styles.propertyBadge, styles.landfillBadge]}>
                <Text style={styles.landfillText}>Landfill</Text>
              </View>
            )}
          </View>

          {/* Environment Score */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreHeader}>
              <Sparkles size={20} color={getScoreColor(analysis.environmentScore)} />
              <Text style={styles.scoreTitle}>Environment Score</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(analysis.environmentScore) }]}>
                {analysis.environmentScore}/10
              </Text>
            </View>
            <View style={styles.scoreBarContainer}>
              <LinearGradient
                colors={getScoreGradient(analysis.environmentScore)}
                style={[styles.scoreBar, { width: `${analysis.environmentScore * 10}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* AI Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>AI Recommendations</Text>
            {analysis.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <View style={styles.suggestionDot} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.fixButton} 
          onPress={() => setShowFixModal(true)}
        >
          <Text style={styles.fixButtonText}>Fix Results</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Fix Results Modal */}
      <Modal
        visible={showFixModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFixModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Fix Results</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Tell our AI what we got wrong and we'll improve the analysis
            </Text>
            <TextInput
              style={styles.fixInput}
              value={fixMessage}
              onChangeText={setFixMessage}
              placeholder="Example: This is actually a glass bottle, not plastic..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={[styles.sendButton, fixLoading && styles.sendButtonDisabled]} 
              onPress={handleFixResults}
              disabled={fixLoading}
            >
              {fixLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Send size={16} color="#ffffff" />
                  <Text style={styles.sendButtonText}>Send to AI</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginTop: 16,
  },
  loadingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  analysisCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  errorBannerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#92400e',
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  quantityInput: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
    marginRight: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#111827',
  },
  propertiesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  propertyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  landfillBadge: {
    backgroundColor: '#fee2e2',
  },
  landfillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#dc2626',
  },
  scoreContainer: {
    marginBottom: 32,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  scoreValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginTop: 6,
    marginRight: 12,
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  fixButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fixButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#374151',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  fixInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    marginBottom: 24,
  },
  sendButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});