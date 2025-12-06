import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import theme from "../styles/theme";

export default function CameraScreen(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.cameraView}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.title}>{t("camera.title")}</Text>
          <Text style={styles.description}>{t("camera.subtitle")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darkColors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  cameraView: {
    width: "100%",
    maxWidth: 400,
    aspectRatio: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: theme.darkColors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 4,
    borderColor: theme.darkColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 80,
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.darkColors.mutedForeground,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
  },
});
