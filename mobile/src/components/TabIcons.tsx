import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../styles/theme';

interface IconProps {
  active: boolean;
}

// Calendar/Schedule Icon - professional medical appointment style
export const ScheduleIcon = ({ active }: IconProps) => {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.scheduleOuter}>
        {/* Calendar header */}
        <View
          style={[styles.scheduleHeader, active && styles.scheduleHeaderActive]}
        />
        {/* Calendar grid dots */}
        <View style={styles.scheduleGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.scheduleDot,
                active && styles.scheduleDotActive,
                i === 1 && active && styles.scheduleHighlight,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// Camera Icon - professional pill/medication scanner style
export const CameraIcon = ({ active }: IconProps) => {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.cameraOuter}>
        {/* Camera body */}
        <View style={[styles.cameraBody, active && styles.cameraBodyActive]}>
          {/* Lens */}
          <View style={[styles.cameraLens, active && styles.cameraLensActive]}>
            <View
              style={[styles.cameraInner, active && styles.cameraInnerActive]}
            />
          </View>
        </View>
        {/* Viewfinder corners */}
        <View style={[styles.cornerTL, active && styles.cornerActive]} />
        <View style={[styles.cornerTR, active && styles.cornerActive]} />
        <View style={[styles.cornerBL, active && styles.cornerActive]} />
        <View style={[styles.cornerBR, active && styles.cornerActive]} />
      </View>
    </View>
  );
};

// Chat Icon - professional medical consultation style
export const ChatIcon = ({ active }: IconProps) => {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.chatOuter}>
        {/* Main bubble */}
        <View style={[styles.chatBubble, active && styles.chatBubbleActive]}>
          {/* Message lines */}
          <View style={[styles.chatLine, active && styles.chatLineActive]} />
          <View
            style={[styles.chatLineShort, active && styles.chatLineActive]}
          />
        </View>
        {/* Tail */}
        <View style={[styles.chatTail, active && styles.chatTailActive]} />
        {/* Medical plus indicator */}
        {active && (
          <View style={styles.chatPlus}>
            <View style={styles.chatPlusH} />
            <View style={styles.chatPlusV} />
          </View>
        )}
      </View>
    </View>
  );
};

// Settings Icon - professional gear/cog style
export const SettingsIcon = ({ active }: IconProps) => {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.settingsOuter}>
        {/* Gear center */}
        <View
          style={[styles.settingsCenter, active && styles.settingsCenterActive]}
        />
        {/* Gear teeth */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.settingsTooth,
              active && styles.settingsToothActive,
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
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Schedule/Calendar Icon
  scheduleOuter: {
    width: 20,
    height: 22,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: theme.colors.mutedForeground,
    padding: 2,
  },
  scheduleHeader: {
    height: 3,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    marginBottom: 3,
  },
  scheduleHeaderActive: {
    backgroundColor: theme.colors.primaryForeground,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  scheduleDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.mutedForeground,
  },
  scheduleDotActive: {
    backgroundColor: theme.colors.primaryForeground,
  },
  scheduleHighlight: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primaryForeground,
  },

  // Camera Icon
  cameraOuter: {
    width: 24,
    height: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBody: {
    width: 18,
    height: 14,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: theme.colors.mutedForeground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBodyActive: {
    borderColor: theme.colors.primaryForeground,
  },
  cameraLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.mutedForeground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLensActive: {
    borderColor: theme.colors.primaryForeground,
  },
  cameraInner: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.mutedForeground,
  },
  cameraInnerActive: {
    backgroundColor: theme.colors.primaryForeground,
  },
  cornerTL: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 4,
    height: 4,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: theme.colors.mutedForeground,
  },
  cornerTR: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 4,
    height: 4,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: theme.colors.mutedForeground,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 1,
    left: 1,
    width: 4,
    height: 4,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: theme.colors.mutedForeground,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 4,
    height: 4,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: theme.colors.mutedForeground,
  },
  cornerActive: {
    borderColor: theme.colors.primaryForeground,
  },

  // Chat Icon
  chatOuter: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  chatBubble: {
    width: 20,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.mutedForeground,
    padding: 3,
    justifyContent: 'center',
  },
  chatBubbleActive: {
    borderColor: theme.colors.primaryForeground,
  },
  chatLine: {
    height: 2,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    marginBottom: 2,
  },
  chatLineShort: {
    height: 2,
    width: '70%',
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
  },
  chatLineActive: {
    backgroundColor: theme.colors.primaryForeground,
  },
  chatTail: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderStyle: 'solid',
    borderTopColor: theme.colors.mutedForeground,
    borderRightColor: 'transparent',
  },
  chatTailActive: {
    borderTopColor: theme.colors.primaryForeground,
  },
  chatPlus: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatPlusH: {
    position: 'absolute',
    width: 6,
    height: 1.5,
    backgroundColor: theme.colors.primaryForeground,
    borderRadius: 1,
  },
  chatPlusV: {
    position: 'absolute',
    width: 1.5,
    height: 6,
    backgroundColor: theme.colors.primaryForeground,
    borderRadius: 1,
  },

  // Settings Icon
  settingsOuter: {
    width: 20,
    height: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCenter: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.mutedForeground,
    zIndex: 2,
  },
  settingsCenterActive: {
    backgroundColor: theme.colors.primaryForeground,
  },
  settingsTooth: {
    position: 'absolute',
    width: 3,
    height: 8,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1.5,
    top: '50%',
    left: '50%',
    marginLeft: -1.5,
    marginTop: -4,
  },
  settingsToothActive: {
    backgroundColor: theme.colors.primaryForeground,
  },
});
