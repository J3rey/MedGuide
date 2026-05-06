import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import LargeActionButton from '../components/ui/LargeActionButton';
import ConfirmActionModal from '../components/ui/ConfirmActionModal';
import { EmptyState } from '../components/ui/StateViews';
import { EmergencyContact } from '../types/models';

interface EmergencyContactsScreenProps {
  onBack?: () => void;
}

export default function EmergencyContactsScreen({ onBack }: EmergencyContactsScreenProps) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      profile_id: 'profile-1',
      name: 'Dr. Smith',
      relationship: 'Doctor',
      phone: '+61400000001',
      priority_order: 1,
      created_at: new Date().toISOString(),
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('');

  const handleAddContact = () => {
    if (!newName || !newPhone) return;
    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      profile_id: 'profile-1',
      name: newName,
      relationship: newRelationship,
      phone: newPhone,
      priority_order: contacts.length + 1,
      created_at: new Date().toISOString(),
    };
    setContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
    setNewRelationship('');
    setShowAddForm(false);
  };

  const handleDelete = () => {
    setContacts(contacts.filter((c) => c.id !== deleteTargetId));
    setShowDeleteConfirm(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <Text style={styles.headerSubtitle}>
          People to contact in an emergency
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {contacts.length === 0 && !showAddForm ? (
          <EmptyState
            title="No Emergency Contacts"
            message="Add people who should be contacted in an emergency"
            actionLabel="Add Contact"
            onAction={() => setShowAddForm(true)}
          />
        ) : (
          <>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>{contact.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>#{contact.priority_order}</Text>
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.callBtnText}>📞 Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() => Linking.openURL(`sms:${contact.phone}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.messageBtnText}>💬 Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => {
                      setDeleteTargetId(contact.id);
                      setShowDeleteConfirm(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>Add Emergency Contact</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact name"
                placeholderTextColor={theme.colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+61 400 000 000"
                placeholderTextColor={theme.colors.textSecondary}
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Doctor, Family, Neighbour"
                placeholderTextColor={theme.colors.textSecondary}
                value={newRelationship}
                onChangeText={setNewRelationship}
              />
            </View>
            <View style={styles.formActions}>
              <LargeActionButton
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <LargeActionButton
                title="Save Contact"
                onPress={handleAddContact}
                variant="primary"
                disabled={!newName || !newPhone}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {!showAddForm && contacts.length > 0 && (
          <LargeActionButton
            title="+ Add Emergency Contact"
            onPress={() => setShowAddForm(true)}
            variant="outline"
            fullWidth
            style={{ marginTop: theme.spacing.base }}
          />
        )}
      </ScrollView>

      <ConfirmActionModal
        visible={showDeleteConfirm}
        title="Remove Contact?"
        message="This person will no longer be listed as an emergency contact."
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
  contactCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  contactInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  contactName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  contactRelationship: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  contactPhone: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginTop: 2,
  },
  priorityBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  priorityText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  callBtn: {
    flex: 1,
    backgroundColor: theme.colors.successLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  callBtnText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.base,
  },
  messageBtn: {
    flex: 1,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  messageBtnText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.base,
  },
  deleteBtn: {
    backgroundColor: theme.colors.dangerLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 18,
  },
  addForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
  },
  addFormTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.base,
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
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
