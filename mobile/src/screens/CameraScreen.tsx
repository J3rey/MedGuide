import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import theme from "../styles/theme";

export default function CameraScreen() {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>We need camera permission</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) setPhotoUri(photo.uri);
  };

  const retake = () => setPhotoUri(null);

  const scan = () => {
    if (!photoUri) return;
    navigation.navigate("ScanResults", { uri: photoUri });
  };

  // PREVIEW MODE
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.button} onPress={retake}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPrimary} onPress={scan}>
            <Text style={styles.buttonTextPrimary}>Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // CAMERA MODE
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} />
      <View style={styles.captureBar}>
        <TouchableOpacity style={styles.shutter} onPress={takePhoto} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.darkColors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { color: theme.darkColors.foreground, marginBottom: 12 },

  camera: { flex: 1 },

  captureBar: {
    padding: 16,
    alignItems: "center",
    backgroundColor: theme.darkColors.background,
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: theme.darkColors.foreground,
  },

  preview: { flex: 1, resizeMode: "contain", backgroundColor: "#000" },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12, // if gap causes issues, replace with marginLeft on 2nd button
    padding: 16,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    alignItems: "center",
  },
  buttonText: { color: theme.darkColors.foreground, fontWeight: "600" },

  buttonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.darkColors.primary,
    alignItems: "center",
  },
  buttonTextPrimary: { color: theme.darkColors.primaryForeground, fontWeight: "700" },
});
