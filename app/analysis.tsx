import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MapPin, ExternalLink, Sparkles, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { openAIService } from '@/services/openai';
import { MapsService, MapSuggestion } from '@/services/maps';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  withDelay,
  interpolate
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

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
  const [analysis, setAnalysis] = useState<WasteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const loadingProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0);
  const suggestionOpacity = useSharedValue(0);

  useEffect(() => {
    if (photoUri) {
      analyzeWaste();
    } else {
      setError('No image provided');
      setLoading(false);
    }
  }, [photoUri]);

  useEffect(() => {
    if (loading) {
      // Loading animation
      loadingProgress.value = withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(0.7, { duration: 1500 }),
        withTiming(1, { duration: 1000 })
      );
    } else if (analysis) {
      // Results animation
      contentOpacity.value = withTiming(1, { duration: 800 });
      scoreScale.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 200 }));
      suggestionOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    }
  }, [loading, analysis]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleMapSuggestionPress = async (mapSuggestion: MapSuggestion) => {
    try {
      console.log('🗺️ [AnalysisScreen] Opening map suggestion:', mapSuggestion.searchQuery);
      await MapsService.openMapSuggestion(mapSuggestion);
    } catch (error) {
      console.error('❌ [AnalysisScreen] Error opening maps:', error);
      Alert.alert(
        'Unable to Open Maps',
        'Could not open the maps application. Please search for the location manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return '#1ed0f3';
    if (score >= 4) return '#e9d29b';
    return '#cc36a5';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 7) return ['#1ed0f3', '#14a1bb'];
    if (score >= 4) return ['#e9d29b', '#d4b86a'];
    return ['#cc36a5', '#a02d85'];
  };

  const renderSuggestionWithMapButton = (suggestion: string, index: number) => {
    const mapSuggestion = analysis?.mapSuggestions?.find(ms => ms.text === suggestion);
    
    return (
      <Animated.View key={index} style={[styles.suggestionItem, { opacity: suggestionOpacity.value }]}>
        <View style={styles.suggestionDot} />
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionText}>
            {suggestion}
          </Text>
          {mapSuggestion && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => handleMapSuggestionPress(mapSuggestion)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1ed0f3', '#14a1bb']}
                style={styles.mapButtonGradient}
              >
                <MapPin size={14} color="#ffffff" strokeWidth={2} />
                <Text style={styles.mapButtonText}>Open in Maps</Text>
                <ExternalLink size={12} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // Animated styles
  const loadingProgressStyle = useAnimatedStyle(() => ({
    width: `${loadingProgress.value * 100}%`,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#001123', '#013655']} style={styles.loadingContainer}>
          <SafeAreaView style={styles.loadingSafeArea}>
            <View style={styles.loadingContent}>
              <Text style={styles.loadingTitle}>Tesla Trash</Text>
              <Text style={styles.loadingSubtitle}>Analyzing with AI...</Text>
              
              <View style={styles.loadingBarContainer}>
                <Animated.View style={[styles.loadingBar, loadingProgressStyle]} />
              </View>
              
              <Text style={styles.loadingText}>Finding the best disposal method</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#001123', '#013655']} style={styles.errorContainer}>
          <SafeAreaView style={styles.errorSafeArea}>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={analyzeWaste}>
                <LinearGradient
                  colors={['#cc36a5', '#1ed0f3']}
                  style={styles.retryButtonGradient}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#001123', '#013655']} style={styles.gradient}>
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <View style={styles.backButton} />
        </SafeAreaView>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUri }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(0,17,35,0.8)']}
              style={styles.imageOverlay}
            />
          </View>

          {/* Analysis Card */}
          <Animated.View style={[styles.analysisCard, contentStyle]}>
            {/* Item Info */}
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{analysis.itemName}</Text>
              <Text style={styles.timestamp}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            {/* Details */}
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
                <View style={styles.recyclableBadge}>
                  <Text style={styles.recyclableText}>Recycling Bin</Text>
                </View>
              )}
              {analysis.compostable && (
                <View style={styles.compostableBadge}>
                  <Text style={styles.compostableText}>Compostable</Text>
                </View>
              )}
              {!analysis.recyclable && !analysis.compostable && (
                <View style={styles.specialBadge}>
                  <Text style={styles.specialText}>Special Handling</Text>
                </View>
              )}
            </View>

            {/* Environment Score */}
            <Animated.View style={[styles.scoreContainer, scoreStyle]}>
              <View style={styles.scoreHeader}>
                <Sparkles size={20} color={getScoreColor(analysis.environmentScore)} strokeWidth={2} />
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
            </Animated.View>

            {/* Smart Disposal Guide */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Smart Disposal Guide</Text>
              {analysis.suggestions.map((suggestion, index) => 
                renderSuggestionWithMapButton(suggestion, index)
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <SafeAreaView style={styles.bottomAction}>
          <TouchableOpacity style={styles.doneButton} onPress={() => router.push('/')}>
            <LinearGradient
              colors={['#cc36a5', '#1ed0f3']}
              style={styles.doneButtonGradient}
            >
              <Text style={styles.doneButtonText}>Analyze Another</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001123',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingContent: {
    alignItems: 'center',
    width: '100%',
  },
  loadingTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1ed0f3',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  loadingBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#1ed0f3',
    borderRadius: 2,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e9d29b',
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
  },
  errorSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#e9d29b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  backButton: {
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
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
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
    height: 80,
  },
  analysisCard: {
    backgroundColor: '#013655',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  itemHeader: {
    marginBottom: 24,
  },
  itemName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e9d29b',
    letterSpacing: 0.3,
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
    color: '#e9d29b',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  propertiesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  recyclableBadge: {
    backgroundColor: 'rgba(30, 208, 243, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1ed0f3',
  },
  recyclableText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#1ed0f3',
    letterSpacing: 0.3,
  },
  compostableBadge: {
    backgroundColor: 'rgba(233, 210, 155, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9d29b',
  },
  compostableText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#e9d29b',
    letterSpacing: 0.3,
  },
  specialBadge: {
    backgroundColor: 'rgba(204, 54, 165, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cc36a5',
  },
  specialText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#cc36a5',
    letterSpacing: 0.3,
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
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
    letterSpacing: 0.3,
  },
  scoreValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 0.3,
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
    backgroundColor: '#1ed0f3',
    marginTop: 6,
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e9d29b',
    lineHeight: 20,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  mapButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  doneButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#cc36a5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  doneButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});