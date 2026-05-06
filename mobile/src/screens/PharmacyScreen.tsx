import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import LargeActionButton from '../components/ui/LargeActionButton';
import { EmptyState } from '../components/ui/StateViews';
import { Pharmacy } from '../types/models';

interface PharmacyScreenProps {
  onBack?: () => void;
}

export default function PharmacyScreen({ onBack }: PharmacyScreenProps) {
  const insets = useSafeAreaInsets();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newHours, setNewHours] = useState('');

  const handleAdd = () => {
    if (!newName || !newPhone) return;
    const pharmacy: Pharmacy = {
      id: `pharm-${Date.now()}`,
      profile_id: 'profile-1',
      name: newName,
      phone: newPhone,
      address: newAddress || undefined,
      opening_hours: newHours || undefined,
      created_at: new Date().toISOString(),
    };
    setPharmacies([...pharmacies, pharmacy]);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewHours('');
    setShowAddForm(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pharmacy</Text>
        <Text style={styles.headerSubtitle}>
          Store your pharmacy details for quick access
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pharmacies.length === 0 && !showAddForm ? (
          <EmptyState
            title="No Pharmacy Added"
            message="Add your pharmacy so you can quickly call for refills or questions"
            actionLabel="Add Pharmacy"
            onAction={() => setShowAddForm(true)}
          />
        ) : (
          <>
            {pharmacies.map((pharmacy) => (
              <View key={pharmacy.id} style={styles.pharmacyCard}>
                <View style={styles.pharmacyHeader}>
                  <View style={styles.pharmacyIcon}>
                    <Ionicons name="medkit" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.pharmacyInfo}>
                    <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                    {pharmacy.address && (
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.pharmacyDetail}>{pharmacy.address}</Text>
                      </View>
                    )}
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                      <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.pharmacyDetail}>{pharmacy.phone}</Text>
                    </View>
                    {pharmacy.opening_hours && (
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.pharmacyDetail}>{pharmacy.opening_hours}</Text>
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
                    <Text style={styles.callPharmacyText}>Call Pharmacy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>Add Pharmacy</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pharmacy Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Priceline Pharmacy"
                placeholderTextColor={theme.colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
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
              <Text style={styles.inputLabel}>Address (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main Street"
                placeholderTextColor={theme.colors.textSecondary}
                value={newAddress}
                onChangeText={setNewAddress}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Opening Hours (optional)</Text>
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
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <LargeActionButton
                title="Save"
                onPress={handleAdd}
                variant="primary"
                disabled={!newName || !newPhone}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {!showAddForm && pharmacies.length > 0 && (
          <LargeActionButton
            title="+ Add Another Pharmacy"
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
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  callPharmacyBtn: {
    backgroundColor: theme.colors.successLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
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
