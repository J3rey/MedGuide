import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import theme from '../styles/theme';
import { CameraScreenProps } from '../types/navigation';
import { uriToBase64 } from '../utils/uriToBase64';

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
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Camera state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState<number>(0); // 0 = no zoom (closest to standard)
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Web-only state
  const [webImageUri, setWebImageUri] = useState<string | null>(null);
  const [webCameraStream, setWebCameraStream] = useState<MediaStream | null>(
    null
  );
  const [webFacing, setWebFacing] = useState<'user' | 'environment'>(
    'environment'
  );
  const [webZoom, setWebZoom] = useState<number>(1);
  const [webFlash, setWebFlash] = useState<'off' | 'on'>('off');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (webCameraStream) {
        webCameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webCameraStream]);

  /**
   * Hooks (callbacks) MUST be declared before any conditional returns.
   */

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  }, []);

  const adjustZoom = useCallback((direction: 'in' | 'out') => {
    setZoom((current) => {
      const step = 0.1;
      if (direction === 'in') return Math.min(1, current + step);
      return Math.max(0, current - step);
    });
  }, []);

  const takePhoto = useCallback(async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);

      const cam = cameraRef.current;
      if (!cam) throw new Error('Camera not ready');

      const photo = await cam.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo?.uri) throw new Error('Failed to capture photo');
      setPhotoUri(photo.uri);
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Capture Failed', 'Unable to take photo. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  const retake = useCallback(() => {
    setPhotoUri(null);
  }, []);

  const runScanFromUri = useCallback(
    async (uri: string) => {
      try {
        // Convert to base64 using platform-specific method
        const base64 = await uriToBase64(uri);
        console.log(
          '[CameraScreen] Image converted to base64, length:',
          base64.length
        );

        // Navigate to ScanResults with the URI
        navigation.navigate('ScanResults', { uri });
      } catch (error) {
        console.error('[CameraScreen] Error processing image:', error);
        Alert.alert('Error', 'Failed to process image. Please try again.', [
          { text: 'OK' },
        ]);
      }
    },
    [navigation]
  );

  const scan = useCallback(() => {
    if (!photoUri) return;
    runScanFromUri(photoUri);
  }, [photoUri, runScanFromUri]);

  // Web camera handlers
  const startWebCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: webFacing,
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
            // @ts-ignore - zoom is not in TypeScript types yet
            advanced: [{ zoom: webZoom }],
          });
        } catch (e) {
          console.log('Zoom not supported on this device');
        }
      }

      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      Alert.alert(
        'Camera Error',
        'Unable to access camera. Please check permissions.',
        [{ text: 'OK' }]
      );
    }
  }, [webFacing, webZoom]);

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
          const url = URL.createObjectURL(blob);
          setWebImageUri(url);
          stopWebCamera();
        }
      },
      'image/jpeg',
      0.85
    );
  }, [stopWebCamera]);

  const toggleWebCameraFacing = useCallback(async () => {
    // Stop current camera stream
    stopWebCamera();
    
    // Switch facing mode
    const newFacing = webFacing === 'environment' ? 'user' : 'environment';
    setWebFacing(newFacing);
    
    // Restart camera with new facing mode
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacing,
        },
      });
      setWebCameraStream(stream);

      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Error switching camera:', error);
      Alert.alert(
        'Camera Error',
        'Unable to switch camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [stopWebCamera, webFacing]);

  const adjustWebZoom = useCallback((direction: 'in' | 'out') => {
    setWebZoom((current) => {
      const step = 0.5;
      if (direction === 'in') return Math.min(3, current + step);
      return Math.max(1, current - step);
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
            // @ts-ignore - torch is not in TypeScript types yet
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
        videoTrack.applyConstraints({
          // @ts-ignore - zoom is not in TypeScript types yet
          advanced: [{ zoom: webZoom }],
        }).catch(() => {
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
        <View style={styles.container}>
          <Image source={{ uri: webImageUri }} style={styles.preview} />
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setWebImageUri(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={async () => {
                if (!webImageUri) return;
                await runScanFromUri(webImageUri);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Scan Medication</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Show camera capture interface
    if (webCameraStream) {
      // Live camera view
      return (
        <View style={styles.container}>
          <video ref={videoRef} autoPlay playsInline style={styles.video} />

          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleWebFlash}
              activeOpacity={0.7}
            >
              <Text style={styles.controlButtonText}>
                Flash: {webFlash === 'off' ? 'Off' : 'On'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleWebCameraFacing}
              activeOpacity={0.7}
            >
              <Text style={styles.controlButtonText}>
                {webFacing === 'environment' ? 'Back' : 'Front'}
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
              disabled={webZoom >= 3}
            >
              <Text
                style={[
                  styles.zoomButtonText,
                  webZoom >= 3 && styles.zoomButtonDisabled,
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => adjustWebZoom('out')}
              activeOpacity={0.7}
              disabled={webZoom <= 1}
            >
              <Text
                style={[
                  styles.zoomButtonText,
                  webZoom <= 1 && styles.zoomButtonDisabled,
                ]}
              >
                -
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.captureBar}>
            <View style={styles.captureContent}>
              <Text style={styles.captureText}>
                Position medication label within frame
              </Text>
              <TouchableOpacity
                style={styles.shutter}
                onPress={takeWebPhoto}
                activeOpacity={0.8}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Show "start camera" button
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          MedGuide needs camera access to scan medication labels and
          prescriptions accurately.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startWebCamera}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          MedGuide needs camera access to scan medication labels and
          prescriptions accurately.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        {permission.canAskAgain === false && (
          <Text style={styles.permissionDeniedText}>
            Please enable camera access in your device settings.
          </Text>
        )}
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={retake}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={scan}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Scan Medication</Text>
          </TouchableOpacity>
        </View>
      </View>
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

      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleFlash}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>
            {flash === 'off'
              ? 'Flash: Off'
              : flash === 'on'
                ? 'Flash: On'
                : 'Flash: Auto'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraFacing}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>
            {facing === 'back' ? 'Back' : 'Front'}
          </Text>
        </TouchableOpacity>
      </View>

      {zoom > 0 && (
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{(1 + zoom).toFixed(1)}x</Text>
        </View>
      )}

      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom('out')}
          activeOpacity={0.7}
          disabled={zoom <= 0}
        >
          <Text
            style={[
              styles.zoomButtonText,
              zoom <= 0 && styles.zoomButtonDisabled,
            ]}
          >
            -
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom('in')}
          activeOpacity={0.7}
          disabled={zoom >= 1}
        >
          <Text
            style={[
              styles.zoomButtonText,
              zoom >= 1 && styles.zoomButtonDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.captureBar}>
        <View style={styles.captureContent}>
          <Text style={styles.captureText}>
            Position medication label within frame
          </Text>
          <TouchableOpacity
            style={[styles.shutter, isCapturing && styles.shutterDisabled]}
            onPress={takePhoto}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingTop: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.base,
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
    marginTop: -60,
    gap: theme.spacing.sm,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  captureContent: { alignItems: 'center', gap: theme.spacing.base },
  captureText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
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
});
