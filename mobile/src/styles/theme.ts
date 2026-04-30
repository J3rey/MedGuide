/**
 * MedGuide Design System - Warm Gradient Medical Theme
 * Inspired by modern health app design with soft gradients,
 * frosted glass cards, and warm blue-orange palette.
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
  primaryLight: string;
  secondary: string;
  secondaryForeground: string;
  secondaryLight: string;
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
  botBubble: string;
  botBubbleBorder: string;
  alarmBackground: string;
  alarmForeground: string;
  cameraSurface: string;
  cameraOverlay: string;
  cameraText: string;
  // Warm theme additions
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  navBar: string;
  navBarBorder: string;
  navPill: string;
  navPillText: string;
  navInactiveText: string;
  headerGradientStart: string;
  headerGradientEnd: string;
  success: string;
  successLight: string;
};

export const colors: ColorPalette = {
  background: '#F0F4FA',
  foreground: '#1A2B4A',
  card: '#FFFFFF',
  cardForeground: '#1A2B4A',
  popover: '#FFFFFF',
  popoverForeground: '#1A2B4A',
  primary: '#4A8FE7',
  primaryForeground: '#FFFFFF',
  primaryLight: '#E8F2FD',
  secondary: '#F5A623',
  secondaryForeground: '#FFFFFF',
  secondaryLight: '#FEF3E0',
  muted: '#E8EDF5',
  mutedForeground: '#8494AD',
  accent: '#FF8C42',
  accentForeground: '#FFFFFF',
  destructive: '#E74C3C',
  destructiveForeground: '#FFFFFF',
  border: '#E0E6F0',
  input: 'transparent',
  inputBackground: '#F5F8FC',
  switchBackground: '#CBD5E1',
  ring: '#4A8FE7',
  chart1: '#4A8FE7',
  chart2: '#F5A623',
  chart3: '#2ECC71',
  chart4: '#9B59B6',
  chart5: '#E74C3C',
  sidebar: '#FFFFFF',
  sidebarForeground: '#1A2B4A',
  sidebarPrimary: '#4A8FE7',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#F5F8FC',
  sidebarAccentForeground: '#1A2B4A',
  sidebarBorder: '#E0E6F0',
  sidebarRing: '#4A8FE7',
  botBubble: '#F5F7FB',
  botBubbleBorder: '#E8EDF5',
  alarmBackground: '#E74C3C',
  alarmForeground: '#FFFFFF',
  cameraSurface: '#000000',
  cameraOverlay: 'rgba(0, 0, 0, 0.7)',
  cameraText: '#FFFFFF',
  // Warm theme
  gradientStart: '#E8F0FE',
  gradientMid: '#F0F4FA',
  gradientEnd: '#FDE8D8',
  navBar: '#FFFFFF',
  navBarBorder: '#E8EDF5',
  navPill: '#4A8FE7',
  navPillText: '#FFFFFF',
  navInactiveText: '#8494AD',
  headerGradientStart: '#E8F0FE',
  headerGradientEnd: '#FDE8D8',
  success: '#2ECC71',
  successLight: '#E8F8F0',
};

export const darkColors: ColorPalette = {
  background: '#0D1B2A',
  foreground: '#E8EDF5',
  card: '#1B2838',
  cardForeground: '#E8EDF5',
  popover: '#1B2838',
  popoverForeground: '#E8EDF5',
  primary: '#5B9FEF',
  primaryForeground: '#FFFFFF',
  primaryLight: '#1B2838',
  secondary: '#F5A623',
  secondaryForeground: '#1A2B4A',
  secondaryLight: '#2A2010',
  muted: '#1F3044',
  mutedForeground: '#8494AD',
  accent: '#FF8C42',
  accentForeground: '#FFFFFF',
  destructive: '#E74C3C',
  destructiveForeground: '#FEE2E2',
  border: '#2A3A50',
  input: '#1F3044',
  inputBackground: '#1F3044',
  switchBackground: '#3A4A5C',
  ring: '#5B9FEF',
  chart1: '#5B9FEF',
  chart2: '#F5A623',
  chart3: '#2ECC71',
  chart4: '#9B59B6',
  chart5: '#E74C3C',
  sidebar: '#1B2838',
  sidebarForeground: '#E8EDF5',
  sidebarPrimary: '#5B9FEF',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#1F3044',
  sidebarAccentForeground: '#E8EDF5',
  sidebarBorder: '#2A3A50',
  sidebarRing: '#5B9FEF',
  botBubble: '#1F3044',
  botBubbleBorder: '#2A3A50',
  alarmBackground: '#E74C3C',
  alarmForeground: '#FFFFFF',
  cameraSurface: '#000000',
  cameraOverlay: 'rgba(0, 0, 0, 0.7)',
  cameraText: '#FFFFFF',
  // Warm theme dark
  gradientStart: '#0D1B2A',
  gradientMid: '#0D1B2A',
  gradientEnd: '#1A1510',
  navBar: '#1B2838',
  navBarBorder: '#2A3A50',
  navPill: '#5B9FEF',
  navPillText: '#FFFFFF',
  navInactiveText: '#6B7B8D',
  headerGradientStart: '#1B2838',
  headerGradientEnd: '#1A1510',
  success: '#2ECC71',
  successLight: '#1A2A20',
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
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
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
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
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
  '2xl': number;
  chatBubble: number;
  full: number;
};

export const radius: Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  chatBubble: 20,
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
  none: Shadow;
  surface: Shadow;
  card: Shadow;
  interactive: Shadow;
  elevated: Shadow;
};

export const shadows: Shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  surface: {
    shadowColor: '#4A8FE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  interactive: {
    shadowColor: '#4A8FE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
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
