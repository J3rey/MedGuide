// App.tsx
import React from "react";
import "./src/i18n/index"; // MUST be here

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LanguageSelectionScreen from "./src/screens/LanguageSelectionScreen";
import CameraScreen from "./src/screens/CameraScreen";
import ScanResultsScreen from "./src/screens/ScanResultsScreen";
import ManualSearchScreen from "./src/screens/ManualSearchScreen";
import DrugDetailsScreen from "./src/screens/DrugDetailsScreen";

export type RootStackParamList = {
  Language: undefined;
  Camera: undefined;
  ScanResults: { uri: string };
  ManualSearch: undefined;
  DrugDetails: { drugId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Language" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Language" component={LanguageSelectionScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="ScanResults" component={ScanResultsScreen} />
        <Stack.Screen name="ManualSearch" component={ManualSearchScreen} />
        <Stack.Screen name="DrugDetails" component={DrugDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
