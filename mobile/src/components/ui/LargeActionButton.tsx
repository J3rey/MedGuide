import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import theme from '../../styles/theme';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'emergency'
  | 'outline';

interface LargeActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: theme.colors.primary, text: '#FFFFFF' },
  secondary: { bg: theme.colors.surfaceMuted, text: theme.colors.primary },
  success: { bg: theme.colors.success, text: '#FFFFFF' },
  danger: { bg: theme.colors.danger, text: '#FFFFFF' },
  emergency: { bg: theme.colors.emergency, text: '#FFFFFF' },
  outline: {
    bg: 'transparent',
    text: theme.colors.primary,
    border: theme.colors.border,
  },
};

export default function LargeActionButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: LargeActionButtonProps) {
  const config = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.bg,
          borderColor: config.border || 'transparent',
          borderWidth: config.border ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={config.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: config.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: theme.touchTargets.comfortable,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
