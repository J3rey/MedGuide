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
  botBubble: string;
  botBubbleBorder: string;
  alarmBackground: string;
  alarmForeground: string;
  cameraSurface: string;
  cameraOverlay: string;
  cameraText: string;
};

export const colors: ColorPalette = {
  background: '#FAFBFD',
  foreground: '#1A1D2E',
  card: '#FFFFFF',
  cardForeground: '#1A1D2E',
  popover: '#FFFFFF',
  popoverForeground: '#1A1D2E',
  primary: '#3344FF',
  primaryForeground: '#FFFFFF',
  secondary: '#FFB845',
  secondaryForeground: '#1A1D2E',
  muted: '#F3F4F6',
  mutedForeground: '#6B7280',
  accent: '#FFB845',
  accentForeground: '#1A1D2E',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  border: '#E5E7EB',
  input: 'transparent',
  inputBackground: '#F9FAFB',
  switchBackground: '#D1D5DB',
  ring: '#3344FF',
  chart1: '#3344FF',
  chart2: '#FFB845',
  chart3: '#10B981',
  chart4: '#8B5CF6',
  chart5: '#EC4899',
  sidebar: '#FFFFFF',
  sidebarForeground: '#1A1D2E',
  sidebarPrimary: '#3344FF',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#F9FAFB',
  sidebarAccentForeground: '#1A1D2E',
  sidebarBorder: '#E5E7EB',
  sidebarRing: '#3344FF',
  botBubble: '#F0F2FF',
  botBubbleBorder: '#E0E5FF',
  alarmBackground: '#DC2626',
  alarmForeground: '#FFFFFF',
  cameraSurface: '#000000',
  cameraOverlay: 'rgba(0, 0, 0, 0.7)',
  cameraText: '#FFFFFF',
};

export const darkColors: ColorPalette = {
  background: '#0F1117',
  foreground: '#FFFFFF',
  card: '#1A1D2E',
  cardForeground: '#FFFFFF',
  popover: '#1A1D2E',
  popoverForeground: '#FFFFFF',
  primary: '#3344FF',
  primaryForeground: '#FFFFFF',
  secondary: '#FFB845',
  secondaryForeground: '#1A1D2E',
  muted: '#1F2937',
  mutedForeground: '#9CA3AF',
  accent: '#FFB845',
  accentForeground: '#FFFFFF',
  destructive: '#DC2626',
  destructiveForeground: '#FEE2E2',
  border: '#374151',
  input: '#1F2937',
  inputBackground: '#1F2937',
  switchBackground: '#4B5563',
  ring: '#3344FF',
  chart1: '#3344FF',
  chart2: '#FFB845',
  chart3: '#10B981',
  chart4: '#8B5CF6',
  chart5: '#EC4899',
  sidebar: '#1A1D2E',
  sidebarForeground: '#FFFFFF',
  sidebarPrimary: '#3344FF',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#1F2937',
  sidebarAccentForeground: '#FFFFFF',
  sidebarBorder: '#374151',
  sidebarRing: '#3344FF',
  botBubble: '#1E2140',
  botBubbleBorder: '#2A2D4A',
  alarmBackground: '#DC2626',
  alarmForeground: '#FFFFFF',
  cameraSurface: '#000000',
  cameraOverlay: 'rgba(0, 0, 0, 0.7)',
  cameraText: '#FFFFFF',
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
    '3xl': 28,
    '4xl': 34,
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
  chatBubble: number;
  full: number;
};

export const radius: Radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  chatBubble: 18,
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
  interactive: Shadow;
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  interactive: {
    shadowColor: '#3344FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
