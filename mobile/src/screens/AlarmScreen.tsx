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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
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
            <View style={styles.medicationIcon}>
              {/* Geometric pill cross */}
              <View style={styles.crossH} />
              <View style={styles.crossV} />
            </View>
          </Animated.View>

          <Text style={styles.title}>{t('alarm.title')}</Text>
          <Text style={styles.medicationName}>{medicationName}</Text>
          <Text style={styles.subtitle}>{t('alarm.subtitle')}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.dismissButtonText}>{t('alarm.dismiss')}</Text>
            </TouchableOpacity>

            <View style={styles.snoozeContainer}>
              <Text style={styles.snoozeLabel}>{t('alarm.snoozeLabel')}</Text>
              <View style={styles.snoozeButtons}>
                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={() => onSnooze(5)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.snoozeButtonText}>
                    {t('alarm.snooze5')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={() => onSnooze(10)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.snoozeButtonText}>
                    {t('alarm.snooze10')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={() => onSnooze(15)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.snoozeButtonText}>
                    {t('alarm.snooze15')}
                  </Text>
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
    backgroundColor: theme.colors.alarmBackground,
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
  medicationIcon: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.alarmForeground + '25',
    borderWidth: 3,
    borderColor: theme.colors.alarmForeground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossH: {
    position: 'absolute',
    width: 30,
    height: 6,
    backgroundColor: theme.colors.alarmForeground,
    borderRadius: 3,
  },
  crossV: {
    position: 'absolute',
    width: 6,
    height: 30,
    backgroundColor: theme.colors.alarmForeground,
    borderRadius: 3,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.alarmForeground,
    marginBottom: theme.spacing.base,
    textAlign: 'center',
    letterSpacing: 2,
  },
  medicationName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.alarmForeground,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.alarmForeground + 'CC',
    marginBottom: theme.spacing['4xl'],
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.xl,
  },
  dismissButton: {
    minHeight: 64,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.alarmForeground,
  },
  dismissButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.alarmBackground,
  },
  snoozeContainer: {
    width: '100%',
    gap: theme.spacing.base,
  },
  snoozeLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.alarmForeground + 'CC',
    textAlign: 'center',
  },
  snoozeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  snoozeButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.alarmForeground + '30',
    borderWidth: 2,
    borderColor: theme.colors.alarmForeground + '60',
  },
  snoozeButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.alarmForeground,
  },
});
