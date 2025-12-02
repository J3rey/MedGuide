/**
 * Design System Theme - Based on Figma Design Tokens
 * Converted from globals.css to React Native compatible theme
 */

type ColorPalette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  inputBackground: string;
  switchBackground: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export const colors: ColorPalette = {
  background: '#ffffff',
  foreground: '#030213',
  card: '#ffffff',
  cardForeground: '#030213',
  popover: '#ffffff',
  popoverForeground: '#030213',
  primary: '#030213',
  primaryForeground: '#ffffff',
  secondary: '#f3f3f5',
  secondaryForeground: '#030213',
  muted: '#ececf0',
  mutedForeground: '#717182',
  accent: '#e9ebef',
  accentForeground: '#030213',
  destructive: '#d4183d',
  destructiveForeground: '#ffffff',
  border: 'rgba(0, 0, 0, 0.1)',
  input: 'transparent',
  inputBackground: '#f3f3f5',
  switchBackground: '#cbced4',
  ring: 'rgba(0, 0, 0, 0.3)',
  chart1: '#ff8c42',
  chart2: '#5eb3d6',
  chart3: '#2d4a6d',
  chart4: '#f4e04d',
  chart5: '#f08a5d',
  sidebar: '#fafafa',
  sidebarForeground: '#030213',
  sidebarPrimary: '#030213',
  sidebarPrimaryForeground: '#fafafa',
  sidebarAccent: '#f7f7f7',
  sidebarAccentForeground: '#1a1a1a',
  sidebarBorder: '#e5e5e5',
  sidebarRing: 'rgba(0, 0, 0, 0.3)',
};

export const darkColors: ColorPalette = {
  background: '#030213',
  foreground: '#fafafa',
  card: '#030213',
  cardForeground: '#fafafa',
  popover: '#030213',
  popoverForeground: '#fafafa',
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
  switchBackground: '#cbced4',
  ring: '#666666',
  chart1: '#60a5fa',
  chart2: '#86efac',
  chart3: '#f08a5d',
  chart4: '#c084fc',
  chart5: '#fb923c',
  sidebar: '#1a1a1a',
  sidebarForeground: '#fafafa',
  sidebarPrimary: '#60a5fa',
  sidebarPrimaryForeground: '#fafafa',
  sidebarAccent: '#2a2a2a',
  sidebarAccentForeground: '#fafafa',
  sidebarBorder: '#2a2a2a',
  sidebarRing: '#666666',
};

type Typography = {
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
};

export const typography: Typography = {
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
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

type Spacing = {
  xs: number;
  sm: number;
  md: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
};

export const spacing: Spacing = {
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

type Radius = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
};

export const radius: Radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  full: 9999,
};

type Shadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

type Shadows = {
  sm: Shadow;
  base: Shadow;
  md: Shadow;
  lg: Shadow;
};

export const shadows: Shadows = {
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

type Theme = {
  colors: ColorPalette;
  darkColors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
};

export const theme: Theme = {
  colors,
  darkColors,
  typography,
  spacing,
  radius,
  shadows,
};

export default theme;
