/**
 * Design System Theme - Based on Figma Design Tokens
 * This theme provides consistent colors, typography, spacing, and other design tokens
 * across the MedGuide mobile application.
 */

export const colors = {
  // Base colors
  background: '#ffffff',
  foreground: '#030213',
  
  // Card colors
  card: '#ffffff',
  cardForeground: '#030213',
  
  // Primary brand colors
  primary: '#030213',
  primaryForeground: '#ffffff',
  
  // Secondary colors
  secondary: '#f3f3f5',
  secondaryForeground: '#030213',
  
  // Muted colors (for subtle text/backgrounds)
  muted: '#ececf0',
  mutedForeground: '#717182',
  
  // Accent colors (for highlights)
  accent: '#e9ebef',
  accentForeground: '#030213',
  
  // Destructive/Error colors
  destructive: '#d4183d',
  destructiveForeground: '#ffffff',
  
  // Border colors
  border: 'rgba(0, 0, 0, 0.1)',
  
  // Input colors
  input: 'transparent',
  inputBackground: '#f3f3f5',
  
  // Switch/Toggle colors
  switchBackground: '#cbced4',
  
  // Ring/Focus colors
  ring: 'rgba(0, 0, 0, 0.3)',
  
  // Chart colors
  chart1: '#ff8c42',
  chart2: '#5eb3d6',
  chart3: '#2d4a6d',
  chart4: '#f4e04d',
  chart5: '#f08a5d',
};

export const darkColors = {
  background: '#030213',
  foreground: '#fafafa',
  card: '#030213',
  cardForeground: '#fafafa',
  primary: '#fafafa',
  primaryForeground: '#1a1a1a',
  secondary: '#2a2a2a',
  secondaryForeground: '#fafafa',
  muted: '#2a2a2a',
  mutedForeground: '#a0a0a0',
  accent: '#2a2a2a',
  accentForeground: '#fafafa',
  destructive: '#7f1d1d',
  destructiveForeground: '#fca5a5',
  border: '#2a2a2a',
  input: '#2a2a2a',
  inputBackground: '#2a2a2a',
  ring: '#666666',
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const radius = {
  sm: 6, // calc(10px - 4px)
  md: 8, // calc(10px - 2px)
  lg: 10, // base radius
  xl: 14, // calc(10px + 4px)
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};

// Export default theme
export const theme = {
  colors,
  darkColors,
  typography,
  spacing,
  radius,
  shadows,
};

export default theme;
