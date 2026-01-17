import React, { useState, useEffect } from "react";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import theme from "../styles/theme";
import { supabase } from "../services/supabase";
import {
  registerForPushNotificationsAsync,
  scheduleAlarmNotification,
  cancelAlarmNotification,
  parseTime,
  setupAlarmCategories,
  snoozeAlarm,
} from "../services/notificationService";

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

export default function ScheduleScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newAlarmMed, setNewAlarmMed] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Daily"]);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    initializeNotifications();
    fetchAlarms();
  }, []);

  const toggleDay = (day: string): void => {
    if (day === "Daily") {
      setSelectedDays(["Daily"]);
    } else {
      const withoutDaily = selectedDays.filter((d) => d !== "Daily");
      if (withoutDaily.includes(day)) {
        const newDays = withoutDaily.filter((d) => d !== day);
        setSelectedDays(newDays.length === 0 ? ["Daily"] : newDays);
      } else {
        setSelectedDays([...withoutDaily, day]);
      }
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date): void => {
    const currentDate = selectedDate || newAlarmTime;
    setShowTimePicker(Platform.OS === "ios");
    setNewAlarmTime(currentDate);
  };

  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatTime24 = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const displayTime = (time24: string): string => {
    const [hoursStr, minutesStr] = time24.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const initializeNotifications = async (): Promise<void> => {
    try {
      await registerForPushNotificationsAsync();
      await setupAlarmCategories();
    } catch (error) {
      console.error("Failed to register for notifications:", error);
      Alert.alert(
        "Alarms Disabled",
        "Please enable notifications in your device settings to receive medication alarms."
      );
    }
  };

  const fetchAlarms = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("alarms")
        .select("*")
        .order("time", { ascending: true });

      if (error) throw error;
      setAlarms(data || []);
    } catch (error) {
      console.error("Error fetching alarms:", error);
      Alert.alert("Error", "Failed to load alarms");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlarm = async (alarm: Alarm): Promise<void> => {
    const newEnabled = !alarm.enabled;

    try {
      // Update local state immediately for better UX
      setAlarms(
        alarms.map((a) =>
          a.id === alarm.id ? { ...a, enabled: newEnabled } : a
        )
      );

      // Handle notification scheduling
      if (newEnabled && alarm.notification_id) {
        // Cancel old notification and create new one
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

      // Update backend
      const { error } = await supabase
        .from("alarms")
        .update({ enabled: newEnabled, notification_id: notificationId })
        .eq("id", alarm.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error toggling alarm:", error);
      // Revert on error
      setAlarms(alarms.map((a) => (a.id === alarm.id ? alarm : a)));
      Alert.alert("Error", "Failed to update alarm");
    }
  };

  const addAlarm = async (): Promise<void> => {
    if (!newAlarmMed.trim()) {
      Alert.alert("Error", "Please select a medication");
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
        .from("alarms")
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
      setNewAlarmMed("");
      setNewAlarmTime(new Date());
      setSelectedDays(["Daily"]);
      setShowAddAlarm(false);
      setEditingAlarm(null);
    } catch (error) {
      console.error("Error adding alarm:", error);
      Alert.alert("Error", "Failed to create alarm");
    }
  };

  const startEditAlarm = (alarm: Alarm): void => {
    setEditingAlarm(alarm);
    setNewAlarmMed(alarm.medication_name);
    
    // Parse the 24-hour time string to create a Date object
    const [hours, minutes] = alarm.time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    setNewAlarmTime(date);
    
    setSelectedDays(alarm.days);
    setShowAddAlarm(true);
  };

  const updateAlarm = async (): Promise<void> => {
    if (!newAlarmMed.trim() || !editingAlarm) {
      Alert.alert("Error", "Please enter a medication");
      return;
    }

    try {
      // Cancel old notification
      if (editingAlarm.notification_id) {
        await cancelAlarmNotification(editingAlarm.notification_id);
      }

      // Schedule new notification
      const timeString24 = formatTime24(newAlarmTime);
      const { hour, minute } = parseTime(timeString24);
      const notificationId = await scheduleAlarmNotification(
        newAlarmMed,
        hour,
        minute,
        selectedDays
      );

      // Update in database
      const { data, error } = await supabase
        .from("alarms")
        .update({
          medication_name: newAlarmMed,
          time: timeString24,
          days: selectedDays,
          notification_id: notificationId,
        })
        .eq("id", editingAlarm.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAlarms(alarms.map((a) => (a.id === editingAlarm.id ? data : a)));
      setNewAlarmMed("");
      setNewAlarmTime(new Date());
      setSelectedDays(["Daily"]);
      setShowAddAlarm(false);
      setEditingAlarm(null);
    } catch (error) {
      console.error("Error updating alarm:", error);
      Alert.alert("Error", "Failed to update alarm");
    }
  };

  const cancelEdit = (): void => {
    setNewAlarmMed("");
    setNewAlarmTime(new Date());
    setSelectedDays(["Daily"]);
    setShowAddAlarm(false);
    setEditingAlarm(null);
  };

  const removeAlarm = async (alarm: Alarm): Promise<void> => {
    try {
      // Cancel notification if exists
      if (alarm.notification_id) {
        await cancelAlarmNotification(alarm.notification_id);
      }

      // Delete from backend
      const { error } = await supabase
        .from("alarms")
        .delete()
        .eq("id", alarm.id);

      if (error) throw error;

      // Update local state
      setAlarms(alarms.filter((a) => a.id !== alarm.id));
    } catch (error) {
      console.error("Error removing alarm:", error);
      Alert.alert("Error", "Failed to delete alarm");
    }
  };

  const containerPadding = screenWidth > 768 ? 48 : 24;
  const maxContentWidth =
    screenWidth > 768 ? 800 : screenWidth - containerPadding * 2;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: Math.max(insets.top, 16) + 80 }}
      >
        <View style={[styles.header, { paddingHorizontal: containerPadding }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.bellIcon}>ALARM</Text>
            <Text style={styles.title}>{t("schedule.title")}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddAlarm(!showAddAlarm)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {showAddAlarm && (
          <View
            style={[
              styles.addAlarmCard,
              {
                marginHorizontal: containerPadding,
                maxWidth: maxContentWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <Text style={styles.addAlarmTitle}>
              {editingAlarm ? "Edit Alarm" : "Add New Alarm"}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication</Text>
              <TextInput
                style={styles.input}
                value={newAlarmMed}
                onChangeText={setNewAlarmMed}
                placeholder="Enter medication name"
                placeholderTextColor={theme.darkColors.mutedForeground}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {formatTime(newAlarmTime)}
                </Text>
                <Text style={styles.pickerArrow}>TIME</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repeat</Text>
              <View style={styles.daysSelector}>
                {["Daily", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(day) && styles.dayButtonActive,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          selectedDays.includes(day) &&
                            styles.dayButtonTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={editingAlarm ? updateAlarm : addAlarm}
                style={[styles.button, styles.addButtonStyle]}
              >
                <Text style={styles.buttonText}>
                  {editingAlarm ? "Update Alarm" : "Add Alarm"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelEdit}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          style={[
            styles.alarmsList,
            {
              paddingHorizontal: containerPadding,
              maxWidth: maxContentWidth,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>...</Text>
              <Text style={styles.emptyText}>Loading alarms...</Text>
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
                        styles.alarmMedication,
                        !alarm.enabled && styles.disabledMedication,
                      ]}
                    >
                      {alarm.medication_name}
                    </Text>
                    <View style={styles.daysContainer}>
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
                              styles.dayText,
                              alarm.enabled
                                ? styles.dayTextActive
                                : styles.dayTextInactive,
                            ]}
                          >
                            {day}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.alarmActions}>
                    <TouchableOpacity
                      onPress={() => startEditAlarm(alarm)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editIcon}>EDIT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeAlarm(alarm)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteIcon}>DEL</Text>
                    </TouchableOpacity>
                    <Switch
                      value={alarm.enabled}
                      onValueChange={() => toggleAlarm(alarm)}
                      trackColor={{
                        false: theme.darkColors.border,
                        true: "#3b82f6",
                      }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {!loading && alarms.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>CLOCK</Text>
            <Text style={styles.emptyText}>No alarms set</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add one</Text>
          </View>
        )}
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker &&
        (Platform.OS === "ios" ? (
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
                    <Text style={styles.timePickerButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text
                      style={[styles.timePickerButton, styles.timePickerDone]}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={newAlarmTime}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={onTimeChange}
                  textColor={theme.darkColors.foreground}
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
    backgroundColor: theme.darkColors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  bellIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
  },
  addButton: {
    backgroundColor: "#3b82f6",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 32,
    color: theme.darkColors.foreground,
    fontWeight: theme.typography.fontWeight.bold,
  },
  addAlarmCard: {
    backgroundColor: theme.darkColors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
  },
  addAlarmTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.darkColors.background,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.foreground,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    alignItems: "center",
  },
  addButtonStyle: {
    backgroundColor: "#3b82f6",
  },
  cancelButton: {
    backgroundColor: theme.darkColors.accent,
  },
  buttonText: {
    color: theme.darkColors.foreground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  alarmsList: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  alarmCard: {
    backgroundColor: theme.darkColors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    marginBottom: theme.spacing.sm,
  },
  alarmContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.base,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.xs,
  },
  alarmMedication: {
    fontSize: theme.typography.fontSize.sm,
    color: "#60a5fa",
    marginBottom: theme.spacing.sm,
  },
  disabledText: {
    color: theme.darkColors.mutedForeground,
  },
  disabledMedication: {
    color: theme.darkColors.mutedForeground,
  },
  daysContainer: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  dayBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: theme.radius.md,
  },
  dayBadgeActive: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  dayBadgeInactive: {
    backgroundColor: theme.darkColors.accent,
  },
  dayText: {
    fontSize: theme.typography.fontSize.xs,
  },
  dayTextActive: {
    color: "#60a5fa",
  },
  dayTextInactive: {
    color: theme.darkColors.mutedForeground,
  },
  alarmActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  editButton: {
    padding: theme.spacing.xs,
  },
  editIcon: {
    fontSize: 20,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing["5xl"],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.base,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.mutedForeground,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  pickerButton: {
    backgroundColor: theme.darkColors.background,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.foreground,
  },
  placeholderText: {
    color: theme.darkColors.mutedForeground,
  },
  pickerArrow: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
  },
  daysSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  dayButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.darkColors.accent,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
  },
  dayButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  dayButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.darkColors.mutedForeground,
  },
  dayButtonTextActive: {
    color: "#ffffff",
    fontWeight: theme.typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.darkColors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.darkColors.border,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
  },
  modalClose: {
    fontSize: 24,
    color: theme.darkColors.mutedForeground,
  },
  medicationList: {
    padding: theme.spacing.base,
  },
  medicationItem: {
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.darkColors.border,
  },
  medicationItemText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.foreground,
  },
  timePickerContainer: {
    backgroundColor: theme.darkColors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingBottom: theme.spacing.xl,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.darkColors.border,
  },
  timePickerButton: {
    fontSize: theme.typography.fontSize.base,
    color: "#3b82f6",
    padding: theme.spacing.sm,
  },
  timePickerDone: {
    fontWeight: theme.typography.fontWeight.bold,
  },
});
