import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { CAMERA_CONSTANTS } from '../utils/cameraConstants';

type CameraFacing = 'front' | 'back';

interface VideoTrackCapabilities {
  zoom?: { min: number; max: number; step: number };
  torch?: boolean;
}

// ─── Icon Components ────────────────────────────────────────

function FlashIcon({ mode }: { mode: string }) {
  const isOff = mode === 'off';
  return (
    <View style={iconStyles.container}>
      {/* Lightning bolt */}
      <View
        style={[
          iconStyles.boltTop,
          { backgroundColor: theme.colors.cameraText },
        ]}
      />
      <View
        style={[
          iconStyles.boltBottom,
          { backgroundColor: theme.colors.cameraText },
        ]}
      />
      {isOff && (
        <View
          style={[
            iconStyles.strikethrough,
            { backgroundColor: theme.colors.cameraText },
          ]}
        />
      )}
    </View>
  );
}

function FlipCameraIcon() {
  return (
    <View style={iconStyles.flipContainer}>
      <View
        style={[
          iconStyles.flipCircle,
          { borderColor: theme.colors.cameraText },
        ]}
      />
      <View
        style={[
          iconStyles.flipArrow1,
          { backgroundColor: theme.colors.cameraText },
        ]}
      />
      <View
        style={[
          iconStyles.flipArrow2,
          { backgroundColor: theme.colors.cameraText },
        ]}
      />
    </View>
  );
}

function GalleryIcon() {
  return (
    <View style={iconStyles.galleryContainer}>
      <View
        style={[
          iconStyles.galleryOuter,
          { borderColor: theme.colors.cameraText },
        ]}
      />
      <View
        style={[
          iconStyles.galleryMountain,
          { borderBottomColor: theme.colors.cameraText },
        ]}
      />
    </View>
  );
}

// ─── Scan Frame Corner Component ────────────────────────────

// ─── Main Component ─────────────────────────────────────────

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const { t } = useTranslation();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const videoReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

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

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (webCameraStream) {
        webCameraStream.getTracks().forEach((track) => track.stop());
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

  // Ensure video element plays when stream is available (web only)
  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      !webCameraStream ||
      !videoRef.current ||
      isCapturing ||
      webImageUri
    )
      return;

    const video = videoRef.current;
    let isMounted = true;

    const ensureVideoPlaying = async () => {
      if (!isMounted || isCapturing || webImageUri) return;

      if (video.srcObject !== webCameraStream) {
        video.srcObject = webCameraStream;
      }

      if (video.paused && isMounted && !isCapturing && !webImageUri) {
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error('Failed to play video:', err);
          }
        }
      }
    };

    ensureVideoPlaying();

    const timeout = setTimeout(() => {
      if (isMounted) ensureVideoPlaying();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [webCameraStream, isCapturing, webImageUri]);

  // ─── Mobile camera handlers ───────────────────────────────

  const toggleCameraFacing = useCallback(async () => {
    if (isSwitchingCamera) return;

    try {
      setIsSwitchingCamera(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFacing((current) => (current === 'back' ? 'front' : 'back'));

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

  const cycleZoom = useCallback(() => {
    setZoom((current) => {
      if (current < 0.3) return 0.5;
      if (current < 0.7) return 1.0;
      return 0;
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
        console.log(
          '[CameraScreen] Starting scan with URI:',
          uri.substring(0, 50)
        );
        setIsProcessing(true);

        if (Platform.OS !== 'web') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        console.log('[CameraScreen] Navigating to ScanResults...');
        navigation.navigate('ScanResults', { uri });
        console.log('[CameraScreen] Navigation complete');
      } catch (error) {
        console.error('[CameraScreen] Error processing image:', error);

        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
        }

        Alert.alert(
          t('camera.errors.processingErrorTitle'),
          t('camera.errors.processingErrorMessage'),
          [{ text: 'OK' }]
        );
      } finally {
        setTimeout(() => setIsProcessing(false), 500);
      }
    },
    [navigation, t]
  );

  // ─── Web camera handlers ──────────────────────────────────

  const startWebCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Camera API not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.'
        );
      }

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

      if (videoRef.current) {
        const video = videoRef.current;

        if (videoReadyTimeoutRef.current) {
          clearTimeout(videoReadyTimeoutRef.current);
        }

        const setupVideo = async () => {
          video.srcObject = stream;
          try {
            await video.play();
          } catch (playError) {
            console.error('Video play error:', playError);
          }
        };

        if (video.readyState >= 2) {
          setupVideo();
        } else {
          video.addEventListener('loadedmetadata', setupVideo, { once: true });
          videoReadyTimeoutRef.current = setTimeout(
            setupVideo,
            CAMERA_CONSTANTS.VIDEO_ELEMENT_READY_DELAY
          );
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (Platform.OS === 'web') {
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
    if (!videoRef.current || isCapturing) {
      console.error('Video ref not available or already capturing');
      return;
    }

    const video = videoRef.current;

    console.log('Starting photo capture...');
    console.log('Video state:', {
      readyState: video.readyState,
      paused: video.paused,
      ended: video.ended,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: video.currentTime,
    });

    if (video.readyState < 2) {
      console.error('Video not ready, readyState:', video.readyState);
      alert('Camera not ready. Please wait a moment and try again.');
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error(
        'Video has invalid dimensions:',
        video.videoWidth,
        video.videoHeight
      );
      alert(
        'Camera not properly initialized. Please close and reopen the camera.'
      );
      return;
    }

    if (video.paused || video.ended) {
      console.error('Video is paused or ended');
      alert('Camera feed not active. Please refresh the page.');
      return;
    }

    setIsCapturing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        setIsCapturing(false);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(
        0,
        0,
        Math.min(100, canvas.width),
        Math.min(100, canvas.height)
      );
      let hasNonBlackPixels = false;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (
          imageData.data[i] > 10 ||
          imageData.data[i + 1] > 10 ||
          imageData.data[i + 2] > 10
        ) {
          hasNonBlackPixels = true;
          break;
        }
      }

      if (!hasNonBlackPixels) {
        console.error('Captured image appears to be completely black');
        alert(
          'Camera capture failed - image is black. Please ensure camera permissions are granted and try again.'
        );
        setIsCapturing(false);
        return;
      }

      console.log('Canvas drawn successfully, converting to data URL...');

      try {
        const dataUrl = canvas.toDataURL(
          'image/jpeg',
          CAMERA_CONSTANTS.WEB_JPEG_QUALITY
        );
        console.log('Data URL created successfully, length:', dataUrl.length);

        setWebImageUri(dataUrl);

        setTimeout(() => {
          stopWebCamera();
          setIsCapturing(false);
        }, 100);
      } catch (error) {
        console.error('Failed to create data URL:', error);
        alert('Failed to capture photo. Please try again.');
        setIsCapturing(false);
      }
    } catch (error) {
      console.error('Error during photo capture:', error);
      alert('Failed to capture photo. Please try again.');
      setIsCapturing(false);
    }
  }, [stopWebCamera, isCapturing]);

  const handleWebRetake = useCallback(() => {
    console.log('Retaking photo, clearing data URL');
    setWebImageUri(null);
  }, []);

  const toggleWebCameraFacing = useCallback(async () => {
    if (isSwitchingCamera) return;

    try {
      setIsSwitchingCamera(true);
      stopWebCamera();

      const newFacing = webFacing === 'environment' ? 'user' : 'environment';
      setWebFacing(newFacing);

      await new Promise((resolve) =>
        setTimeout(resolve, CAMERA_CONSTANTS.CAMERA_SWITCH_DELAY)
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setWebCameraStream(stream);

      if (videoRef.current) {
        const video = videoRef.current;
        const setupVideo = async () => {
          video.srcObject = stream;
          try {
            await video.play();
          } catch (playError) {
            console.error('Video play error after switch:', playError);
          }
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

  const cycleWebZoom = useCallback(() => {
    setWebZoom((current) => {
      if (current < 1.5) return 2;
      if (current < 2.5) return 3;
      return 1;
    });
  }, []);

  const toggleWebFlash = useCallback(async () => {
    setWebFlash((current) => (current === 'off' ? 'on' : 'off'));

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

  // Apply zoom changes
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

  // ─── Shared UI helpers ────────────────────────────────────

  const getFlashLabel = (mode: string): string => {
    if (mode === 'off') return '';
    if (mode === 'on') return 'ON';
    return 'A';
  };

  const renderPreview = (uri: string, onRetake: () => void) => (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Image
        source={{ uri }}
        style={styles.preview}
        onError={(error) => {
          console.error('Image load error:', error);
          if (Platform.OS === 'web') {
            alert('Failed to display captured image. Please try again.');
            onRetake();
          } else {
            Alert.alert(
              t('camera.errors.imageLoadErrorTitle'),
              t('camera.errors.imageLoadErrorMessage'),
              [{ text: 'OK', onPress: onRetake }]
            );
          }
        }}
        onLoad={() => {
          console.log('Photo loaded successfully');
        }}
      />
      <View style={styles.previewBar}>
        <TouchableOpacity
          style={styles.previewBtnSecondary}
          onPress={onRetake}
          activeOpacity={0.8}
          accessibilityLabel={t('camera.accessibility.retake')}
          accessibilityRole="button"
        >
          <Text style={styles.previewBtnSecondaryText}>
            {t('camera.retake')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.previewBtnPrimary, isProcessing && styles.btnDisabled]}
          onPress={async () => {
            if (!uri || isProcessing) return;
            await runScanFromUri(uri);
          }}
          disabled={isProcessing}
          activeOpacity={0.8}
          accessibilityLabel={t('camera.accessibility.scan')}
          accessibilityRole="button"
        >
          {isProcessing ? (
            <ActivityIndicator color={theme.colors.primaryForeground} />
          ) : (
            <Text style={styles.previewBtnPrimaryText}>
              {t('camera.scanMedication')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderPermissionScreen = (
    title: string,
    message: string,
    buttonText: string,
    onPress: () => void,
    showDenied?: boolean
  ) => (
    <SafeAreaView
      style={[styles.container, styles.permissionCenter]}
      edges={['top', 'bottom']}
    >
      {/* Camera icon */}
      <View style={styles.permIconCircle}>
        <View style={styles.permCameraBody}>
          <View style={styles.permCameraLens} />
        </View>
      </View>
      <Text style={styles.permTitle}>{title}</Text>
      <Text style={styles.permMessage}>{message}</Text>
      <TouchableOpacity
        style={styles.permButton}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityLabel={buttonText}
        accessibilityRole="button"
      >
        <Text style={styles.permButtonText}>{buttonText}</Text>
      </TouchableOpacity>
      {showDenied && (
        <Text style={styles.permDeniedText}>
          {t('camera.permissions.denied')}
        </Text>
      )}
    </SafeAreaView>
  );

  const renderViewfinder = (
    flashMode: string,
    onFlash: () => void,
    onFlip: () => void,
    onGallery: () => void,
    onShutter: () => void,
    onZoomTap: () => void,
    zoomLevel: string
  ) => (
    <>
      {/* Loading overlay */}
      {(isSwitchingCamera || isCapturing) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            {isSwitchingCamera ? t('camera.switching') : ''}
          </Text>
        </View>
      )}

      {/* Top controls: flash (left), flash label (center-ish), nothing (right) */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity
          style={styles.topIconBtn}
          onPress={onFlash}
          activeOpacity={0.7}
          accessibilityLabel={t('camera.accessibility.toggleFlash')}
          accessibilityRole="button"
        >
          <FlashIcon mode={flashMode} />
          {flashMode !== 'off' && (
            <Text style={styles.topIconLabel}>{getFlashLabel(flashMode)}</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>

      {/* Hint text */}
      <View style={styles.scanFrameArea}>
        <Text style={styles.scanHintText}>{t('camera.positionLabel')}</Text>
      </View>

      {/* Zoom pill */}
      <View style={styles.zoomPillRow}>
        <TouchableOpacity
          style={styles.zoomPill}
          onPress={onZoomTap}
          activeOpacity={0.7}
        >
          <Text style={styles.zoomPillText}>{zoomLevel}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom capture bar: Gallery | Shutter | Flip */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={onGallery}
            activeOpacity={0.8}
            accessibilityLabel={t('camera.accessibility.chooseGallery')}
            accessibilityRole="button"
          >
            <GalleryIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutter, isCapturing && styles.shutterDisabled]}
            onPress={onShutter}
            disabled={isCapturing}
            activeOpacity={0.8}
            accessibilityLabel={t('camera.accessibility.shutter')}
            accessibilityRole="button"
          >
            {isCapturing ? (
              <ActivityIndicator color={theme.colors.cameraSurface} />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBtn}
            onPress={onFlip}
            activeOpacity={0.7}
            disabled={isSwitchingCamera}
            accessibilityLabel={t('camera.accessibility.toggleCamera')}
            accessibilityRole="button"
          >
            <FlipCameraIcon />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );

  // ─── Conditional rendering AFTER hooks ────────────────────

  // Web platform
  if (Platform.OS === 'web') {
    // Preview
    if (webImageUri) {
      return renderPreview(webImageUri, handleWebRetake);
    }

    // Live camera
    if (webCameraStream) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={styles.video as React.CSSProperties}
          />
          {renderViewfinder(
            webFlash,
            toggleWebFlash,
            toggleWebCameraFacing,
            pickFromGallery,
            takeWebPhoto,
            cycleWebZoom,
            `${webZoom.toFixed(1)}x`
          )}
        </SafeAreaView>
      );
    }

    // Start camera prompt
    return renderPermissionScreen(
      t('camera.permissions.title'),
      t('camera.permissions.message'),
      t('camera.openCamera'),
      startWebCamera
    );
  }

  // Mobile platform
  if (!permission) {
    return (
      <SafeAreaView
        style={[styles.container, styles.permissionCenter]}
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
    return renderPermissionScreen(
      t('camera.permissions.required'),
      t('camera.permissions.message'),
      t('camera.permissions.grant'),
      requestPermission,
      permission.canAskAgain === false
    );
  }

  // Photo preview
  if (photoUri) {
    return renderPreview(photoUri, retake);
  }

  // Live camera
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
      {renderViewfinder(
        flash,
        toggleFlash,
        toggleCameraFacing,
        pickFromGallery,
        takePhoto,
        cycleZoom,
        `${(1 + zoom).toFixed(1)}x`
      )}
    </View>
  );
}

// ─── Icon Styles ────────────────────────────────────────────

const iconStyles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltTop: {
    width: 10,
    height: 6,
    borderBottomLeftRadius: 2,
    transform: [{ skewX: '-15deg' }],
    marginBottom: -1,
  },
  boltBottom: {
    width: 10,
    height: 6,
    borderTopRightRadius: 2,
    transform: [{ skewX: '-15deg' }],
  },
  strikethrough: {
    position: 'absolute',
    width: 28,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  flipContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  flipArrow1: {
    position: 'absolute',
    top: 1,
    right: 4,
    width: 5,
    height: 2,
    borderRadius: 1,
  },
  flipArrow2: {
    position: 'absolute',
    bottom: 1,
    left: 4,
    width: 5,
    height: 2,
    borderRadius: 1,
  },

  galleryContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryOuter: {
    width: 20,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
  },
  galleryMountain: {
    position: 'absolute',
    bottom: 6,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

// ─── Scan Frame Styles ──────────────────────────────────────

// ─── Main Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cameraSurface,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: theme.colors.cameraSurface,
  },

  // ─── Permission Screen ───
  permissionCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  permIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  permCameraBody: {
    width: 36,
    height: 28,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permCameraLens: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: theme.colors.primary,
  },
  permTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  permMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    paddingHorizontal: theme.spacing.base,
  },
  permButton: {
    minHeight: 50,
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  permButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  permDeniedText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.base,
  },

  // ─── Loading Overlay ───
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.cameraText,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  // ─── Top Bar ───
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  topIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  topIconLabel: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cameraText,
  },

  // ─── Scan Frame ───
  scanFrameArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  scanHintText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.cameraText,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // ─── Zoom Pill ───
  zoomPillRow: {
    position: 'absolute',
    bottom: 130,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  zoomPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  zoomPillText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cameraText,
  },

  // ─── Bottom Bar ───
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: theme.spacing.xl,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Shutter ───
  shutter: {
    width: CAMERA_CONSTANTS.SHUTTER_SIZE,
    height: CAMERA_CONSTANTS.SHUTTER_SIZE,
    borderRadius: CAMERA_CONSTANTS.SHUTTER_SIZE / 2,
    backgroundColor: theme.colors.cameraText,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: '100%',
    height: '100%',
    borderRadius: (CAMERA_CONSTANTS.SHUTTER_SIZE - 14) / 2,
    backgroundColor: theme.colors.cameraText,
  },

  // ─── Preview ───
  preview: {
    flex: 1,
    resizeMode: 'contain',
    backgroundColor: theme.colors.cameraSurface,
  },
  previewBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    ...theme.shadows.elevated,
  },
  previewBtnSecondary: {
    flex: 1,
    minHeight: 50,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  previewBtnSecondaryText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  previewBtnPrimary: {
    flex: 2,
    minHeight: 50,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  previewBtnPrimaryText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
