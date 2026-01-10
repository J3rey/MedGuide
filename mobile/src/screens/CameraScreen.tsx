import { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={[styles.text, { textAlign: "center", marginBottom: 12 }]}>
          We need camera permission to use this feature.
        </Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      setPhotoUri(photo.uri);
    } catch {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.capture} onPress={takePhoto}>
          <Text style={styles.captureText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {photoUri && (
        <View style={styles.preview}>
          <Text style={styles.text}>Preview</Text>
          <Image source={{ uri: photoUri }} style={styles.previewImg} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: "#0b0b0f",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  cameraWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  controls: {
    marginTop: 16,
  },
  capture: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  captureText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  preview: {
    marginTop: 16,
  },
  previewImg: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
});
