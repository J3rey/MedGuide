import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../styles/theme";

type Props = {
  navigation: any;
};

export default function ManualSearchScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual Search</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
      <Text style={styles.bodyText}>
        This screen will allow you to manually search for medications by name.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Camera")}
      >
        <Text style={styles.buttonText}>Back to Camera</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.base,
    backgroundColor: theme.darkColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.darkColors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  bodyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.mutedForeground,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    borderColor: theme.darkColors.border,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.darkColors.foreground,
  },
});
