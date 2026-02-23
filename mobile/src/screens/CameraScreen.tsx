import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';
import { CameraScreenProps } from '../types/navigation';
import { uriToBase64 } from '../utils/uriToBase64';
import { CAMERA_CONSTANTS } from '../utils/cameraConstants';

type CameraFacing = 'front' | 'back';

// Extended capabilities for video track
interface VideoTrackCapabilities {
  zoom?: {
    min: number;
    max: number;
    step: number;
  };
  torch?: boolean;
}

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const { t } = useTranslation();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const webImageUrlRef = useRef<string | null>(null);
  const videoReadyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Camera state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState<number>(CAMERA_CONSTANTS.MOBILE_ZOOM_MIN);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState<boolean>(false);

  // Web-only state
  const [webImageUri, setWebImageUri] = useState<string | null>(null);
  const [webCameraStream, setWebCameraStream] = useState<MediaStream | null>(
    null
  );
  const [webFacing, setWebFacing] = useState<'user' | 'environment'>(
    'environment'
  );
  const [webZoom, setWebZoom] = useState<number>(CAMERA_CONSTANTS.WEB_ZOOM_MIN);
  const [webFlash, setWebFlash] = useState<'off' | 'on'>('off');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Cleanup camera stream and URLs on unmount
  useEffect(() => {
    return () => {
      if (webCameraStream) {
        webCameraStream.getTracks().forEach((track) => track.stop());
      }
      if (webImageUrlRef.current) {
        URL.revokeObjectURL(webImageUrlRef.current);
      }
      if (videoReadyTimeoutRef.current) {
        clearTimeout(videoReadyTimeoutRef.current);
      }
    };
  }, [webCameraStream]);

  // Pause camera when app backgrounds (mobile only)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' && webCameraStream) {
          webCameraStream
            .getTracks()
            .forEach((track) => (track.enabled = false));
        } else if (nextAppState === 'active' && webCameraStream) {
          webCameraStream
            .getTracks()
            .forEach((track) => (track.enabled = true));
        }
      }
    );

    return () => subscription.remove();
  }, [webCameraStream]);

  // Web keyboard shortcuts
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing || isSwitchingCamera) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (webCameraStream && !webImageUri) {
          takeWebPhoto();
        }
      } else if (e.key === 'Escape') {
        if (webImageUri) {
          handleWebRetake();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [webCameraStream, webImageUri, isProcessing, isSwitchingCamera]);

  /**
   * Mobile camera handlers
   */
  const toggleCameraFacing = useCallback(async () => {
    if (isSwitchingCamera) return;

    try {
      setIsSwitchingCamera(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFacing((current) => (current === 'back' ? 'front' : 'back'));

      // Small delay for better UX
      await new Promise((resolve) =>
        setTimeout(resolve, CAMERA_CONSTANTS.CAMERA_SWITCH_DELAY)
      );
    } finally {
      setIsSwitchingCamera(false);
    }
  }, [isSwitchingCamera]);

  const toggleFlash = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  }, []);

  const adjustZoom = useCallback((direction: 'in' | 'out') => {
    setZoom((current) => {
      if (direction === 'in')
        return Math.min(
          CAMERA_CONSTANTS.MOBILE_ZOOM_MAX,
          current + CAMERA_CONSTANTS.MOBILE_ZOOM_STEP
        );
      return Math.max(
        CAMERA_CONSTANTS.MOBILE_ZOOM_MIN,
        current - CAMERA_CONSTANTS.MOBILE_ZOOM_STEP
      );
    });
  }, []);

  const takePhoto = useCallback(async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const cam = cameraRef.current;
      if (!cam) throw new Error('Camera not ready');

      const photo = await cam.takePictureAsync({
        quality: CAMERA_CONSTANTS.PHOTO_QUALITY,
        skipProcessing: false,
      });

      if (!photo?.uri) throw new Error('Failed to capture photo');
      setPhotoUri(photo.uri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Photo capture error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('camera.errors.captureFailedTitle'),
        t('camera.errors.captureFailedMessage'),
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, t]);

  const retake = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotoUri(null);
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: CAMERA_CONSTANTS.PHOTO_QUALITY,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert(
        t('camera.errors.galleryErrorTitle'),
        t('camera.errors.galleryErrorMessage'),
        [{ text: 'OK' }]
      );
    }
  }, [t]);

  const runScanFromUri = useCallback(
    async (uri: string) => {
      try {
        setIsProcessing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Navigate to ScanResults with the URI
        navigation.navigate('ScanResults', { uri });
      } catch (error) {
        console.error('[CameraScreen] Error processing image:', error);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          t('camera.errors.processingErrorTitle'),
          t('camera.errors.processingErrorMessage'),
          [{ text: 'OK' }]
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [navigation, t]
  );

  const scan = useCallback(() => {
    if (!photoUri || isProcessing) return;
    runScanFromUri(photoUri);
  }, [photoUri, isProcessing, runScanFromUri]);

  /**
   * Web camera handlers
   */
  const startWebCamera = useCallback(async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Camera API not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.'
        );
      }

      // Check if the page is secure (HTTPS or localhost)
      if (
        location.protocol !== 'https:' &&
        location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1'
      ) {
        throw new Error(
          'Camera access requires HTTPS. Please access this site via https://'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: webFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setWebCameraStream(stream);

      // Apply zoom if supported
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities =
        videoTrack.getCapabilities() as VideoTrackCapabilities;
      if (capabilities.zoom && webZoom > 1) {
        try {
          await videoTrack.applyConstraints({
            // @ts-expect-error - zoom is not in TypeScript types yet
            advanced: [{ zoom: webZoom }],
          });
        } catch (e) {
          console.log('Zoom not supported on this device');
        }
      }

      // Wait for video element to be ready using proper event
      if (videoRef.current) {
        const video = videoRef.current;

        // Clear any existing timeout
        if (videoReadyTimeoutRef.current) {
          clearTimeout(videoReadyTimeoutRef.current);
        }

        const setupVideo = () => {
          video.srcObject = stream;
        };

        if (video.readyState >= 2) {
          setupVideo();
        } else {
          video.addEventListener('loadedmetadata', setupVideo, { once: true });

          // Fallback timeout
          videoReadyTimeoutRef.current = setTimeout(
            setupVideo,
            CAMERA_CONSTANTS.VIDEO_ELEMENT_READY_DELAY
          );
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (Platform.OS === 'web') {
        // Web-friendly error display
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        alert(
          `${t('camera.errors.cameraErrorTitle')}\n\n${t('camera.errors.cameraErrorMessage')}\n\nDetails: ${errorMessage}`
        );
      } else {
        Alert.alert(
          t('camera.errors.cameraErrorTitle'),
          t('camera.errors.cameraErrorMessage'),
          [{ text: 'OK' }]
        );
      }
    }
  }, [webFacing, webZoom, t]);

  const stopWebCamera = useCallback(() => {
    if (webCameraStream) {
      webCameraStream.getTracks().forEach((track) => track.stop());
      setWebCameraStream(null);
    }
  }, [webCameraStream]);

  const takeWebPhoto = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    // Convert to blob URL
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Revoke old URL if exists
          if (webImageUrlRef.current) {
            URL.revokeObjectURL(webImageUrlRef.current);
          }

          const url = URL.createObjectURL(blob);
          webImageUrlRef.current = url;
          setWebImageUri(url);
          stopWebCamera();
        }
      },
      'image/jpeg',
      CAMERA_CONSTANTS.WEB_JPEG_QUALITY
    );
  }, [stopWebCamera]);

  const handleWebRetake = useCallback(() => {
    // Revoke old URL
    if (webImageUrlRef.current) {
      URL.revokeObjectURL(webImageUrlRef.current);
      webImageUrlRef.current = null;
    }
    setWebImageUri(null);
  }, []);

  const toggleWebCameraFacing = useCallback(async () => {
    if (isSwitchingCamera) return;

    try {
      setIsSwitchingCamera(true);
      stopWebCamera();

      const newFacing = webFacing === 'environment' ? 'user' : 'environment';
      setWebFacing(newFacing);

      // Small delay for better UX
      await new Promise((resolve) =>
        setTimeout(resolve, CAMERA_CONSTANTS.CAMERA_SWITCH_DELAY)
      );

      // Restart camera with new facing mode
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setWebCameraStream(stream);

      // Setup video element
      if (videoRef.current) {
        const video = videoRef.current;
        const setupVideo = () => {
          video.srcObject = stream;
        };

        if (video.readyState >= 2) {
          setupVideo();
        } else {
          video.addEventListener('loadedmetadata', setupVideo, { once: true });
          setTimeout(setupVideo, CAMERA_CONSTANTS.VIDEO_ELEMENT_READY_DELAY);
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      if (Platform.OS === 'web') {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        alert(
          `${t('camera.errors.cameraErrorTitle')}\n\n${t('camera.errors.switchErrorMessage')}\n\nDetails: ${errorMessage}`
        );
      } else {
        Alert.alert(
          t('camera.errors.cameraErrorTitle'),
          t('camera.errors.switchErrorMessage'),
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSwitchingCamera(false);
    }
  }, [stopWebCamera, webFacing, isSwitchingCamera, t]);

  const adjustWebZoom = useCallback((direction: 'in' | 'out') => {
    setWebZoom((current) => {
      if (direction === 'in')
        return Math.min(
          CAMERA_CONSTANTS.WEB_ZOOM_MAX,
          current + CAMERA_CONSTANTS.WEB_ZOOM_STEP
        );
      return Math.max(
        CAMERA_CONSTANTS.WEB_ZOOM_MIN,
        current - CAMERA_CONSTANTS.WEB_ZOOM_STEP
      );
    });
  }, []);

  const toggleWebFlash = useCallback(async () => {
    setWebFlash((current) => (current === 'off' ? 'on' : 'off'));

    // Try to enable torch mode if available
    if (webCameraStream) {
      const videoTrack = webCameraStream.getVideoTracks()[0];
      const capabilities =
        videoTrack.getCapabilities() as VideoTrackCapabilities;

      if (capabilities.torch) {
        try {
          await videoTrack.applyConstraints({
            // @ts-expect-error - torch is not in TypeScript types yet
            advanced: [{ torch: webFlash === 'off' }],
          });
        } catch (e) {
          console.log('Flash/torch not supported on this device');
        }
      }
    }
  }, [webCameraStream, webFlash]);

  // Apply zoom changes when zoom level changes
  useEffect(() => {
    if (webCameraStream && Platform.OS === 'web' && webZoom > 1) {
      const videoTrack = webCameraStream.getVideoTracks()[0];
      const capabilities =
        videoTrack.getCapabilities() as VideoTrackCapabilities;

      if (capabilities.zoom) {
        videoTrack
          .applyConstraints({
            // @ts-expect-error - zoom is not in TypeScript types yet
            advanced: [{ zoom: webZoom }],
          })
          .catch(() => {
            console.log('Zoom adjustment failed');
          });
      }
    }
  }, [webCameraStream, webZoom]);

  /**
   * Conditional rendering AFTER hooks
   */

  // Web platform: show camera capture UI
  if (Platform.OS === 'web') {
    if (webImageUri) {
      // Show preview after capture
      return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <Image source={{ uri: webImageUri }} style={styles.preview} />
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleWebRetake}
              activeOpacity={0.8}
              accessibilityLabel={t('camera.accessibility.retake')}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                {t('camera.retake')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isProcessing && styles.buttonDisabled,
              ]}
              onPress={async () => {
                if (!webImageUri || isProcessing) return;
                await runScanFromUri(webImageUri);
              }}
              disabled={isProcessing}
              activeOpacity={0.8}
              accessibilityLabel={t('camera.accessibility.scan')}
              accessibilityRole="button"
            >
              {isProcessing ? (
                <ActivityIndicator color={theme.colors.primaryForeground} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {t('camera.scanMedication')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // Show camera capture interface
    if (webCameraStream) {
      return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={styles.video as any}
          />

          {isSwitchingCamera && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>{t('camera.switching')}</Text>
            </View>
          )}

          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleWebFlash}
              activeOpacity={0.7}
              accessibilityLabel={t('camera.accessibility.toggleFlash')}
              accessibilityRole="button"
            >
              <Text style={styles.controlButtonText}>
                {webFlash === 'off'
                  ? t('camera.flashOff')
                  : t('camera.flashOn')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleWebCameraFacing}
              activeOpacity={0.7}
              disabled={isSwitchingCamera}
              accessibilityLabel={t('camera.accessibility.toggleCamera')}
              accessibilityRole="button"
            >
              <Text style={styles.controlButtonText}>
                {webFacing === 'environment'
                  ? t('camera.cameraBack')
                  : t('camera.cameraFront')}
              </Text>
            </TouchableOpacity>
          </View>

          {webZoom > 1 && (
            <View style={styles.zoomIndicator}>
              <Text style={styles.zoomText}>{webZoom.toFixed(1)}x</Text>
            </View>
          )}

          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => adjustWebZoom('in')}
              activeOpacity={0.7}
              disabled={webZoom >= CAMERA_CONSTANTS.WEB_ZOOM_MAX}
              accessibilityLabel={t('camera.accessibility.zoomIn')}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.zoomButtonText,
                  webZoom >= CAMERA_CONSTANTS.WEB_ZOOM_MAX &&
                    styles.zoomButtonDisabled,
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => adjustWebZoom('out')}
              activeOpacity={0.7}
              disabled={webZoom <= CAMERA_CONSTANTS.WEB_ZOOM_MIN}
              accessibilityLabel={t('camera.accessibility.zoomOut')}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.zoomButtonText,
                  webZoom <= CAMERA_CONSTANTS.WEB_ZOOM_MIN &&
                    styles.zoomButtonDisabled,
                ]}
              >
                -
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.captureBar}>
            <View style={styles.captureContent}>
              <Text style={styles.captureText}>
                {t('camera.positionLabel')}
              </Text>
              <TouchableOpacity
                style={styles.shutter}
                onPress={takeWebPhoto}
                activeOpacity={0.8}
                accessibilityLabel={t('camera.accessibility.shutter')}
                accessibilityRole="button"
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    // Show "start camera" button
    return (
      <SafeAreaView
        style={[styles.container, styles.center]}
        edges={['top', 'bottom']}
      >
        <Text style={styles.permissionTitle}>
          {t('camera.permissions.title')}
        </Text>
        <Text style={styles.permissionText}>
          {t('camera.permissions.message')}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startWebCamera}
          activeOpacity={0.8}
          accessibilityLabel={t('camera.accessibility.openCamera')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{t('camera.openCamera')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Mobile platform below
  if (!permission) {
    return (
      <SafeAreaView
        style={[styles.container, styles.center]}
        edges={['top', 'bottom']}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {t('camera.permissions.checking')}
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={[styles.container, styles.center]}
        edges={['top', 'bottom']}
      >
        <Text style={styles.permissionTitle}>
          {t('camera.permissions.required')}
        </Text>
        <Text style={styles.permissionText}>
          {t('camera.permissions.message')}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
          activeOpacity={0.8}
          accessibilityLabel={t('camera.permissions.grant')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {t('camera.permissions.grant')}
          </Text>
        </TouchableOpacity>
        {permission.canAskAgain === false && (
          <Text style={styles.permissionDeniedText}>
            {t('camera.permissions.denied')}
          </Text>
        )}
      </SafeAreaView>
    );
  }

  if (photoUri) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={retake}
            activeOpacity={0.8}
            accessibilityLabel={t('camera.accessibility.retake')}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>{t('camera.retake')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isProcessing && styles.buttonDisabled,
            ]}
            onPress={scan}
            disabled={isProcessing}
            activeOpacity={0.8}
            accessibilityLabel={t('camera.accessibility.scan')}
            accessibilityRole="button"
          >
            {isProcessing ? (
              <ActivityIndicator color={theme.colors.primaryForeground} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {t('camera.scanMedication')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        key={facing}
        style={styles.camera}
        facing={facing}
        flash={flash}
        zoom={zoom}
        mode="picture"
      />

      {isSwitchingCamera && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('camera.switching')}</Text>
        </View>
      )}

      <SafeAreaView style={styles.topControls} edges={['top']}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleFlash}
          activeOpacity={0.7}
          accessibilityLabel={t('camera.accessibility.toggleFlash')}
          accessibilityRole="button"
        >
          <Text style={styles.controlButtonText}>
            {flash === 'off'
              ? t('camera.flashOff')
              : flash === 'on'
                ? t('camera.flashOn')
                : t('camera.flashAuto')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraFacing}
          activeOpacity={0.7}
          disabled={isSwitchingCamera}
          accessibilityLabel={t('camera.accessibility.toggleCamera')}
          accessibilityRole="button"
        >
          <Text style={styles.controlButtonText}>
            {facing === 'back'
              ? t('camera.cameraBack')
              : t('camera.cameraFront')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {zoom > 0 && (
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{(1 + zoom).toFixed(1)}x</Text>
        </View>
      )}

      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom('in')}
          activeOpacity={0.7}
          disabled={zoom >= CAMERA_CONSTANTS.MOBILE_ZOOM_MAX}
          accessibilityLabel={t('camera.accessibility.zoomIn')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.zoomButtonText,
              zoom >= CAMERA_CONSTANTS.MOBILE_ZOOM_MAX &&
                styles.zoomButtonDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom('out')}
          activeOpacity={0.7}
          disabled={zoom <= CAMERA_CONSTANTS.MOBILE_ZOOM_MIN}
          accessibilityLabel={t('camera.accessibility.zoomOut')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.zoomButtonText,
              zoom <= CAMERA_CONSTANTS.MOBILE_ZOOM_MIN &&
                styles.zoomButtonDisabled,
            ]}
          >
            -
          </Text>
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.captureBar} edges={['bottom']}>
        <View style={styles.captureContent}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickFromGallery}
            activeOpacity={0.8}
            accessibilityLabel={t('camera.accessibility.chooseGallery')}
            accessibilityRole="button"
          >
            <Text style={styles.galleryButtonText}>📁</Text>
          </TouchableOpacity>

          <View style={styles.centerColumn}>
            <Text style={styles.captureText}>{t('camera.positionLabel')}</Text>
            <TouchableOpacity
              style={[styles.shutter, isCapturing && styles.shutterDisabled]}
              onPress={takePhoto}
              disabled={isCapturing}
              activeOpacity={0.8}
              accessibilityLabel={t('camera.accessibility.shutter')}
              accessibilityRole="button"
            >
              {isCapturing ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.galleryButtonSpacer} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.base,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  permissionTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    paddingHorizontal: theme.spacing.base,
  },
  permissionDeniedText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.base,
  },

  camera: { flex: 1, width: '100%' },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  controlButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },

  zoomControls: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: '50%',
    marginTop: -CAMERA_CONSTANTS.ZOOM_BUTTON_SIZE,
    gap: theme.spacing.sm,
  },
  zoomButton: {
    width: CAMERA_CONSTANTS.ZOOM_BUTTON_SIZE,
    height: CAMERA_CONSTANTS.ZOOM_BUTTON_SIZE,
    borderRadius: CAMERA_CONSTANTS.ZOOM_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  zoomButtonDisabled: { color: 'rgba(255, 255, 255, 0.3)' },

  zoomIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -15,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  zoomText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  captureBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  captureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
  },
  centerColumn: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  captureText: {
    fontSize: theme.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  shutter: {
    width: CAMERA_CONSTANTS.SHUTTER_SIZE,
    height: CAMERA_CONSTANTS.SHUTTER_SIZE,
    borderRadius: CAMERA_CONSTANTS.SHUTTER_SIZE / 2,
    backgroundColor: theme.colors.card,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  shutterDisabled: { opacity: 0.5 },
  shutterInner: {
    width: '100%',
    height: '100%',
    borderRadius: (CAMERA_CONSTANTS.SHUTTER_SIZE - 12) / 2,
    backgroundColor: theme.colors.primary,
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonSpacer: {
    width: 48,
  },
  galleryButtonText: {
    fontSize: 24,
  },

  preview: { flex: 1, resizeMode: 'contain', backgroundColor: '#000' },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  secondaryButtonText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  primaryButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
