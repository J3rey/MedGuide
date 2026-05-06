import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../styles/theme';

interface IconProps {
  active: boolean;
}

const getColor = (active: boolean) =>
  active ? theme.colors.navPillText : theme.colors.navInactiveText;

// Calendar/Schedule Icon
export const ScheduleIcon = ({ active }: IconProps) => {
  const color = getColor(active);
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.scheduleBody, { borderColor: color }]}>
        <View style={[styles.scheduleHeader, { backgroundColor: color }]} />
        <View style={styles.scheduleGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.scheduleDot, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// Camera/Scan Icon
export const CameraIcon = ({ active }: IconProps) => {
  const color = getColor(active);
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.cameraBody, { borderColor: color }]}>
        <View style={[styles.cameraLens, { borderColor: color }]}>
          <View style={[styles.cameraDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

// Chat Icon
export const ChatIcon = ({ active }: IconProps) => {
  const color = getColor(active);
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.chatBubble, { borderColor: color }]}>
        <View style={[styles.chatLine, { backgroundColor: color }]} />
        <View style={[styles.chatLineShort, { backgroundColor: color }]} />
      </View>
      <View style={[styles.chatTail, { borderTopColor: color }]} />
    </View>
  );
};

// Settings Icon
export const SettingsIcon = ({ active }: IconProps) => {
  const color = getColor(active);
  return (
    <View style={styles.iconContainer}>
      <View style={styles.settingsOuter}>
        <View style={[styles.settingsCenter, { backgroundColor: color }]} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.settingsTooth,
              { backgroundColor: color },
              { transform: [{ rotate: `${i * 60}deg` }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Schedule
  scheduleBody: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.8,
    padding: 2,
  },
  scheduleHeader: {
    height: 2.5,
    borderRadius: 1,
    marginBottom: 2,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  scheduleDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
  },

  // Camera
  cameraBody: {
    width: 18,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
  },

  // Chat
  chatBubble: {
    width: 18,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.8,
    padding: 2.5,
    justifyContent: 'center',
  },
  chatLine: {
    height: 1.8,
    borderRadius: 1,
    marginBottom: 2,
  },
  chatLineShort: {
    height: 1.8,
    width: '65%',
    borderRadius: 1,
  },
  chatTail: {
    position: 'absolute',
    bottom: 2,
    left: 4,
    width: 0,
    height: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderStyle: 'solid',
    borderRightColor: 'transparent',
  },

  // Settings
  settingsOuter: {
    width: 18,
    height: 18,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 2,
  },
  settingsTooth: {
    position: 'absolute',
    width: 2.5,
    height: 7,
    borderRadius: 1.25,
    top: '50%',
    left: '50%',
    marginLeft: -1.25,
    marginTop: -3.5,
  },
});
