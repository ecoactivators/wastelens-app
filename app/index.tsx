import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { router } from 'expo-router';
import { Camera, Image as ImageIcon, Zap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Animation values
  const captureScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const scanFrameScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    titleOpacity.value = withTiming(1, { duration: 800 });
    scanFrameScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, []);

  const handleCameraReady = () => {
    setCameraReady(true);
    console.log('📸 Camera is ready');
  };

  const handleCameraMountError = (error: any) => {
    console.error('❌ Camera mount error:', error);
    setCameraReady(false);
  };

  const triggerCaptureAnimation = () => {
    // Flash effect
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );
    
    // Capture button animation
    captureScale.value = withSequence(
      withSpring(0.8, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );
  };

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady || isCapturing) {
      if (!cameraReady) {
        Alert.alert('Camera Not Ready', 'Please wait for the camera to initialize and try again.');
      }
      return;
    }

    setIsCapturing(true);
    triggerCaptureAnimation();
    
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
      Alert.alert('Camera Error', 'Failed to take picture. Please try again or use the image picker.');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickImage = async () => {
    try {
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

  const getFlashIcon = () => {
    switch (flash) {
      case 'on':
        return <Zap size={20} color="#1ed0f3" fill="#1ed0f3" strokeWidth={2} />;
      case 'auto':
        return <Zap size={20} color="#e9d29b" strokeWidth={2} />;
      case 'off':
      default:
        return <Zap size={20} color="rgba(255, 255, 255, 0.4)" strokeWidth={2} />;
    }
  };

  // Animated styles
  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const flashOverlayStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const scanFrameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanFrameScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  if (!permission) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#001123', '#013655']} style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#001123', '#013655']} style={styles.permissionContainer}>
          <Animated.View style={[styles.permissionContent, titleStyle]}>
            <Text style={styles.permissionTitle}>Tesla Trash</Text>
            <Text style={styles.permissionSubtitle}>AI-Powered Waste Analysis</Text>
            <Text style={styles.permissionText}>
              We need camera access to analyze your waste and provide smart disposal recommendations.
            </Text>
            
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#cc36a5', '#1ed0f3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.permissionButtonGradient}
              >
                <Camera size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.permissionButtonText}>Enable Camera</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.permissionSecondaryButton} 
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <ImageIcon size={20} color="#1ed0f3" strokeWidth={2} />
              <Text style={styles.permissionSecondaryButtonText}>
                Select from Gallery
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </View>
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
        onCameraReady={handleCameraReady}
        onMountError={handleCameraMountError}
      >
        {/* Flash Overlay */}
        <Animated.View style={[styles.flashOverlay, flashOverlayStyle]} />

        {/* Top Controls */}
        <LinearGradient
          colors={['rgba(0,17,35,0.8)', 'transparent']}
          style={styles.topGradient}
        >
          <SafeAreaView style={styles.topControls}>
            <Animated.View style={titleStyle}>
              <Text style={styles.appTitle}>Tesla Trash</Text>
              <Text style={styles.appSubtitle}>AI Waste Analysis</Text>
            </Animated.View>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
              activeOpacity={0.8}
            >
              {getFlashIcon()}
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>

        {/* Camera Status */}
        {!cameraReady && (
          <View style={styles.cameraStatusContainer}>
            <Text style={styles.cameraStatusText}>Initializing camera...</Text>
          </View>
        )}

        {/* Scan Frame */}
        <View style={styles.scanFrameContainer}>
          <Animated.View style={[styles.scanFrame, scanFrameStyle]}>
            <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
          </Animated.View>
          <Text style={styles.scanInstructions}>
            Position waste item within frame
          </Text>
        </View>

        {/* Bottom Controls */}
        <LinearGradient
          colors={['transparent', 'rgba(0,17,35,0.8)']}
          style={styles.bottomGradient}
        >
          <SafeAreaView style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <ImageIcon size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>

            <Animated.View style={captureButtonStyle}>
              <TouchableOpacity
                style={[
                  styles.captureButton, 
                  (!cameraReady || isCapturing) && styles.captureButtonDisabled
                ]}
                onPress={takePicture}
                activeOpacity={0.9}
                disabled={!cameraReady || isCapturing}
              >
                <LinearGradient
                  colors={['#cc36a5', '#1ed0f3']}
                  style={styles.captureButtonGradient}
                >
                  <View style={styles.captureButtonInner} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.controlButton} />
          </SafeAreaView>
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001123',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionContent: {
    alignItems: 'center',
    width: '100%',
  },
  permissionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 42,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  permissionSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1ed0f3',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  permissionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#e9d29b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
  },
  permissionButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#cc36a5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  permissionSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1ed0f3',
  },
  permissionSecondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1ed0f3',
    letterSpacing: 0.5,
  },
  camera: {
    flex: 1,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  appTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#1ed0f3',
    letterSpacing: 0.5,
    marginTop: 2,
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
  cameraStatusContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  cameraStatusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    letterSpacing: 0.3,
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
  scanFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#1ed0f3',
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
    letterSpacing: 0.3,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'flex-end',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    shadowColor: '#cc36a5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ffffff',
  },
});