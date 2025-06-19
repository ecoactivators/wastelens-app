import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Shield, Zap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { LocationService } from '@/services/location';

const { width, height } = Dimensions.get('window');

export default function LocationScreen() {
  const { theme } = useTheme();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllowLocation = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await LocationService.requestLocationPermission();
      
      if (granted) {
        // Try to get current location to cache it
        await LocationService.getCurrentLocation();
        router.push('/onboarding/auth');
      } else {
        Alert.alert(
          'Location Permission Required',
          'Location access helps us provide personalized waste disposal recommendations for your area. You can enable this later in Settings.',
          [
            { text: 'Skip for now', onPress: () => router.push('/onboarding/auth') },
            { text: 'Try again', onPress: handleAllowLocation }
          ]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert(
        'Error',
        'There was an issue requesting location permission. You can enable this later in Settings.',
        [
          { text: 'Continue', onPress: () => router.push('/onboarding/auth') }
        ]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/auth');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
          </TouchableOpacity>
          
          {/* Progress Bar */}
          <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.text, width: '50%' }]} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Enable location access
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            We use your location to provide personalized waste disposal recommendations and find nearby recycling centers.
          </Text>

          {/* Location Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg' }}
              style={styles.locationImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
            />
            <View style={styles.mapIconContainer}>
              <MapPin size={28} color="#ffffff" strokeWidth={2} />
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <MapPin size={18} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.benefitText}>
                <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                  Local Recommendations
                </Text>
                <Text style={[styles.benefitDescription, { color: theme.colors.textSecondary }]}>
                  Find nearby recycling centers and disposal facilities
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#dcfce7' }]}>
                <Zap size={18} color="#16a34a" strokeWidth={2} />
              </View>
              <View style={styles.benefitText}>
                <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                  Smart Suggestions
                </Text>
                <Text style={[styles.benefitDescription, { color: theme.colors.textSecondary }]}>
                  Get disposal tips specific to your city's guidelines
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#fef3c7' }]}>
                <Shield size={18} color="#f59e0b" strokeWidth={2} />
              </View>
              <View style={styles.benefitText}>
                <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                  Privacy Protected
                </Text>
                <Text style={[styles.benefitDescription, { color: theme.colors.textSecondary }]}>
                  Your location data is never shared with third parties
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.allowButton, { backgroundColor: theme.colors.text }]}
            onPress={handleAllowLocation}
            disabled={isRequesting}
            activeOpacity={0.9}
          >
            <Text style={[styles.allowButtonText, { color: theme.colors.surface }]}>
              {isRequesting ? 'Requesting...' : 'Allow Location Access'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: height * 0.02,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: height * 0.01,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.min(width * 0.075, 30),
    marginBottom: 12,
    lineHeight: Math.min(width * 0.09, 36),
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: height * 0.03,
  },
  imageContainer: {
    position: 'relative',
    height: Math.min(height * 0.22, 180),
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: height * 0.03,
  },
  locationImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  mapIconContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsContainer: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  benefitIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    marginBottom: 3,
  },
  benefitDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: height * 0.04,
    paddingTop: height * 0.02,
    gap: 12,
  },
  allowButton: {
    borderRadius: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  allowButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    textAlign: 'center',
  },
});