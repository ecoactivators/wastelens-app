import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Modal, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { router } from 'expo-router';
import { X, Zap, Image as ImageIcon, House, CircleCheck as CheckCircle, Circle as XCircle, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { StorageService } from '@/services/storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelinesLoading, setGuidelinesLoading] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const { theme } = useTheme();

  // Check if user has seen guidelines before
  useEffect(() => {
    const checkGuidelines = async () => {
      try {
        const hasSeenGuidelines = await StorageService.hasSeenGuidelines();
        setShowGuidelines(!hasSeenGuidelines);
      } catch (error) {
        console.error('Error checking guidelines status:', error);
        // Default to showing guidelines if there's an error
        setShowGuidelines(true);
      } finally {
        setGuidelinesLoading(false);
      }
    };

    checkGuidelines();
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={[theme.colors.background, '#000000']}
          style={styles.permissionGradient}
        >
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to take photos of waste items for analysis.
            </Text>
            <TouchableOpacity 
              style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]} 
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <Text style={[styles.permissionButtonText, { color: theme.colors.surface }]}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Show loading while checking guidelines status
  if (guidelinesLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const toggleFlash = () => {
    setFlash(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready. Please try again.');
      return;
    }

    try {
      console.log('📸 Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      
      if (photo && photo.uri) {
        console.log('✅ Photo taken successfully:', photo.uri);
        // Navigate to analysis screen with the photo
        router.push({
          pathname: '/analysis',
          params: { photoUri: photo.uri }
        });
      } else {
        console.error('❌ No photo URI returned');
        Alert.alert('Error', 'Failed to capture photo. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo library to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('✅ Image selected:', result.assets[0].uri);
        // Navigate to analysis screen with the selected image
        router.push({
          pathname: '/analysis',
          params: { photoUri: result.assets[0].uri }
        });
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const getFlashIcon = () => {
    switch (flash) {
      case 'on':
        return <Zap size={20} color="#ffffff" fill="#ffffff" strokeWidth={1.5} />;
      case 'auto':
        return <Zap size={20} color="#ffffff" strokeWidth={1.5} />;
      case 'off':
      default:
        return <Zap size={20} color="rgba(255, 255, 255, 0.5)" strokeWidth={1.5} />;
    }
  };

  const handleScanNow = async () => {
    try {
      // Mark guidelines as seen
      await StorageService.setGuidelinesSeen();
      setShowGuidelines(false);
    } catch (error) {
      console.error('Error saving guidelines status:', error);
      // Still hide guidelines even if saving fails
      setShowGuidelines(false);
    }
  };

  const handleCloseGuidelines = () => {
    // Navigate to home instead of going back
    router.push('/(tabs)');
  };

  const handleBackPress = () => {
    // Check if we can go back, otherwise go to home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  const handleHomePress = () => {
    // Navigate to home tab
    router.push('/(tabs)');
  };

  // Guidelines Modal
  if (showGuidelines) {
    return (
      <SafeAreaView style={[styles.guidelinesContainer, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={styles.guidelinesGradient}
        >
          <View style={[styles.guidelinesModal, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.guidelinesHeader}>
              <TouchableOpacity onPress={handleCloseGuidelines} style={styles.closeButton}>
                <X size={24} color={theme.colors.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={[styles.guidelinesTitle, { color: theme.colors.text }]}>
              Best scanning practices
            </Text>

            {/* Do and Don't Examples */}
            <View style={styles.examplesContainer}>
              <View style={styles.exampleColumn}>
                <View style={styles.exampleHeader}>
                  <CheckCircle size={18} color="#16a34a" strokeWidth={1.5} />
                  <Text style={[styles.exampleHeaderText, { color: theme.colors.text }]}>Do</Text>
                </View>
                <View style={[styles.exampleImageContainer, { backgroundColor: theme.colors.border }]}>
                  <Image 
                    source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
                    style={styles.exampleImage}
                  />
                  <View style={styles.scanFrame}>
                    <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
                    <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                    <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                    <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
                  </View>
                </View>
              </View>

              <View style={styles.exampleColumn}>
                <View style={styles.exampleHeader}>
                  <XCircle size={18} color="#ef4444" strokeWidth={1.5} />
                  <Text style={[styles.exampleHeaderText, { color: theme.colors.text }]}>Don't</Text>
                </View>
                <View style={[styles.exampleImageContainer, { backgroundColor: theme.colors.border }]}>
                  <Image 
                    source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
                    style={[styles.exampleImage, styles.blurredImage]}
                  />
                </View>
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>General tips:</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                    Keep the item inside the scan lines
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                    Hold your phone still so the image is not blurry
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                    Don't take the picture at obscure angles
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                    Ensure good lighting for better recognition
                  </Text>
                </View>
              </View>
            </View>

            {/* Scan Now Button */}
            <TouchableOpacity 
              style={[styles.scanNowButton, { backgroundColor: theme.colors.primary }]} 
              onPress={handleScanNow}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary]}
                style={styles.scanNowGradient}
              >
                <Text style={[styles.scanNowButtonText, { color: theme.colors.surface }]}>
                  Scan now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // For web platform, show a fallback UI since camera might not work
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={[theme.colors.background, '#000000']}
          style={styles.webFallbackGradient}
        >
          <View style={styles.webFallbackContainer}>
            <Text style={styles.webFallbackTitle}>Camera Not Available</Text>
            <Text style={styles.webFallbackText}>
              Camera functionality is not available on web. Please use the image picker to select a photo instead.
            </Text>
            <TouchableOpacity
              style={[styles.webFallbackButton, { backgroundColor: theme.colors.primary }]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <ImageIcon size={20} color={theme.colors.surface} strokeWidth={2} />
              <Text style={[styles.webFallbackButtonText, { color: theme.colors.surface }]}>
                Select Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.webFallbackBackButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleBackPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.webFallbackBackButtonText, { color: theme.colors.text }]}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        mode="picture"
      >
        {/* Top Controls */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topGradient}
        >
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleBackPress}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#ffffff" strokeWidth={1.5} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
              activeOpacity={0.8}
            >
              {getFlashIcon()}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Scan Frame */}
        <View style={styles.scanFrameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
          </View>
          <Text style={styles.scanInstructions}>
            Position the waste item within the frame
          </Text>
        </View>

        {/* Bottom Controls */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.bottomGradient}
        >
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <ImageIcon size={20} color="#ffffff" strokeWidth={1.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              activeOpacity={0.9}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleHomePress}
              activeOpacity={0.8}
            >
              <House size={20} color="#ffffff" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </CameraView>
    </View>
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
    backgroundColor: '#000000',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  permissionGradient: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  permissionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  // Web fallback styles
  webFallbackGradient: {
    flex: 1,
  },
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webFallbackTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  webFallbackText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  webFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  webFallbackButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  webFallbackBackButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  webFallbackBackButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  // Guidelines Modal Styles
  guidelinesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guidelinesGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  guidelinesModal: {
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  guidelinesHeader: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  guidelinesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 32,
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  examplesContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  exampleColumn: {
    flex: 1,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exampleHeaderText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  exampleImageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 0.75,
    position: 'relative',
  },
  exampleImage: {
    width: '100%',
    height: '100%',
  },
  blurredImage: {
    opacity: 0.7,
  },
  scanFrame: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    right: '15%',
    bottom: '15%',
  },
  scanCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#16a34a',
    borderWidth: 3,
  },
  scanCornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  scanCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tipsContainer: {
    marginBottom: 32,
  },
  tipsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    letterSpacing: 0.1,
  },
  scanNowButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  scanNowGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  scanNowButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  // Camera Styles
  camera: {
    flex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scanFrameContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanInstructions: {
    position: 'absolute',
    bottom: -50,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    letterSpacing: 0.2,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'flex-end',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ffffff',
  },
});