import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import theme from '../styles/theme';
import { CameraScreenProps } from '../types/navigation';

type CameraFacing = 'front' | 'back';

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Camera state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState<number>(0); // 0 = no zoom (closest to standard)
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  /**
   * Hooks (callbacks) MUST be declared before any conditional returns.
   */

  const toggleCameraFacing = useCallback(() => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  }, []);

  const adjustZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(current => {
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
      Alert.alert('Capture Failed', 'Unable to take photo. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  const retake = useCallback(() => {
    setPhotoUri(null);
  }, []);

  const scan = useCallback(() => {
    if (!photoUri) return;
    navigation.navigate('ScanResults', { uri: photoUri });
  }, [photoUri, navigation]);

  /**
   * Conditional rendering AFTER hooks
   */
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
          MedGuide needs camera access to scan medication labels and prescriptions accurately.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        {permission.canAskAgain === false && (
          <Text style={styles.permissionDeniedText}>Please enable camera access in your device settings.</Text>
        )}
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={retake} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={scan} activeOpacity={0.8}>
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
        style={styles.camera}
        facing={facing}
        flash={flash}
        zoom={zoom}
        mode="picture"
      />

      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleFlash} activeOpacity={0.7}>
          <Text style={styles.controlButtonText}>
            {flash === 'off' ? 'Flash: Off' : flash === 'on' ? 'Flash: On' : 'Flash: Auto'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing} activeOpacity={0.7}>
          <Text style={styles.controlButtonText}>{facing === 'back' ? 'Back' : 'Front'}</Text>
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
          <Text style={[styles.zoomButtonText, zoom <= 0 && styles.zoomButtonDisabled]}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom('in')}
          activeOpacity={0.7}
          disabled={zoom >= 1}
        >
          <Text style={[styles.zoomButtonText, zoom >= 1 && styles.zoomButtonDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.captureBar}>
        <View style={styles.captureContent}>
          <Text style={styles.captureText}>Position medication label within frame</Text>
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
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
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
