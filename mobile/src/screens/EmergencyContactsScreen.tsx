import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';
import LargeActionButton from '../components/ui/LargeActionButton';
import ConfirmActionModal from '../components/ui/ConfirmActionModal';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import { EmergencyContact } from '../types/models';
import { emergencyContactApi } from '../services/api';
import { useProfiles } from '../contexts/ProfileContext';

interface EmergencyContactsScreenProps {
  onBack?: () => void;
}

export default function EmergencyContactsScreen({ onBack }: EmergencyContactsScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { activeProfile } = useProfiles();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('');

  const loadContacts = useCallback(async () => {
    if (!activeProfile) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextContacts = await emergencyContactApi.listContacts(
        activeProfile.id
      );
      setContacts(nextContacts);
    } catch (error) {
      console.warn('Failed to load emergency contacts:', error);
      setLoadError(t('emergencyContacts.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetForm = () => {
    setNewName('');
    setNewPhone('');
    setNewRelationship('');
  };

  const handleAddContact = async () => {
    if (!newName || !newPhone || !activeProfile) return;

    setIsSaving(true);

    try {
      const newContact = await emergencyContactApi.createContact(
        activeProfile.id,
        {
          name: newName,
          relationship: newRelationship || t('emergencyContacts.defaultRelationship'),
          phone: newPhone,
          priority_order: contacts.length + 1,
        }
      );
      setContacts((current) => [...current, newContact]);
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.warn('Failed to save emergency contact:', error);
      Alert.alert(t('emergencyContacts.saveErrorTitle'), t('common.tryAgain'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await emergencyContactApi.deleteContact(deleteTargetId);
      setContacts((current) =>
        current.filter((contact) => contact.id !== deleteTargetId)
      );
      setShowDeleteConfirm(false);
      setDeleteTargetId('');
    } catch (error) {
      console.warn('Failed to delete emergency contact:', error);
      Alert.alert(t('emergencyContacts.removeErrorTitle'), t('common.tryAgain'));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('emergencyContacts.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('emergencyContacts.subtitle')}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!activeProfile ? (
          <EmptyState
            title={t('emergencyContacts.noActiveProfileTitle')}
            message={t('emergencyContacts.noActiveProfile')}
          />
        ) : isLoading ? (
          <LoadingState message={t('emergencyContacts.loading')} />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={loadContacts} />
        ) : contacts.length === 0 && !showAddForm ? (
          <EmptyState
            title={t('emergencyContacts.emptyTitle')}
            message={t('emergencyContacts.emptyMessage')}
            actionLabel={t('emergencyContacts.addContact')}
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
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                    <Text style={styles.callBtnText}>{t('emergencyContacts.call')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() => Linking.openURL(`sms:${contact.phone}`)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble" size={14} color={theme.colors.primary} />
                    <Text style={styles.messageBtnText}>{t('emergencyContacts.message')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => {
                      setDeleteTargetId(contact.id);
                      setShowDeleteConfirm(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={18} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>{t('emergencyContacts.addContact')}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('emergencyContacts.name')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('emergencyContacts.namePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('emergencyContacts.phone')}</Text>
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
              <Text style={styles.inputLabel}>{t('emergencyContacts.relationship')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('emergencyContacts.relationshipPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={newRelationship}
                onChangeText={setNewRelationship}
              />
            </View>
            <View style={styles.formActions}>
              <LargeActionButton
                title={t('common.cancel')}
                onPress={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                variant="outline"
                style={{ flex: 1 }}
              />
              <LargeActionButton
                title={t('emergencyContacts.saveContact')}
                onPress={handleAddContact}
                variant="primary"
                disabled={!newName || !newPhone || isSaving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {!showAddForm && contacts.length > 0 && (
          <LargeActionButton
            title={t('emergencyContacts.addAnother')}
            onPress={() => setShowAddForm(true)}
            variant="outline"
            fullWidth
            style={{ marginTop: theme.spacing.base }}
          />
        )}
      </ScrollView>

      <ConfirmActionModal
        visible={showDeleteConfirm}
        title={t('emergencyContacts.removeTitle')}
        message={t('emergencyContacts.removeMessage')}
        confirmLabel={t('emergencyContacts.remove')}
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
