import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';
import { supabase } from '../services/supabase';
import {
  registerForPushNotificationsAsync,
  scheduleAlarmNotification,
  cancelAlarmNotification,
  parseTime,
  setupAlarmCategories,
} from '../services/notificationService';

interface Alarm {
  id: number;
  time: string;
  medication_name: string;
  enabled: boolean;
  days: string[];
  notification_id?: string;
  snooze_count?: number;
  last_snoozed?: string;
}

// Geometric Edit (Pencil) Icon
function EditIcon() {
  return (
    <View style={iconStyles.editContainer}>
      <View style={iconStyles.editBody} />
      <View style={iconStyles.editTip} />
    </View>
  );
}

// Geometric Delete (Trash) Icon
function DeleteIcon() {
  return (
    <View style={iconStyles.deleteContainer}>
      <View style={iconStyles.deleteLid} />
      <View style={iconStyles.deleteBody}>
        <View style={iconStyles.deleteLine} />
        <View style={iconStyles.deleteLine} />
      </View>
    </View>
  );
}

// Geometric Clock Icon
function ClockIcon() {
  return (
    <View style={iconStyles.clockContainer}>
      <View style={iconStyles.clockFace}>
        <View style={iconStyles.clockHandH} />
        <View style={iconStyles.clockHandM} />
        <View style={iconStyles.clockCenter} />
      </View>
    </View>
  );
}

export default function ScheduleScreen(): React.JSX.Element {
  const { t } = useTranslation();

  const dayOptions = [
    { key: 'Daily', label: t('schedule.daily') },
    { key: 'Mon', label: t('schedule.mon') },
    { key: 'Tue', label: t('schedule.tue') },
    { key: 'Wed', label: t('schedule.wed') },
    { key: 'Thu', label: t('schedule.thu') },
    { key: 'Fri', label: t('schedule.fri') },
    { key: 'Sat', label: t('schedule.sat') },
    { key: 'Sun', label: t('schedule.sun') },
  ];

  const getDayLabel = (day: string): string => {
    const found = dayOptions.find((d) => d.key === day);
    return found ? found.label : day;
  };

  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newAlarmMed, setNewAlarmMed] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Daily']);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    initializeNotifications();
    fetchAlarms();
  }, []);

  const toggleDay = (day: string): void => {
    if (day === 'Daily') {
      setSelectedDays(['Daily']);
    } else {
      const withoutDaily = selectedDays.filter((d) => d !== 'Daily');
      if (withoutDaily.includes(day)) {
        const newDays = withoutDaily.filter((d) => d !== day);
        setSelectedDays(newDays.length === 0 ? ['Daily'] : newDays);
      } else {
        setSelectedDays([...withoutDaily, day]);
      }
    }
  };

  const onTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ): void => {
    const currentDate = selectedDate || newAlarmTime;
    setShowTimePicker(Platform.OS === 'ios');
    setNewAlarmTime(currentDate);
  };

  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatTime24 = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const displayTime = (time24: string): string => {
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const initializeNotifications = async (): Promise<void> => {
    try {
      await registerForPushNotificationsAsync();
      await setupAlarmCategories();
    } catch (error) {
      console.error('Failed to register for notifications:', error);
      Alert.alert(
        t('schedule.errors.alarmsDisabledTitle'),
        t('schedule.errors.alarmsDisabledMessage')
      );
    }
  };

  const fetchAlarms = async (): Promise<void> => {
    try {
      if (!supabase) {
        setAlarms([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('alarms')
        .select('*')
        .order('time', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        setAlarms([]);
      } else {
        setAlarms(data || []);
      }
    } catch (error) {
      console.error('Error fetching alarms:', error);
      setAlarms([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlarm = async (alarm: Alarm): Promise<void> => {
    const newEnabled = !alarm.enabled;

    try {
      setAlarms(
        alarms.map((a) =>
          a.id === alarm.id ? { ...a, enabled: newEnabled } : a
        )
      );

      if (newEnabled && alarm.notification_id) {
        await cancelAlarmNotification(alarm.notification_id);
      }

      let notificationId = alarm.notification_id;

      if (newEnabled) {
        const { hour, minute } = parseTime(alarm.time);
        notificationId = await scheduleAlarmNotification(
          alarm.medication_name,
          hour,
          minute,
          alarm.days
        );
      } else if (notificationId) {
        await cancelAlarmNotification(notificationId);
        notificationId = undefined;
      }

      const { error } = await supabase
        .from('alarms')
        .update({ enabled: newEnabled, notification_id: notificationId })
        .eq('id', alarm.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling alarm:', error);
      setAlarms(alarms.map((a) => (a.id === alarm.id ? alarm : a)));
      Alert.alert(
        t('schedule.errors.error'),
        t('schedule.errors.failedToUpdate')
      );
    }
  };

  const addAlarm = async (): Promise<void> => {
    if (!newAlarmMed.trim()) {
      Alert.alert(
        t('schedule.errors.error'),
        t('schedule.errors.selectMedication')
      );
      return;
    }

    try {
      const timeString24 = formatTime24(newAlarmTime);
      const { hour, minute } = parseTime(timeString24);
      const notificationId = await scheduleAlarmNotification(
        newAlarmMed,
        hour,
        minute,
        selectedDays
      );

      const { data, error } = await supabase
        .from('alarms')
        .insert({
          medication_name: newAlarmMed,
          time: timeString24,
          days: selectedDays,
          enabled: true,
          notification_id: notificationId,
        })
        .select()
        .single();

      if (error) throw error;

      setAlarms([...alarms, data]);
      setNewAlarmMed('');
      setNewAlarmTime(new Date());
      setSelectedDays(['Daily']);
      setShowAddAlarm(false);
      setEditingAlarm(null);
    } catch (error) {
      console.error('Error adding alarm:', error);
      Alert.alert(
        t('schedule.errors.error'),
        t('schedule.errors.failedToCreate')
      );
    }
  };

  const startEditAlarm = (alarm: Alarm): void => {
    setEditingAlarm(alarm);
    setNewAlarmMed(alarm.medication_name);

    const [hours, minutes] = alarm.time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    setNewAlarmTime(date);

    setSelectedDays(alarm.days);
    setShowAddAlarm(true);
  };

  const updateAlarm = async (): Promise<void> => {
    if (!newAlarmMed.trim() || !editingAlarm) {
      Alert.alert(
        t('schedule.errors.error'),
        t('schedule.errors.enterMedication')
      );
      return;
    }

    try {
      if (editingAlarm.notification_id) {
        await cancelAlarmNotification(editingAlarm.notification_id);
      }

      const timeString24 = formatTime24(newAlarmTime);
      const { hour, minute } = parseTime(timeString24);
      const notificationId = await scheduleAlarmNotification(
        newAlarmMed,
        hour,
        minute,
        selectedDays
      );

      const { data, error } = await supabase
        .from('alarms')
        .update({
          medication_name: newAlarmMed,
          time: timeString24,
          days: selectedDays,
          notification_id: notificationId,
        })
        .eq('id', editingAlarm.id)
        .select()
        .single();

      if (error) throw error;

      setAlarms(alarms.map((a) => (a.id === editingAlarm.id ? data : a)));
      setNewAlarmMed('');
      setNewAlarmTime(new Date());
      setSelectedDays(['Daily']);
      setShowAddAlarm(false);
      setEditingAlarm(null);
    } catch (error) {
      console.error('Error updating alarm:', error);
      Alert.alert(
        t('schedule.errors.error'),
        t('schedule.errors.failedToUpdate')
      );
    }
  };

  const cancelEdit = (): void => {
    setNewAlarmMed('');
    setNewAlarmTime(new Date());
    setSelectedDays(['Daily']);
    setShowAddAlarm(false);
    setEditingAlarm(null);
  };

  const removeAlarm = async (alarm: Alarm): Promise<void> => {
    try {
      if (alarm.notification_id) {
        await cancelAlarmNotification(alarm.notification_id);
      }

      const { error } = await supabase
        .from('alarms')
        .delete()
        .eq('id', alarm.id);

      if (error) throw error;

      setAlarms(alarms.filter((a) => a.id !== alarm.id));
    } catch (error) {
      console.error('Error removing alarm:', error);
      Alert.alert(
        t('schedule.errors.error'),
        t('schedule.errors.failedToDelete')
      );
    }
  };

  const containerPadding = screenWidth > 768 ? 48 : 24;
  const maxContentWidth =
    screenWidth > 768 ? 800 : screenWidth - containerPadding * 2;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: containerPadding,
              paddingTop: Math.max(insets.top, theme.spacing.base) + theme.spacing.sm,
            },
          ]}
        >
          <Text style={styles.title}>{t('schedule.title')}</Text>
          <TouchableOpacity
            onPress={() => setShowAddAlarm(!showAddAlarm)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Add/Edit Form */}
        {showAddAlarm && (
          <View
            style={[
              styles.formCard,
              styles.responsiveContainer,
              {
                marginHorizontal: containerPadding,
                maxWidth: maxContentWidth,
              },
            ]}
          >
            <Text style={styles.formTitle}>
              {editingAlarm ? t('schedule.editAlarm') : t('schedule.addAlarm')}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('schedule.medication')}</Text>
              <TextInput
                style={styles.input}
                value={newAlarmMed}
                onChangeText={setNewAlarmMed}
                placeholder={t('schedule.medicationPlaceholder')}
                placeholderTextColor={theme.colors.mutedForeground}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('schedule.time')}</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  {formatTime(newAlarmTime)}
                </Text>
                <ClockIcon />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('schedule.repeat')}</Text>
              <View style={styles.daysSelector}>
                {dayOptions.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.dayChip,
                      selectedDays.includes(key) && styles.dayChipActive,
                    ]}
                    onPress={() => toggleDay(key)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selectedDays.includes(key) && styles.dayChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={editingAlarm ? updateAlarm : addAlarm}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>
                  {editingAlarm
                    ? t('schedule.updateAlarm')
                    : t('schedule.addAlarmBtn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelEdit} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Alarm List */}
        <View
          style={[
            styles.alarmsList,
            styles.responsiveContainer,
            {
              paddingHorizontal: containerPadding,
              maxWidth: maxContentWidth,
            },
          ]}
        >
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('schedule.loading')}</Text>
            </View>
          ) : (
            alarms.map((alarm) => (
              <View key={alarm.id} style={styles.alarmCard}>
                <View style={styles.alarmContent}>
                  <View style={styles.alarmInfo}>
                    <Text
                      style={[
                        styles.alarmTime,
                        !alarm.enabled && styles.disabledText,
                      ]}
                    >
                      {displayTime(alarm.time)}
                    </Text>
                    <Text
                      style={[
                        styles.alarmMedName,
                        !alarm.enabled && styles.disabledSubtext,
                      ]}
                    >
                      {alarm.medication_name}
                    </Text>
                    <View style={styles.dayBadges}>
                      {alarm.days.map((day, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.dayBadge,
                            alarm.enabled
                              ? styles.dayBadgeActive
                              : styles.dayBadgeInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayBadgeText,
                              alarm.enabled
                                ? styles.dayBadgeTextActive
                                : styles.dayBadgeTextInactive,
                            ]}
                          >
                            {getDayLabel(day)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.alarmActions}>
                    <TouchableOpacity
                      onPress={() => startEditAlarm(alarm)}
                      style={styles.actionBtn}
                      accessibilityLabel={t('common.edit')}
                    >
                      <EditIcon />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeAlarm(alarm)}
                      style={styles.actionBtn}
                      accessibilityLabel={t('common.delete')}
                    >
                      <DeleteIcon />
                    </TouchableOpacity>
                    <Switch
                      value={alarm.enabled}
                      onValueChange={() => toggleAlarm(alarm)}
                      trackColor={{
                        false: theme.colors.switchBackground,
                        true: theme.colors.primary,
                      }}
                      thumbColor={theme.colors.card}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {!loading && alarms.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <ClockIcon />
            </View>
            <Text style={styles.emptyText}>{t('schedule.noAlarms')}</Text>
            <Text style={styles.emptySubtext}>
              {t('schedule.noAlarmsSubtext')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker &&
        (Platform.OS === 'ios' ? (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            >
              <View style={styles.timePickerContainer}>
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.timePickerCancel}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.timePickerDone}>
                      {t('common.done')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={newAlarmTime}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={onTimeChange}
                  textColor={theme.colors.foreground}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={newAlarmTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        ))}
    </View>
  );
}

// Geometric icon styles
const iconStyles = StyleSheet.create({
  editContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBody: {
    width: 12,
    height: 3,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: -2 }],
  },
  editTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.mutedForeground,
    transform: [{ rotate: '-45deg' }, { translateX: -4 }, { translateY: -2 }],
  },
  deleteContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLid: {
    width: 14,
    height: 2,
    backgroundColor: theme.colors.destructive,
    borderRadius: 1,
    marginBottom: 1,
  },
  deleteBody: {
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.destructive,
    borderRadius: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  deleteLine: {
    width: 1.5,
    height: 5,
    backgroundColor: theme.colors.destructive,
    borderRadius: 1,
  },
  clockContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockFace: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.mutedForeground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockHandH: {
    position: 'absolute',
    width: 4,
    height: 1.5,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    right: 3,
    top: 6.25,
  },
  clockHandM: {
    position: 'absolute',
    width: 1.5,
    height: 4,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    top: 2,
    left: 6.25,
  },
  clockCenter: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.mutedForeground,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.radius['2xl'],
    borderBottomRightRadius: theme.radius['2xl'],
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primaryForeground,
    fontWeight: theme.typography.fontWeight.bold,
  },
  responsiveContainer: {
    alignSelf: 'center',
    width: '100%',
  },

  // Form Card
  formCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
  },
  timeButton: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium,
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.muted,
  },
  dayChipActive: {
    backgroundColor: theme.colors.primary,
  },
  dayChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dayChipTextActive: {
    color: theme.colors.primaryForeground,
    fontWeight: theme.typography.fontWeight.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.interactive,
  },
  primaryBtnText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.muted,
  },
  secondaryBtnText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Alarm List
  alarmsList: {
    gap: theme.spacing.md,
  },
  alarmCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  alarmContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.base,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  alarmMedName: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  disabledText: {
    color: theme.colors.mutedForeground,
  },
  disabledSubtext: {
    color: theme.colors.mutedForeground,
  },
  dayBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  dayBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  dayBadgeActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  dayBadgeInactive: {
    backgroundColor: theme.colors.muted,
  },
  dayBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dayBadgeTextActive: {
    color: theme.colors.primary,
  },
  dayBadgeTextInactive: {
    color: theme.colors.mutedForeground,
  },
  alarmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['5xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },

  // Time Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    paddingBottom: theme.spacing.xl,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timePickerCancel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    padding: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  timePickerDone: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    padding: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
