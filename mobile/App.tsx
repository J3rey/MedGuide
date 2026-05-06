// App.tsx
import 'intl-pluralrules'; // Polyfill for i18next plural rules
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import './src/i18n/index'; // MUST be here

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import MainAppContainer from './src/components/MainAppContainer';
import { ScanProvider } from './src/contexts/ScanContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { AccessibilityProvider } from './src/contexts/AccessibilityContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

export type RootStackParamList = {
  Language: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // Set document title for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'MedGuide';
    }
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <ProfileProvider>
            <ScanProvider>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Language"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen
                    name="Language"
                    component={LanguageSelectionScreen}
                  />
                  <Stack.Screen name="Main">
                    {({ navigation }) => (
                      <MainAppContainer
                        onBack={() => navigation.navigate('Language')}
                      />
                    )}
                  </Stack.Screen>
                </Stack.Navigator>
              </NavigationContainer>
            </ScanProvider>
          </ProfileProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
