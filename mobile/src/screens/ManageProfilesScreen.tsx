import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import { useProfiles } from '../contexts/ProfileContext';
import LargeActionButton from '../components/ui/LargeActionButton';
import ConfirmActionModal from '../components/ui/ConfirmActionModal';
import { Profile, Relationship, defaultAccessibilitySettings } from '../types/models';

interface ManageProfilesScreenProps {
  onBack?: () => void;
}

const relationships: { value: Relationship; label: string }[] = [
  { value: 'self', label: 'Myself' },
  { value: 'parent', label: 'Parent' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'partner', label: 'Partner' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const avatarColors = ['#364EFF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function ManageProfilesScreen({ onBack }: ManageProfilesScreenProps) {
  const insets = useSafeAreaInsets();
  const { profiles, activeProfile, setActiveProfile, addProfile, deleteProfile } = useProfiles();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState('');

  // Form state
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState<Relationship>('parent');
  const [newColor, setNewColor] = useState(avatarColors[1]);

  const handleAdd = () => {
    if (!newName) return;
    addProfile({
      name: newName,
      relationship: newRelationship,
      preferred_language: 'en',
      accessibility_settings: defaultAccessibilitySettings,
      avatar_color: newColor,
    });
    setNewName('');
    setNewRelationship('parent');
    setShowAddForm(false);
  };

  const handleDelete = () => {
    deleteProfile(deleteTargetId);
    setShowDeleteConfirm(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Profiles</Text>
        <Text style={styles.headerSubtitle}>
          Manage medications for yourself and family members
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Existing Profiles */}
        {profiles.map((profile) => (
          <View key={profile.id} style={[styles.profileCard, activeProfile?.id === profile.id && styles.activeCard]}>
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: profile.avatar_color || theme.colors.primary }]}>
                <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileRelationship}>
                  {relationships.find((r) => r.value === profile.relationship)?.label || profile.relationship}
                </Text>
              </View>
              {activeProfile?.id === profile.id && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
            </View>
            <View style={styles.profileActions}>
              {activeProfile?.id !== profile.id && (
                <TouchableOpacity
                  style={styles.switchBtn}
                  onPress={() => setActiveProfile(profile)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchBtnText}>Switch to</Text>
                </TouchableOpacity>
              )}
              {profile.relationship !== 'self' && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => {
                    setDeleteTargetId(profile.id);
                    setShowDeleteConfirm(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Add Profile Form */}
        {showAddForm ? (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>Add New Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mum, Dad, Grandma"
                placeholderTextColor={theme.colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <View style={styles.relationshipGrid}>
                {relationships.filter((r) => r.value !== 'self').map((rel) => (
                  <TouchableOpacity
                    key={rel.value}
                    style={[
                      styles.relationshipChip,
                      newRelationship === rel.value && styles.relationshipChipActive,
                    ]}
                    onPress={() => setNewRelationship(rel.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.relationshipChipText,
                        newRelationship === rel.value && styles.relationshipChipTextActive,
                      ]}
                    >
                      {rel.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Avatar Color</Text>
              <View style={styles.colorGrid}>
                {avatarColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newColor === color && styles.colorOptionActive,
                    ]}
                    onPress={() => setNewColor(color)}
                    activeOpacity={0.7}
                  >
                    {newColor === color && <Text style={styles.colorCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <LargeActionButton
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <LargeActionButton
                title="Add Profile"
                onPress={handleAdd}
                variant="primary"
                disabled={!newName}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <LargeActionButton
            title="+ Add New Profile"
            onPress={() => setShowAddForm(true)}
            variant="primary"
            fullWidth
            style={{ marginTop: theme.spacing.md }}
          />
        )}
      </ScrollView>

      <ConfirmActionModal
        visible={showDeleteConfirm}
        title="Remove Profile?"
        message="This will remove the profile and all associated medication data. This cannot be undone."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  backText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  profileName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  profileRelationship: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  activeBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  profileActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  switchBtn: {
    flex: 1,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  switchBtnText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  removeBtn: {
    backgroundColor: theme.colors.dangerLight,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  removeBtnText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  addForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.md,
    ...theme.shadows.card,
  },
  addFormTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    minHeight: theme.touchTargets.comfortable,
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  relationshipChip: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  relationshipChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  relationshipChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  relationshipChipTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
