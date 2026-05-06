import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import theme from '../styles/theme';
import { useProfiles } from '../contexts/ProfileContext';
import { Profile } from '../types/models';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile } = useProfiles();
  const [showPicker, setShowPicker] = useState(false);

  if (!activeProfile) return null;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const renderProfileItem = ({ item }: { item: Profile }) => {
    const isActive = item.id === activeProfile.id;
    return (
      <TouchableOpacity
        style={[styles.profileItem, isActive && styles.profileItemActive]}
        onPress={() => {
          setActiveProfile(item);
          setShowPicker(false);
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: item.avatar_color || theme.colors.primary }]}>
          <Text style={styles.avatarText}>{getInitial(item.name)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, isActive && styles.profileNameActive]}>
            {item.name}
          </Text>
          {item.relationship !== 'self' && (
            <Text style={styles.profileRelationship}>
              {item.relationship.charAt(0).toUpperCase() + item.relationship.slice(1)}
            </Text>
          )}
        </View>
        {isActive && <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.switcher} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <View style={[styles.miniAvatar, { backgroundColor: activeProfile.avatar_color || theme.colors.primary }]}>
          <Text style={styles.miniAvatarText}>{getInitial(activeProfile.name)}</Text>
        </View>
        <Text style={styles.switcherName}>{activeProfile.name}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <View style={styles.bottomSheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Switch Profile</Text>
            <FlatList
              data={profiles}
              renderItem={renderProfileItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    ...theme.shadows.sm,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  switcherName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  chevron: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing['3xl'],
    maxHeight: '60%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  sheetTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.base,
  },
  list: {
    paddingHorizontal: theme.spacing.base,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xs,
  },
  profileItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  profileName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  profileNameActive: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  profileRelationship: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
