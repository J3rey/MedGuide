import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AccessibilitySettings, defaultAccessibilitySettings } from '../types/models';
import { textSizeMultipliers, buttonSizeMultipliers, TextSizeScale, ButtonSizeScale } from '../styles/theme';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  getScaledFontSize: (baseSize: number) => number;
  getScaledButtonHeight: (baseHeight: number) => number;
  isHighContrast: boolean;
  isSimplified: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultAccessibilitySettings,
  updateSettings: () => {},
  getScaledFontSize: (size) => size,
  getScaledButtonHeight: (height) => height,
  isHighContrast: false,
  isSimplified: false,
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const getScaledFontSize = useCallback(
    (baseSize: number) => {
      const multiplier = textSizeMultipliers[settings.text_size as TextSizeScale] || 1;
      return Math.round(baseSize * multiplier);
    },
    [settings.text_size]
  );

  const getScaledButtonHeight = useCallback(
    (baseHeight: number) => {
      const multiplier = buttonSizeMultipliers[settings.button_size as ButtonSizeScale] || 1;
      return Math.round(baseHeight * multiplier);
    },
    [settings.button_size]
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      getScaledFontSize,
      getScaledButtonHeight,
      isHighContrast: settings.high_contrast,
      isSimplified: settings.simplified_ui,
    }),
    [settings, updateSettings, getScaledFontSize, getScaledButtonHeight]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
