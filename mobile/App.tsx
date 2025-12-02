import React, { useState } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import LanguageSelectionScreen from "./src/screens/LanguageSelectionScreen";
import DarkMainApp from "./src/components/DarkMainApp";
import theme from "./src/styles/theme";

type AppState = "language" | "login" | "main" | "dark";

export default function App() {
  const [appState, setAppState] = useState<AppState>("language");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (code: string): void => {
    setSelectedLanguage(code);
    setAppState("login");
  };

  const handleLogin = (): void => {
    setAppState("dark");
  };

  const handleLogout = (): void => {
    setAppState("language");
    setSelectedLanguage(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={appState === "dark" ? "light-content" : "dark-content"}
        backgroundColor={
          appState === "dark"
            ? theme.darkColors.background
            : theme.colors.background
        }
      />
      {appState === "language" && (
        <LanguageSelectionScreen onLanguageSelect={handleLanguageSelect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
