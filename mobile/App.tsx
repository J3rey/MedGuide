import React, { useState, useEffect } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import LanguageSelectionScreen from "./src/screens/LanguageSelectionScreen";
import DarkMainApp from "./src/components/DarkMainApp";
import theme from "./src/styles/theme";
import "./src/i18n/config";
import i18n from "./src/i18n/config";

type AppState = "language" | "main";

export default function App(): React.JSX.Element {
  const [appState, setAppState] = useState<AppState>("language");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (code: string): void => {
    setSelectedLanguage(code);
    i18n.changeLanguage(code);
    setAppState("main");
  };

  const handleBack = (): void => {
    setAppState("language");
    setSelectedLanguage(null);
  };

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <View style={styles.container}>
          <StatusBar
            barStyle={appState === "main" ? "light-content" : "dark-content"}
            backgroundColor={
              appState === "main"
                ? theme.darkColors.background
                : theme.colors.background
            }
          />
          {appState === "language" && (
            <LanguageSelectionScreen onLanguageSelect={handleLanguageSelect} />
          )}
          {appState === "main" && <DarkMainApp onBack={handleBack} />}
        </View>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
