import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../../styles/theme';
import LargeActionButton from './LargeActionButton';

// ============ Empty State ============
interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>📋</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <LargeActionButton
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

// ============ Loading State ============
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.message, { marginTop: theme.spacing.base }]}>{message}</Text>
    </View>
  );
}

// ============ Error State ============
interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  retryLabel = 'Try Again',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.colors.dangerLight }]}>
        <Text style={styles.iconText}>⚠️</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <LargeActionButton
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['3xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
  },
  actionButton: {
    marginTop: theme.spacing.xl,
  },
});
