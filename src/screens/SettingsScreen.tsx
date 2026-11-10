import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronLeft, Download, Upload } from 'lucide-react-native';
import { C, MONO } from '../constants/theme';
import {
  APP_VERSION,
  BILLING_DAY_CHOICES,
  CONTENT_W,
} from '../constants/config';
import { Meter } from '../game/ledger';
import { LedgerSettings } from '../game/seed';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconCell } from '../components/IconCell';
import { BentoCard } from '../components/BentoCard';
import { Chip } from '../components/Chip';
import { SecondaryButton } from '../components/SecondaryButton';

type Props = {
  meters: Meter[];
  settings: LedgerSettings;
  onBack: () => void;
  onUpdateSettings: (patch: Partial<LedgerSettings>) => void;
  onSetRate: (meterId: string, rate: number | undefined) => void;
  onExport: () => number;
  onImport: () => boolean;
};

type BackupState = 'idle' | 'exported' | 'imported' | 'empty';

const TONE_LABELS: Array<{ key: 'dark' | 'dim'; label: string }> = [
  { key: 'dark', label: 'DARK' },
  { key: 'dim', label: 'DIM' },
];

const FORMAT_LABELS: Array<{ key: 'space' | 'dotComma'; label: string }> = [
  { key: 'space', label: '1 234.5' },
  { key: 'dotComma', label: '1.234,5' },
];

/** Settings — Appearance / Billing / Rate Notes / Local Backup / About. */
export function SettingsScreen({
  meters,
  settings,
  onBack,
  onUpdateSettings,
  onSetRate,
  onExport,
  onImport,
}: Props) {
  const [backup, setBackup] = useState<BackupState>('idle');
  const [backupBytes, setBackupBytes] = useState(0);

  const pairWidth = useMemo(() => Math.floor((CONTENT_W - 28 - 10) / 2), []);
  const dayWidth = useMemo(
    () => Math.floor((CONTENT_W - 28 - 8 * 5) / 6),
    [],
  );

  const handleExport = useCallback(() => {
    const bytes = onExport();
    setBackupBytes(bytes);
    setBackup('exported');
  }, [onExport]);

  const handleImport = useCallback(() => {
    setBackup(onImport() ? 'imported' : 'empty');
  }, [onImport]);

  const handleRate = useCallback(
    (meterId: string, text: string) => {
      const parsed = parseFloat(text.replace(',', '.'));
      onSetRate(meterId, isFinite(parsed) && parsed > 0 ? parsed : undefined);
    },
    [onSetRate],
  );

  const backupMessage =
    backup === 'exported'
      ? 'EXPORTED ' + backupBytes + ' BYTES TO THE LOCAL FILE'
      : backup === 'imported'
      ? 'READINGS RESTORED FROM THE LOCAL FILE'
      : backup === 'empty'
      ? 'NO LOCAL BACKUP FILE YET'
      : '';

  return (
    <ScreenBackground variant="plain">
      <ScreenHeader
        title="SETTINGS"
        subtitle="LOCAL ONLY"
        leftSlot={<IconCell onPress={onBack} label="Back" Icon={ChevronLeft} />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <BentoCard title="APPEARANCE">
              <View style={styles.chipRow}>
                {TONE_LABELS.map(option => (
                  <Chip
                    key={option.key}
                    label={option.label}
                    active={settings.surfaceTone === option.key}
                    width={pairWidth}
                    onPress={() => onUpdateSettings({ surfaceTone: option.key })}
                  />
                ))}
              </View>
              <Text style={styles.sub}>NUMBER FORMAT</Text>
              <View style={styles.chipRow}>
                {FORMAT_LABELS.map(option => (
                  <Chip
                    key={option.key}
                    label={option.label}
                    active={settings.numberFormat === option.key}
                    width={pairWidth}
                    accent={C.accent}
                    onPress={() => onUpdateSettings({ numberFormat: option.key })}
                  />
                ))}
              </View>
            </BentoCard>

            <BentoCard title="BILLING · FIRST DAY OF THE MONTH">
              <View style={styles.chipRow}>
                {BILLING_DAY_CHOICES.map(day => (
                  <Chip
                    key={day}
                    label={String(day)}
                    active={settings.firstBillingDay === day}
                    width={dayWidth}
                    onPress={() => onUpdateSettings({ firstBillingDay: day })}
                  />
                ))}
              </View>
            </BentoCard>

            <BentoCard title="RATE NOTES">
              {meters.map(meter => (
                <View key={meter.id} style={styles.rateRow}>
                  <View style={[styles.rateDot, { backgroundColor: meter.color }]} />
                  <Text style={styles.rateName} numberOfLines={1}>
                    {meter.name}
                  </Text>
                  <TextInput
                    style={styles.rateInput}
                    defaultValue={meter.rate !== undefined ? String(meter.rate) : ''}
                    onChangeText={text => handleRate(meter.id, text)}
                    placeholder="0.00"
                    placeholderTextColor={C.textTertiary}
                    keyboardType="decimal-pad"
                    maxLength={8}
                  />
                </View>
              ))}
              <Text style={styles.note}>
                PRICE PER UNIT · PERSONAL REFERENCE ONLY - NOT A BILL
              </Text>
            </BentoCard>

            <BentoCard
              title="BACKUP"
              flashOnMount={backup === 'exported' || backup === 'imported'}
            >
              <View style={styles.backupRow}>
                <View style={styles.backupSlot}>
                  <SecondaryButton
                    label="EXPORT"
                    Icon={Download}
                    onPress={handleExport}
                  />
                </View>
                <View style={styles.backupSlot}>
                  <SecondaryButton
                    label="IMPORT"
                    Icon={Upload}
                    onPress={handleImport}
                  />
                </View>
              </View>
              {backupMessage ? (
                <Text
                  style={[
                    styles.note,
                    backup === 'empty' ? styles.noteAlert : styles.noteOk,
                  ]}
                >
                  {backupMessage}
                </Text>
              ) : null}
            </BentoCard>

            <BentoCard title="ABOUT">
              <Text style={styles.about}>ALL DATA STAYS ON THIS DEVICE</Text>
              <Text style={styles.version}>
                {'METER READING LEDGER · V' + APP_VERSION}
              </Text>
            </BentoCard>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: {
    flex: 1,
    width: CONTENT_W,
    alignSelf: 'center',
  },
  scrollContent: { paddingTop: 14, paddingBottom: 24, gap: 12 },
  chipRow: { flexDirection: 'row', gap: 10 },
  sub: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.6,
    color: C.textTertiary,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  rateDot: { width: 8, height: 8, borderRadius: 4 },
  rateName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: C.textSecondary,
  },
  rateInput: {
    ...MONO,
    width: 92,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: C.well,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
    textAlign: 'right',
  },
  backupRow: { flexDirection: 'row', gap: 10 },
  backupSlot: { flex: 1 },
  note: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: C.textTertiary,
  },
  noteOk: { color: C.primary },
  noteAlert: { color: C.accent },
  about: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: C.textSecondary,
  },
  version: {
    ...MONO,
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: C.textTertiary,
  },
});

export default SettingsScreen;
