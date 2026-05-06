/**
 * MedGuide Design System - Clean Medical Theme
 * Primary: #364EFF - Trustworthy, calm, accessible
 * Designed for elderly users, caregivers, and mobile-first UX
 */

export type ColorPalette = {
  // Core
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  border: string;

  // Semantic
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  emergency: string;
  emergencyLight: string;

  // Legacy compatibility
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  secondaryLight: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  input: string;
  inputBackground: string;
  switchBackground: string;
  ring: string;

  // Navigation
  navBar: string;
  navBarBorder: string;
  navActive: string;
  navActiveBackground: string;
  navInactiveText: string;

  // Chat
  botBubble: string;
  botBubbleBorder: string;

  // Alarm
  alarmBackground: string;
  alarmForeground: string;

  // Camera
  cameraSurface: string;
  cameraOverlay: string;
  cameraText: string;

  // Schedule status
  statusUpcoming: string;
  statusTaken: string;
  statusDueSoon: string;
  statusMissed: string;
  statusSkipped: string;

  // Gradient / Legacy
  gradientStart: string;
  gradientEnd: string;
  navPill: string;
  navPillText: string;

  // Charts
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
};

export const colors: ColorPalette = {
  // Core palette
  primary: '#364EFF',
  primaryLight: '#EEF1FF',
  primaryDark: '#1E2FBF',
  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3FF',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  border: '#DDE3FF',

  // Semantic
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  emergency: '#B91C1C',
  emergencyLight: '#FEE2E2',

  // Legacy compatibility
  foreground: '#111827',
  card: '#FFFFFF',
  cardForeground: '#111827',
  popover: '#FFFFFF',
  popoverForeground: '#111827',
  primaryForeground: '#FFFFFF',
  secondary: '#6B7280',
  secondaryForeground: '#FFFFFF',
  secondaryLight: '#F3F4F6',
  muted: '#F1F3FF',
  mutedForeground: '#6B7280',
  accent: '#364EFF',
  accentForeground: '#FFFFFF',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  input: 'transparent',
  inputBackground: '#F8F9FF',
  switchBackground: '#D1D5DB',
  ring: '#364EFF',

  // Navigation
  navBar: '#FFFFFF',
  navBarBorder: '#DDE3FF',
  navActive: '#364EFF',
  navActiveBackground: '#EEF1FF',
  navInactiveText: '#6B7280',

  // Chat
  botBubble: '#F1F3FF',
  botBubbleBorder: '#DDE3FF',

  // Alarm
  alarmBackground: '#DC2626',
  alarmForeground: '#FFFFFF',

  // Camera
  cameraSurface: '#000000',
  cameraOverlay: 'rgba(0, 0, 0, 0.7)',
  cameraText: '#FFFFFF',

  // Schedule status
  statusUpcoming: '#364EFF',
  statusTaken: '#16A34A',
  statusDueSoon: '#F59E0B',
  statusMissed: '#DC2626',
  statusSkipped: '#9CA3AF',

  // Gradient / Legacy
  gradientStart: '#364EFF',
  gradientEnd: '#5B73FF',
  navPill: '#364EFF',
  navPillText: '#FFFFFF',

  // Charts
  chart1: '#364EFF',
  chart2: '#16A34A',
  chart3: '#F59E0B',
  chart4: '#8B5CF6',
  chart5: '#EC4899',
};

export const darkColors: ColorPalette = {
  // Core palette
  primary: '#5B73FF',
  primaryLight: '#1E2340',
  primaryDark: '#8FA3FF',
  background: '#0F1117',
  surface: '#1A1D2E',
  surfaceMuted: '#252840',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#2D3154',

  // Semantic
  success: '#22C55E',
  successLight: '#14532D',
  warning: '#FBBF24',
  warningLight: '#422006',
  danger: '#EF4444',
  dangerLight: '#450A0A',
  emergency: '#DC2626',
  emergencyLight: '#450A0A',

  // Legacy compatibility
  foreground: '#F9FAFB',
  card: '#1A1D2E',
  cardForeground: '#F9FAFB',
  popover: '#1A1D2E',
  popoverForeground: '#F9FAFB',
  primaryForeground: '#FFFFFF',
  secondary: '#9CA3AF',
  secondaryForeground: '#1A1D2E',
  secondaryLight: '#252840',
  muted: '#252840',
  mutedForeground: '#9CA3AF',
  accent: '#5B73FF',
  accentForeground: '#FFFFFF',
  destructive: '#EF4444',
  destructiveForeground: '#FEE2E2',
  input: '#252840',
  inputBackground: '#252840',
  switchBackground: '#4B5563',
  ring: '#5B73FF',

  // Navigation
  navBar: '#1A1D2E',
  navBarBorder: '#2D3154',
  navActive: '#5B73FF',
  navActiveBackground: '#1E2340',
  navInactiveText: '#6B7280',

  // Chat
  botBubble: '#252840',
  botBubbleBorder: '#2D3154',

  // Alarm
  alarmBackground: '#DC2626',
  alarmForeground: '#FFFFFF',

  // Camera
  cameraSurface: '#000000',
  cameraOverlay: 'rgba(0, 0, 0, 0.7)',
  cameraText: '#FFFFFF',

  // Schedule status
  statusUpcoming: '#5B73FF',
  statusTaken: '#22C55E',
  statusDueSoon: '#FBBF24',
  statusMissed: '#EF4444',
  statusSkipped: '#6B7280',

  // Gradient / Legacy
  gradientStart: '#1E2340',
  gradientEnd: '#2D3154',
  navPill: '#5B73FF',
  navPillText: '#FFFFFF',

  // Charts
  chart1: '#5B73FF',
  chart2: '#22C55E',
  chart3: '#FBBF24',
  chart4: '#A78BFA',
  chart5: '#F472B6',
};

// High contrast palette for accessibility
export const highContrastColors: Partial<ColorPalette> = {
  primary: '#1E2FBF',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#1F2937',
  border: '#000000',
  foreground: '#000000',
  cardForeground: '#000000',
};

export type TextSizeScale = 'small' | 'default' | 'large' | 'extraLarge';
export type ButtonSizeScale = 'default' | 'large' | 'extraLarge';

export const textSizeMultipliers: Record<TextSizeScale, number> = {
  small: 0.85,
  default: 1,
  large: 1.25,
  extraLarge: 1.5,
};

export const buttonSizeMultipliers: Record<ButtonSizeScale, number> = {
  default: 1,
  large: 1.2,
  extraLarge: 1.4,
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
    tight: 1.2,
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
  sm: Shadow;
  card: Shadow;
  md: Shadow;
  lg: Shadow;
  interactive: Shadow;
  surface: Shadow;
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
  sm: {
    shadowColor: '#364EFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#364EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  interactive: {
    shadowColor: '#364EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  surface: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  elevated: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};

// Minimum touch target sizes for accessibility
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
  extraLarge: 64,
};

type Theme = {
  colors: ColorPalette;
  darkColors: ColorPalette;
  highContrastColors: Partial<ColorPalette>;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
  touchTargets: typeof touchTargets;
  textSizeMultipliers: typeof textSizeMultipliers;
  buttonSizeMultipliers: typeof buttonSizeMultipliers;
};

export const theme: Theme = {
  colors,
  darkColors,
  highContrastColors,
  typography,
  spacing,
  radius,
  shadows,
  touchTargets,
  textSizeMultipliers,
  buttonSizeMultipliers,
};

export default theme;
