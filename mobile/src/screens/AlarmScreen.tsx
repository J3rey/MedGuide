import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Modal,
} from 'react-native';
import theme from '../styles/theme';

interface AlarmScreenProps {
  visible: boolean;
  medicationName: string;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export default function AlarmScreen({
  visible,
  medicationName,
  onDismiss,
  onSnooze,
}: AlarmScreenProps): React.JSX.Element {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Vibration pattern: long vibrations for alarm
      const pattern = [0, 400, 200, 400, 200, 400];
      Vibration.vibrate(pattern, true);
    } else {
      Vibration.cancel();
    }

    return () => {
      Vibration.cancel();
    };
  }, [visible, pulseAnim]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.icon}>PILL</Text>
          </Animated.View>

          <Text style={styles.title}>MEDICATION ALARM</Text>
          <Text style={styles.medicationName}>{medicationName}</Text>
          <Text style={styles.subtitle}>Time to take your medication</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.dismissButtonText}>I Took It</Text>
            </TouchableOpacity>

            <View style={styles.snoozeContainer}>
              <Text style={styles.snoozeLabel}>Snooze for:</Text>
              <View style={styles.snoozeButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.snoozeButton]}
                  onPress={() => onSnooze(5)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.snoozeButtonText}>5 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.snoozeButton]}
                  onPress={() => onSnooze(10)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.snoozeButtonText}>10 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.snoozeButton]}
                  onPress={() => onSnooze(15)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.snoozeButtonText}>15 min</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing['3xl'],
  },
  icon: {
    fontSize: 120,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: theme.spacing.base,
    textAlign: 'center',
    letterSpacing: 2,
  },
  medicationName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#ffffff',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing['4xl'],
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.xl,
  },
  button: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    backgroundColor: '#ffffff',
    minHeight: 70,
  },
  dismissButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#d32f2f',
  },
  snoozeContainer: {
    width: '100%',
    gap: theme.spacing.base,
  },
  snoozeLabel: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  snoozeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  snoozeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  snoozeButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#ffffff',
  },
});
