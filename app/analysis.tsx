import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trash2, CreditCard as Edit3, Send, X, Sparkles, CircleAlert as AlertCircle, MapPin, ExternalLink, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { openAIService } from '@/services/openai';
import { MapsService, MapSuggestion } from '@/services/maps';
import { useItems } from '@/contexts/ItemsContext';
import { WasteType, WasteCategory } from '@/types/waste';
import { useTheme } from '@/contexts/ThemeContext';

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
  mapSuggestions?: MapSuggestion[];
  confidence?: number;
}

export default function AnalysisScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { addItem } = useItems();
  const { theme } = useTheme();
  const [analysis, setAnalysis] = useState<WasteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [showFixModal, setShowFixModal] = useState(false);
  const [fixMessage, setFixMessage] = useState('');
  const [fixLoading, setFixLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showScoreInfoModal, setShowScoreInfoModal] = useState(false);

  useEffect(() => {
    if (photoUri) {
      analyzeWaste();
    } else {
      setError('No image provided');
      setLoading(false);
    }
  }, [photoUri]);

  const analyzeWaste = async () => {
    if (!photoUri) {
      setError('No image provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [AnalysisScreen] Starting waste analysis...');
      const result = await openAIService.analyzeWasteImage(photoUri);
      setAnalysis(result);
      setQuantity(result.quantity.toString());
      console.log('✅ [AnalysisScreen] Analysis completed successfully');
    } catch (error) {
      console.error('❌ [AnalysisScreen] Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze waste';
      setError(errorMessage);
      
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
          'Take to appropriate disposal facility',
          'Consider reusable alternatives',
          'Look for specialized recycling programs'
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

    if (!photoUri) {
      Alert.alert('Error', 'No image available for correction.');
      return;
    }

    setFixLoading(true);
    try {
      console.log('🔄 [AnalysisScreen] Starting feedback correction...');
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
      console.log('✅ [AnalysisScreen] Feedback correction completed');
    } catch (error) {
      console.error('❌ [AnalysisScreen] Fix error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update analysis';
      Alert.alert('Error', errorMessage);
    } finally {
      setFixLoading(false);
    }
  };

  const handleMapSuggestionPress = async (mapSuggestion: MapSuggestion) => {
    try {
      console.log('🗺️ [AnalysisScreen] Opening map suggestion:', mapSuggestion.searchQuery);
      await MapsService.openMapSuggestion(mapSuggestion);
      
      // Provide haptic feedback on mobile
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('❌ [AnalysisScreen] Error opening maps:', error);
      Alert.alert(
        'Unable to Open Maps',
        'Could not open the maps application. Please search for the location manually.',
        [{ text: 'OK' }]
      );
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

  const handleBackPress = () => {
    Alert.alert(
      'Discard Analysis',
      'Are you sure you want to discard this analysis? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const triggerSuccessVibration = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.warn('⚠️ [AnalysisScreen] Haptics not available:', error);
      }
    }
  };

  const handleDone = () => {
    try {
      if (analysis) {
        // Determine category based on analysis
        let category = WasteCategory.OTHER; // Default to "Other" instead of landfill
        
        if (analysis.recyclable) {
          category = WasteCategory.RECYCLING;
        } else if (analysis.compostable) {
          category = WasteCategory.COMPOSTING;
        } else {
          // Smart routing: check if this is truly a landfill item (like chip bags)
          const lowerSuggestions = analysis.suggestions.join(' ').toLowerCase();
          const lowerItemName = analysis.itemName.toLowerCase();
          const lowerMaterial = analysis.material.toLowerCase();
          
          // Check for chip bags and multi-material laminates that truly belong in landfill
          if ((lowerItemName.includes('chip') && lowerItemName.includes('bag')) ||
              (lowerMaterial.includes('multi-material') && lowerMaterial.includes('laminate')) ||
              (lowerMaterial.includes('metallized') && lowerMaterial.includes('layer')) ||
              (lowerSuggestions.includes('general waste') && lowerSuggestions.includes('laminate')) ||
              (analysis.environmentScore <= 2 && lowerSuggestions.includes('general waste'))) {
            category = WasteCategory.LANDFILL;
          } else {
            category = WasteCategory.OTHER; // Route to "Other" for special handling
          }
        }

        // Determine waste type based on item name and material
        let wasteType = WasteType.OTHER;
        const material = analysis.material.toLowerCase();
        const itemName = analysis.itemName.toLowerCase();
        
        // Smart type detection including chip bags
        if (material.includes('food') || itemName.includes('food') || 
            itemName.includes('apple') || itemName.includes('banana') || 
            itemName.includes('bread') || itemName.includes('pizza') ||
            analysis.compostable) {
          wasteType = WasteType.FOOD;
        } else if ((itemName.includes('chip') && itemName.includes('bag')) ||
                   (material.includes('multi-material') && material.includes('laminate'))) {
          wasteType = WasteType.CHIP_BAGS;
        } else if (material.includes('ceramic') || itemName.includes('ceramic') ||
                   itemName.includes('pottery') || itemName.includes('dish') ||
                   itemName.includes('plate') || itemName.includes('bowl') ||
                   itemName.includes('tile') || itemName.includes('sink') ||
                   itemName.includes('toilet')) {
          wasteType = WasteType.CERAMICS;
        } else if (material.includes('plastic') || itemName.includes('plastic')) {
          if (itemName.includes('film') || itemName.includes('bag')) {
            wasteType = WasteType.PLASTIC_FILM;
          } else {
            wasteType = WasteType.PLASTIC;
          }
        } else if (material.includes('electronic') || itemName.includes('electronic') ||
                   itemName.includes('phone') || itemName.includes('computer')) {
          wasteType = WasteType.ELECTRONIC;
        } else if (material.includes('battery') || itemName.includes('battery')) {
          wasteType = WasteType.BATTERIES;
        } else if (material.includes('textile') || itemName.includes('clothing') ||
                   itemName.includes('fabric')) {
          wasteType = WasteType.TEXTILE;
        } else if (material.includes('glass')) {
          wasteType = WasteType.GLASS;
        } else if (material.includes('metal') || material.includes('aluminum')) {
          wasteType = WasteType.METAL;
        } else if (material.includes('paper') || material.includes('cardboard')) {
          wasteType = WasteType.PAPER;
        }

        console.log('💾 [AnalysisScreen] Adding item to ItemsContext:', {
          type: wasteType,
          category: category,
          weight: analysis.weight,
          description: analysis.itemName,
          imageUrl: photoUri,
          recyclable: analysis.recyclable,
          compostable: analysis.compostable,
        });

        // Add item to the ItemsContext with AI analysis data
        const newItem = addItem({
          type: wasteType,
          category: category,
          weight: analysis.weight,
          description: analysis.itemName,
          imageUrl: photoUri,
          recyclable: analysis.recyclable,
          compostable: analysis.compostable,
          // Save the complete AI analysis with the item
          aiAnalysis: {
            environmentScore: analysis.environmentScore,
            carbonFootprint: analysis.carbonFootprint,
            suggestions: analysis.suggestions,
            mapSuggestions: analysis.mapSuggestions,
            confidence: analysis.confidence || 0.5,
            material: analysis.material,
          }
        });

        console.log('✅ [AnalysisScreen] Item added successfully with AI analysis:', newItem);

        // Trigger success vibration instead of showing alert
        triggerSuccessVibration();

        // Navigate back to camera screen instead of home
        router.push('/camera');
      } else {
        router.push('/camera');
      }
    } catch (error) {
      console.error('❌ [AnalysisScreen] Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
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
    if (!confidence) return theme.colors.textSecondary;
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

  const renderSuggestionWithMapButton = (suggestion: string, index: number) => {
    const mapSuggestion = analysis?.mapSuggestions?.find(ms => ms.text === suggestion);
    
    return (
      <View key={index} style={styles.suggestionItem}>
        <View style={[styles.suggestionDot, { backgroundColor: theme.colors.primary }]} />
        <View style={styles.suggestionContent}>
          <Text style={[styles.suggestionText, { color: theme.colors.textSecondary }]}>
            {suggestion}
          </Text>
          {mapSuggestion && (
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleMapSuggestionPress(mapSuggestion)}
            >
              <MapPin size={14} color={theme.colors.surface} />
              <Text style={[styles.mapButtonText, { color: theme.colors.surface }]}>Open in Maps</Text>
              <ExternalLink size={12} color={theme.colors.surface} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Analyzing waste with AI...</Text>
          <Text style={[styles.loadingSubtext, { color: theme.colors.textTertiary }]}>Finding the best disposal method</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>Failed to analyze waste</Text>
          <Text style={[styles.errorSubtext, { color: theme.colors.textTertiary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={analyzeWaste}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.overlay }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Disposal</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
          <Trash2 size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => setShowImageModal(true)}
          activeOpacity={0.9}
        >
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
        </TouchableOpacity>

        {/* Analysis Card */}
        <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
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
              <Text style={[styles.itemName, { color: theme.colors.text }]}>{analysis.itemName}</Text>
              <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={[styles.quantityContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.quantityInput, { color: theme.colors.text }]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <Edit3 size={16} color={theme.colors.textSecondary} />
            </View>
          </View>

          {/* Weight and Material */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Weight</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{analysis.weight}g</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Material</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{analysis.material}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Carbon</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{analysis.carbonFootprint}kg CO₂</Text>
            </View>
          </View>

          {/* Properties */}
          <View style={styles.propertiesContainer}>
            {analysis.recyclable && (
              <View style={[styles.propertyBadge, styles.recyclableBadge]}>
                <Text style={styles.recyclableText}>Recycling Bin</Text>
              </View>
            )}
            {analysis.compostable && (
              <View style={[styles.propertyBadge, styles.compostableBadge]}>
                <Text style={styles.compostableText}>Compostable</Text>
              </View>
            )}
            {!analysis.recyclable && !analysis.compostable && (
              <View style={[styles.propertyBadge, styles.specialBadge]}>
                <Text style={styles.specialText}>Special Handling</Text>
              </View>
            )}
          </View>

          {/* Environment Score */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreHeader}>
              <Sparkles size={20} color={getScoreColor(analysis.environmentScore)} />
              <Text style={[styles.scoreTitle, { color: theme.colors.text }]}>Environment Score</Text>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => setShowScoreInfoModal(true)}
                activeOpacity={0.7}
              >
                <Info size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.scoreValue, { color: getScoreColor(analysis.environmentScore) }]}>
                {analysis.environmentScore}/10
              </Text>
            </View>
            <View style={[styles.scoreBarContainer, { backgroundColor: theme.colors.border }]}>
              <LinearGradient
                colors={getScoreGradient(analysis.environmentScore)}
                style={[styles.scoreBar, { width: `${analysis.environmentScore * 10}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* AI Suggestions with Map Buttons */}
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: theme.colors.text }]}>Smart Disposal Guide</Text>
            {analysis.suggestions.map((suggestion, index) => 
              renderSuggestionWithMapButton(suggestion, index)
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={[styles.fixButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} 
          onPress={() => setShowFixModal(true)}
        >
          <Text style={[styles.fixButtonText, { color: theme.colors.text }]}>Fix Results</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.doneButton, { backgroundColor: theme.colors.text }]} onPress={handleDone}>
          <Text style={[styles.doneButtonText, { color: theme.colors.surface }]}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Environmental Score Info Modal */}
      <Modal
        visible={showScoreInfoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowScoreInfoModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Environmental Score</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.scoreInfoCard, { backgroundColor: theme.colors.background }]}>
              <View style={styles.scoreInfoHeader}>
                <Sparkles size={24} color={getScoreColor(analysis.environmentScore)} />
                <Text style={[styles.scoreInfoTitle, { color: theme.colors.text }]}>
                  What is the Environmental Score?
                </Text>
              </View>
              <Text style={[styles.scoreInfoDescription, { color: theme.colors.textSecondary }]}>
                The Environmental Score rates how well an item can be diverted from landfills. 
                Higher scores mean better disposal options and lower environmental impact.
              </Text>
            </View>

            <View style={[styles.scoreInfoCard, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.scoreInfoSectionTitle, { color: theme.colors.text }]}>
                How is it calculated?
              </Text>
              <View style={styles.scoreFactorsList}>
                <View style={styles.scoreFactor}>
                  <View style={[styles.scoreFactorDot, { backgroundColor: '#10b981' }]} />
                  <View style={styles.scoreFactorContent}>
                    <Text style={[styles.scoreFactorTitle, { color: theme.colors.text }]}>Disposal Options</Text>
                    <Text style={[styles.scoreFactorDescription, { color: theme.colors.textSecondary }]}>
                      Items with multiple disposal routes (recycling, donation, special programs) score higher
                    </Text>
                  </View>
                </View>
                
                <View style={styles.scoreFactor}>
                  <View style={[styles.scoreFactorDot, { backgroundColor: '#f59e0b' }]} />
                  <View style={styles.scoreFactorContent}>
                    <Text style={[styles.scoreFactorTitle, { color: theme.colors.text }]}>Environmental Impact</Text>
                    <Text style={[styles.scoreFactorDescription, { color: theme.colors.textSecondary }]}>
                      Items that can be composted or easily recycled have lower environmental impact
                    </Text>
                  </View>
                </View>
                
                <View style={styles.scoreFactor}>
                  <View style={[styles.scoreFactorDot, { backgroundColor: '#3b82f6' }]} />
                  <View style={styles.scoreFactorContent}>
                    <Text style={[styles.scoreFactorTitle, { color: theme.colors.text }]}>Accessibility</Text>
                    <Text style={[styles.scoreFactorDescription, { color: theme.colors.textSecondary }]}>
                      How easy it is to find proper disposal locations in your area
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.scoreInfoCard, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.scoreInfoSectionTitle, { color: theme.colors.text }]}>
                Score Ranges
              </Text>
              <View style={styles.scoreRangesList}>
                <View style={styles.scoreRange}>
                  <View style={[styles.scoreRangeIndicator, { backgroundColor: '#10b981' }]} />
                  <Text style={[styles.scoreRangeText, { color: theme.colors.text }]}>8-10: Excellent</Text>
                  <Text style={[styles.scoreRangeDescription, { color: theme.colors.textSecondary }]}>
                    Multiple disposal options, easily diverted from landfill
                  </Text>
                </View>
                
                <View style={styles.scoreRange}>
                  <View style={[styles.scoreRangeIndicator, { backgroundColor: '#f59e0b' }]} />
                  <Text style={[styles.scoreRangeText, { color: theme.colors.text }]}>4-7: Good</Text>
                  <Text style={[styles.scoreRangeDescription, { color: theme.colors.textSecondary }]}>
                    Some disposal options available with effort
                  </Text>
                </View>
                
                <View style={styles.scoreRange}>
                  <View style={[styles.scoreRangeIndicator, { backgroundColor: '#ef4444' }]} />
                  <Text style={[styles.scoreRangeText, { color: theme.colors.text }]}>1-3: Limited</Text>
                  <Text style={[styles.scoreRangeDescription, { color: theme.colors.textSecondary }]}>
                    Few disposal options, may require landfill
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.scoreInfoCard, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.scoreInfoSectionTitle, { color: theme.colors.text }]}>
                Your Item's Score: {analysis.environmentScore}/10
              </Text>
              <Text style={[styles.scoreInfoDescription, { color: theme.colors.textSecondary }]}>
                {analysis.environmentScore >= 8 
                  ? "Excellent! This item has great disposal options that keep it out of landfills."
                  : analysis.environmentScore >= 4
                  ? "Good options available. Follow the disposal recommendations to minimize environmental impact."
                  : "Limited options, but we've found the best available disposal method for this item."
                }
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <View style={styles.fullscreenImageContainer}>
          <TouchableOpacity
            style={styles.closeFullscreenButton}
            onPress={() => setShowImageModal(false)}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <Image 
            source={{ uri: photoUri }} 
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Fix Results Modal */}
      <Modal
        visible={showFixModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowFixModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Fix Results</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Tell our AI what we got wrong and we'll improve the analysis
            </Text>
            <TextInput
              style={[styles.fixInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={fixMessage}
              onChangeText={setFixMessage}
              placeholder="Example: This is actually a glass bottle, not plastic..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: theme.colors.primary }, fixLoading && styles.sendButtonDisabled]} 
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
    marginTop: 16,
  },
  loadingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
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
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
  },
  quantityInput: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
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
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
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
  specialBadge: {
    backgroundColor: '#e0e7ff',
  },
  specialText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#3b82f6',
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
    marginLeft: 8,
    flex: 1,
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  scoreValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  scoreBarContainer: {
    height: 8,
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
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
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
    borderTopWidth: 1,
  },
  fixButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fixButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  doneButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  fullscreenImageContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullscreenButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  fixInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 120,
    marginBottom: 24,
  },
  sendButton: {
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
  // Environmental Score Info Modal Styles
  scoreInfoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  scoreInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  scoreInfoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    flex: 1,
  },
  scoreInfoDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  scoreInfoSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 16,
  },
  scoreFactorsList: {
    gap: 16,
  },
  scoreFactor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  scoreFactorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  scoreFactorContent: {
    flex: 1,
  },
  scoreFactorTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  scoreFactorDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  scoreRangesList: {
    gap: 16,
  },
  scoreRange: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  scoreRangeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  scoreRangeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
    minWidth: 100,
  },
  scoreRangeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});