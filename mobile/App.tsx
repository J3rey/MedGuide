import React, { useState } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import MainApp from "./src/components/MainApp";
import theme from "./src/styles/theme";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <MainApp onLogout={() => setIsLoggedIn(false)} />
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
