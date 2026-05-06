import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';
import LargeActionButton from '../components/ui/LargeActionButton';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/ui/StateViews';
import { Pharmacy } from '../types/models';
import { pharmacyApi } from '../services/api';
import { useProfiles } from '../contexts/ProfileContext';

interface PharmacyScreenProps {
  onBack?: () => void;
}

export default function PharmacyScreen({ onBack }: PharmacyScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { activeProfile } = useProfiles();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newHours, setNewHours] = useState('');

  const loadPharmacies = useCallback(async () => {
    if (!activeProfile) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextPharmacies = await pharmacyApi.listPharmacies(activeProfile.id);
      setPharmacies(nextPharmacies);
    } catch (error) {
      console.warn('Failed to load pharmacies:', error);
      setLoadError(t('pharmacy.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadPharmacies();
  }, [loadPharmacies]);

  const resetForm = () => {
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewHours('');
  };

  const handleAdd = async () => {
    if (!newName || !newPhone || !activeProfile) return;

    setIsSaving(true);

    try {
      const pharmacy = await pharmacyApi.createPharmacy(activeProfile.id, {
        name: newName,
        phone: newPhone,
        address: newAddress || undefined,
        opening_hours: newHours || undefined,
      });
      setPharmacies((current) => [...current, pharmacy]);
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.warn('Failed to save pharmacy:', error);
      Alert.alert(t('pharmacy.saveErrorTitle'), t('common.tryAgain'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pharmacyApi.deletePharmacy(id);
      setPharmacies((current) =>
        current.filter((pharmacy) => pharmacy.id !== id)
      );
    } catch (error) {
      console.warn('Failed to delete pharmacy:', error);
      Alert.alert(t('pharmacy.removeErrorTitle'), t('common.tryAgain'));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pharmacy.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('pharmacy.subtitle')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!activeProfile ? (
          <EmptyState
            title="No Active Profile"
            message={t('pharmacy.noActiveProfile')}
          />
        ) : isLoading ? (
          <LoadingState message={t('pharmacy.loading')} />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={loadPharmacies} />
        ) : pharmacies.length === 0 && !showAddForm ? (
          <EmptyState
            title={t('pharmacy.emptyTitle')}
            message={t('pharmacy.emptyMessage')}
            actionLabel={t('pharmacy.addPharmacy')}
            onAction={() => setShowAddForm(true)}
          />
        ) : (
          <>
            {pharmacies.map((pharmacy) => (
              <View key={pharmacy.id} style={styles.pharmacyCard}>
                <View style={styles.pharmacyHeader}>
                  <View style={styles.pharmacyIcon}>
                    <Ionicons
                      name="medkit"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.pharmacyInfo}>
                    <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                    {pharmacy.address && (
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.pharmacyDetail}>
                          {pharmacy.address}
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="call-outline"
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.pharmacyDetail}>
                        {pharmacy.phone}
                      </Text>
                    </View>
                    {pharmacy.opening_hours && (
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.pharmacyDetail}>
                          {pharmacy.opening_hours}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.pharmacyActions}>
                  <TouchableOpacity
                    style={styles.callPharmacyBtn}
                    onPress={() => Linking.openURL(`tel:${pharmacy.phone}`)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.callPharmacyText}>
                      {t('pharmacy.callPharmacy')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deletePharmacyBtn}
                    onPress={() => handleDelete(pharmacy.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="trash"
                      size={18}
                      color={theme.colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>{t('pharmacy.addPharmacy')}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('pharmacy.nameLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('pharmacy.namePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('pharmacy.phoneLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder="+61 2 0000 0000"
                placeholderTextColor={theme.colors.textSecondary}
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('pharmacy.addressLabel')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main Street"
                placeholderTextColor={theme.colors.textSecondary}
                value={newAddress}
                onChangeText={setNewAddress}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('pharmacy.hoursLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Mon-Fri 8am-6pm, Sat 9am-1pm"
                placeholderTextColor={theme.colors.textSecondary}
                value={newHours}
                onChangeText={setNewHours}
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
                title={t('common.save')}
                onPress={handleAdd}
                variant="primary"
                disabled={!newName || !newPhone || isSaving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {!showAddForm && pharmacies.length > 0 && (
          <LargeActionButton
            title={t('pharmacy.addAnother')}
            onPress={() => setShowAddForm(true)}
            variant="outline"
            fullWidth
            style={{ marginTop: theme.spacing.base }}
          />
        )}
      </ScrollView>
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
  pharmacyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.base,
  },
  pharmacyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pharmacyIconText: {
    fontSize: 22,
  },
  pharmacyInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pharmacyName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  pharmacyDetail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  callPharmacyBtn: {
    flex: 1,
    backgroundColor: theme.colors.successLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  deletePharmacyBtn: {
    backgroundColor: theme.colors.dangerLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callPharmacyText: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
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
