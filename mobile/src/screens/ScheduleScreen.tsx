import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import theme from "../styles/theme";

interface Alarm {
  id: number;
  time: string;
  medication: string;
  enabled: boolean;
  days: string[];
}

export default function ScheduleScreen(): React.JSX.Element {
  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: 1,
      time: "08:00",
      medication: "Aspirin",
      enabled: true,
      days: ["Mon", "Wed", "Fri"],
    },
    {
      id: 2,
      time: "14:00",
      medication: "Vitamin D",
      enabled: true,
      days: ["Daily"],
    },
    {
      id: 3,
      time: "20:00",
      medication: "Blood Pressure Med",
      enabled: false,
      days: ["Daily"],
    },
  ]);
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState("09:00");
  const [newAlarmMed, setNewAlarmMed] = useState("");

  const toggleAlarm = (id: number): void => {
    setAlarms(
      alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  };

  const addAlarm = (): void => {
    if (newAlarmMed.trim()) {
      const newAlarm: Alarm = {
        id: Date.now(),
        time: newAlarmTime,
        medication: newAlarmMed,
        enabled: true,
        days: ["Daily"],
      };
      setAlarms([...alarms, newAlarm]);
      setNewAlarmMed("");
      setNewAlarmTime("09:00");
      setShowAddAlarm(false);
    }
  };

  const removeAlarm = (id: number): void => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.bellIcon}>🔔</Text>
            <Text style={styles.title}>Medication Alarms</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddAlarm(!showAddAlarm)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {showAddAlarm && (
          <View style={styles.addAlarmCard}>
            <Text style={styles.addAlarmTitle}>Add New Alarm</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={newAlarmTime}
                onChangeText={setNewAlarmTime}
                placeholder="09:00"
                placeholderTextColor={theme.darkColors.mutedForeground}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication Name</Text>
              <TextInput
                style={styles.input}
                value={newAlarmMed}
                onChangeText={setNewAlarmMed}
                placeholder="Enter medication name"
                placeholderTextColor={theme.darkColors.mutedForeground}
              />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={addAlarm}
                style={[styles.button, styles.addButtonStyle]}
              >
                <Text style={styles.buttonText}>Add Alarm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddAlarm(false)}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.alarmsList}>
          {alarms.map((alarm) => (
            <View key={alarm.id} style={styles.alarmCard}>
              <View style={styles.alarmContent}>
                <View style={styles.alarmInfo}>
                  <Text
                    style={[
                      styles.alarmTime,
                      !alarm.enabled && styles.disabledText,
                    ]}
                  >
                    {alarm.time}
                  </Text>
                  <Text
                    style={[
                      styles.alarmMedication,
                      !alarm.enabled && styles.disabledMedication,
                    ]}
                  >
                    {alarm.medication}
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
                    onPress={() => removeAlarm(alarm.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                  <Switch
                    value={alarm.enabled}
                    onValueChange={() => toggleAlarm(alarm.id)}
                    trackColor={{
                      false: theme.darkColors.border,
                      true: "#3b82f6",
                    }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {alarms.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyText}>No alarms set</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add one</Text>
          </View>
        )}
      </ScrollView>
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
    marginBottom: theme.spacing.base,
  },
  inputGroup: {
    marginBottom: theme.spacing.base,
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
});
