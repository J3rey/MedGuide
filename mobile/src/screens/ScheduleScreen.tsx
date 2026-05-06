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
  KeyboardAvoidingView,
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

// All 7 day keys in order (Mon–Sun)
const ALL_DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  // Single-letter labels for the compact day dots row
  const dayDotLabels: Record<string, string> = {
    Mon: 'M',
    Tue: 'T',
    Wed: 'W',
    Thu: 'T',
    Fri: 'F',
    Sat: 'S',
    Sun: 'S',
  };

  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

  const formatTime24 = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const displayTime = (time24: string): string => {
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes}`;
  };

  const displayAmPm = (time24: string): string => {
    const [hoursStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    return hours >= 12 ? 'PM' : 'AM';
  };

  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const isDayActive = (alarm: Alarm, dayKey: string): boolean => {
    if (alarm.days.includes('Daily')) return true;
    return alarm.days.includes(dayKey);
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
      resetForm();
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
    setShowForm(true);
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
      resetForm();
    } catch (error) {
      console.error('Error updating alarm:', error);
      Alert.alert(
        t('schedule.errors.error'),
        t('schedule.errors.failedToUpdate')
      );
    }
  };

  const resetForm = (): void => {
    setNewAlarmMed('');
    setNewAlarmTime(new Date());
    setSelectedDays(['Daily']);
    setShowForm(false);
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

  const confirmDelete = (alarm: Alarm): void => {
    Alert.alert(
      t('common.delete'),
      `${alarm.medication_name} — ${displayTime(alarm.time)} ${displayAmPm(alarm.time)}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => removeAlarm(alarm),
        },
      ]
    );
  };

  const containerPadding = screenWidth > 768 ? 48 : 20;

  // ─── Render ──────────────────────────────────────────────

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
              paddingTop:
                Math.max(insets.top, theme.spacing.base) + theme.spacing.md,
            },
          ]}
        >
          <View>
            <Text style={styles.title}>{t('schedule.title')}</Text>
            <Text style={styles.subtitle}>
              {alarms.length > 0
                ? `${alarms.filter((a) => a.enabled).length} active`
                : t('schedule.subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setEditingAlarm(null);
              setNewAlarmMed('');
              setNewAlarmTime(new Date());
              setSelectedDays(['Daily']);
              setShowForm(true);
            }}
            style={styles.addButton}
          >
            <View style={styles.plusIcon}>
              <View style={styles.plusH} />
              <View style={styles.plusV} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Alarm List */}
        <View style={{ paddingHorizontal: containerPadding }}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('schedule.loading')}</Text>
            </View>
          ) : alarms.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <View style={styles.emptyClockFace}>
                  <View style={styles.emptyClockHandH} />
                  <View style={styles.emptyClockHandM} />
                  <View style={styles.emptyClockDot} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>{t('schedule.noAlarms')}</Text>
              <Text style={styles.emptySubtext}>
                {t('schedule.noAlarmsSubtext')}
              </Text>
            </View>
          ) : (
            alarms.map((alarm, index) => (
              <TouchableOpacity
                key={alarm.id}
                style={[
                  styles.alarmRow,
                  index === 0 && styles.alarmRowFirst,
                  index === alarms.length - 1 && styles.alarmRowLast,
                ]}
                onPress={() => startEditAlarm(alarm)}
                onLongPress={() => confirmDelete(alarm)}
                activeOpacity={0.7}
              >
                {/* Left: Color bar */}
                <View
                  style={[
                    styles.colorBar,
                    {
                      backgroundColor: alarm.enabled
                        ? theme.colors.primary
                        : theme.colors.muted,
                    },
                  ]}
                />

                {/* Center: Time + Med + Days */}
                <View style={styles.alarmBody}>
                  <View style={styles.timeRow}>
                    <Text
                      style={[
                        styles.timeText,
                        !alarm.enabled && styles.textDisabled,
                      ]}
                    >
                      {displayTime(alarm.time)}
                    </Text>
                    <Text
                      style={[
                        styles.ampmText,
                        !alarm.enabled && styles.textDisabled,
                      ]}
                    >
                      {displayAmPm(alarm.time)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.medName,
                      !alarm.enabled && styles.textMutedDisabled,
                    ]}
                  >
                    {alarm.medication_name}
                  </Text>

                  {/* Day dots row */}
                  <View style={styles.dayDotsRow}>
                    {ALL_DAY_KEYS.map((dayKey) => {
                      const active = isDayActive(alarm, dayKey);
                      return (
                        <View
                          key={dayKey}
                          style={[
                            styles.dayDot,
                            active && alarm.enabled
                              ? styles.dayDotActive
                              : styles.dayDotInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayDotText,
                              active && alarm.enabled
                                ? styles.dayDotTextActive
                                : styles.dayDotTextInactive,
                            ]}
                          >
                            {dayDotLabels[dayKey]}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Right: Switch */}
                <Switch
                  value={alarm.enabled}
                  onValueChange={() => toggleAlarm(alarm)}
                  trackColor={{
                    false: theme.colors.switchBackground,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.card}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* ─── Top Sheet Form Modal ─── */}
      <Modal
        visible={showForm}
        transparent={true}
        animationType="fade"
        onRequestClose={resetForm}
      >
        <KeyboardAvoidingView
          style={styles.sheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={resetForm}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={styles.sheetContainer}
            >
              {/* Handle bar */}
              <View style={styles.sheetHandle} />

              <Text style={styles.sheetTitle}>
                {editingAlarm
                  ? t('schedule.editAlarm')
                  : t('schedule.addAlarm')}
              </Text>

              {/* Medication input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  {t('schedule.medication')}
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={newAlarmMed}
                  onChangeText={setNewAlarmMed}
                  placeholder={t('schedule.medicationPlaceholder')}
                  placeholderTextColor={theme.colors.mutedForeground}
                  autoFocus={!editingAlarm}
                />
              </View>

              {/* Time picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('schedule.time')}</Text>
                {Platform.OS === 'web' ? (
                  <View style={styles.webTimeRow}>
                    <TouchableOpacity
                      style={styles.webTimeBtn}
                      onPress={() => {
                        const newDate = new Date(newAlarmTime);
                        newDate.setHours((newDate.getHours() + 1) % 24);
                        setNewAlarmTime(newDate);
                      }}
                    >
                      <Text style={styles.webTimeBtnText}>+</Text>
                    </TouchableOpacity>
                    <View style={styles.webTimeDisplay}>
                      <Text style={styles.webTimeText}>
                        {formatTime(newAlarmTime)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.webTimeBtn}
                      onPress={() => {
                        const newDate = new Date(newAlarmTime);
                        newDate.setMinutes((newDate.getMinutes() + 5) % 60);
                        setNewAlarmTime(newDate);
                      }}
                    >
                      <Text style={styles.webTimeBtnText}>+5m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.webTimeBtn}
                      onPress={() => {
                        const newDate = new Date(newAlarmTime);
                        newDate.setMinutes(
                          (newDate.getMinutes() - 5 + 60) % 60
                        );
                        setNewAlarmTime(newDate);
                      }}
                    >
                      <Text style={styles.webTimeBtnText}>-5m</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.timePickerBtn}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.timePickerBtnText}>
                      {formatTime(newAlarmTime)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Day selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('schedule.repeat')}</Text>
                <View style={styles.dayChipsRow}>
                  {dayOptions.map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.dayChip,
                        selectedDays.includes(key) && styles.dayChipSelected,
                      ]}
                      onPress={() => toggleDay(key)}
                    >
                      <Text
                        style={[
                          styles.dayChipLabel,
                          selectedDays.includes(key) &&
                            styles.dayChipLabelSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.sheetActions}>
                <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={editingAlarm ? updateAlarm : addAlarm}
                  style={styles.saveBtn}
                >
                  <Text style={styles.saveBtnText}>
                    {editingAlarm
                      ? t('schedule.updateAlarm')
                      : t('schedule.addAlarmBtn')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Delete button for editing */}
              {editingAlarm && (
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    confirmDelete(editingAlarm);
                  }}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>{t('common.delete')}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Time Picker Modal */}
      {showTimePicker &&
        Platform.OS !== 'web' &&
        (Platform.OS === 'ios' ? (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <TouchableOpacity
              style={styles.timePickerOverlay}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            >
              <View style={styles.timePickerSheet}>
                <View style={styles.timePickerSheetHeader}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing['3xl'],
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  plusIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusH: {
    position: 'absolute',
    width: 18,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primaryForeground,
  },
  plusV: {
    position: 'absolute',
    width: 2.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: theme.colors.primaryForeground,
  },

  // ─── Alarm Row ───
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.base,
    paddingRight: theme.spacing.base,
    paddingLeft: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    overflow: 'hidden',
  },
  alarmRowFirst: {
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  alarmRowLast: {
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    borderBottomWidth: 0,
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginRight: theme.spacing.base,
  },
  alarmBody: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  timeText: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    letterSpacing: -1,
  },
  ampmText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
  },
  medName: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  textDisabled: {
    color: theme.colors.mutedForeground,
  },
  textMutedDisabled: {
    color: theme.colors.mutedForeground,
    opacity: 0.6,
  },

  // ─── Day Dots ───
  dayDotsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  dayDotInactive: {
    backgroundColor: theme.colors.muted,
  },
  dayDotText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
  dayDotTextActive: {
    color: theme.colors.primary,
  },
  dayDotTextInactive: {
    color: theme.colors.mutedForeground,
  },

  // ─── Empty State ───
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['5xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyClockFace: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyClockHandH: {
    position: 'absolute',
    width: 9,
    height: 2.5,
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
    right: 7,
    top: 15.5,
  },
  emptyClockHandM: {
    position: 'absolute',
    width: 2.5,
    height: 9,
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
    top: 5,
    left: 15.5,
  },
  emptyClockDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
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

  // ─── Top Sheet ───
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
  },
  sheetContainer: {
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.radius['2xl'],
    borderBottomRightRadius: theme.radius['2xl'],
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    maxHeight: '85%',
    ...theme.shadows.elevated,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.muted,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  sheetTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xl,
  },

  // ─── Form Fields ───
  fieldGroup: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timePickerBtn: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timePickerBtnText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  dayChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayChipLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dayChipLabelSelected: {
    color: theme.colors.primaryForeground,
    fontWeight: theme.typography.fontWeight.bold,
  },

  // ─── Sheet Actions ───
  sheetActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.muted,
  },
  cancelBtnText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  saveBtn: {
    flex: 2,
    minHeight: 50,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.interactive,
  },
  saveBtnText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  deleteBtn: {
    marginTop: theme.spacing.md,
    minHeight: 44,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // ─── Web Time Controls ───
  webTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  webTimeDisplay: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  webTimeText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  webTimeBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webTimeBtnText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },

  // ─── Time Picker Sheet ───
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  timePickerSheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    paddingBottom: theme.spacing.xl,
  },
  timePickerSheetHeader: {
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
