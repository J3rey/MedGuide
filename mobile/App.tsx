// App.tsx
import 'intl-pluralrules'; // Polyfill for i18next plural rules
import React from 'react';
import './src/i18n/index'; // MUST be here

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import DarkMainApp from './src/components/DarkMainApp';
import { ScanProvider } from './src/contexts/ScanContext';

export type RootStackParamList = {
  Language: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ScanProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Language"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Language" component={LanguageSelectionScreen} />
            <Stack.Screen name="Main">
              {({ navigation }) => (
                <DarkMainApp onBack={() => navigation.navigate('Language')} />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </ScanProvider>
    </SafeAreaProvider>
  );
}
