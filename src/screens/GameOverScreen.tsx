import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, List, Plus } from 'lucide-react-native';
import { C, MONO } from '../constants/theme';
import { CONTENT_W, INT_CELLS, SPRING_POP } from '../constants/config';
import { Meter, estimateFor } from '../game/ledger';
import { LedgerSettings } from '../game/seed';
import { SaveResult } from '../hooks/useLedger';
import { formatDate, formatDelta, formatValue } from '../utils/format';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconCell } from '../components/IconCell';
import { BentoCard } from '../components/BentoCard';
import { OdometerReadout } from '../components/OdometerReadout';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';

type Props = {
  meter: Meter;
  result: SaveResult;
  settings: LedgerSettings;
  onLogAgain: () => void;
  onMenu: () => void;
  onHistory: () => void;
};

type MiniCell = { label: string; value: string; color: string };

/** Reading Saved — the result screen required by rule #12. */
export function GameOverScreen({
  meter,
  result,
  settings,
  onLogAgain,
  onMenu,
  onHistory,
}: Props) {
  const pop = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.spring(pop, {
      toValue: 1,
      tension: SPRING_POP.tension,
      friction: SPRING_POP.friction,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [pop]);

  const estimate = estimateFor(result.delta, meter.rate);

  const cells = useMemo<MiniCell[]>(() => {
    const base: MiniCell[] = [
      {
        label: 'DIFFERENCE',
        value: formatDelta(result.delta, meter.decimals, settings.numberFormat),
        color: result.delta < 0 ? C.alert : C.primary,
      },
      {
        label: 'PER DAY',
        value: formatDelta(result.perDay, meter.decimals, settings.numberFormat),
        color: C.accent,
      },
      {
        label: 'DAYS SINCE LAST',
        value: String(result.days),
        color: C.textSecondary,
      },
    ];
    if (estimate !== null) {
      base.push({
        label: 'EST. VALUE',
        value: formatValue(Math.round(estimate), 0, settings.numberFormat),
        color: C.textPrimary,
      });
    }
    return base;
  }, [result, meter.decimals, settings.numberFormat, estimate]);

  return (
    <ScreenBackground variant="saved">
      <ScreenHeader
        title="READING SAVED"
        subtitle={meter.name}
        rightSlot={<IconCell onPress={onMenu} label="Meter board" Icon={List} />}
      />

      <View style={styles.body}>
        <View style={styles.hero}>
          <Animated.View
            pointerEvents="none"
            style={[styles.badge, { transform: [{ scale: pop }] }]}
          >
            <CheckCircle2 size={48} color={C.primary} strokeWidth={1.75} />
          </Animated.View>

          <Text style={styles.title}>READING SAVED</Text>
          <Text style={styles.subtitle}>
            {meter.name + ' · ' + formatDate(result.dateIso)}
          </Text>
        </View>

        <BentoCard flashOnMount accent={C.primary} style={styles.summary}>
          <View style={styles.readoutWrap}>
            <OdometerReadout
              value={result.value}
              decimals={meter.decimals}
              intCells={INT_CELLS}
              size="md"
              color={C.primary}
              rollKey={result.readingId}
            />
            <Text style={styles.unit}>{meter.unit}</Text>
          </View>

          <View style={styles.miniGrid}>
            {cells.map(cell => (
              <View key={cell.label} style={styles.miniCell}>
                <Text style={[styles.miniValue, { color: cell.color }]} numberOfLines={1}>
                  {cell.value}
                </Text>
                <Text style={styles.miniLabel} numberOfLines={1}>
                  {cell.label}
                </Text>
              </View>
            ))}
          </View>

          {estimate !== null ? (
            <Text style={styles.note}>
              ESTIMATE FOR PERSONAL REFERENCE ONLY
            </Text>
          ) : null}
        </BentoCard>

        <View style={styles.actions}>
          <PrimaryButton
            label="LOG AGAIN"
            Icon={Plus}
            height={56}
            onPress={onLogAgain}
          />
          <SecondaryButton label="METER BOARD" onPress={onMenu} />
          <SecondaryButton label="VIEW HISTORY" onPress={onHistory} />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: CONTENT_W,
    alignSelf: 'center',
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center', paddingTop: 18 },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(122,209,81,0.12)',
    borderWidth: 2,
    borderColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2.4,
    color: C.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: C.textSecondary,
  },
  summary: { width: '100%' },
  readoutWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
  },
  unit: {
    ...MONO,
    fontSize: 12,
    fontWeight: '700',
    color: C.textTertiary,
  },
  miniGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  miniCell: {
    width: (CONTENT_W - 28 - 10) / 2,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: C.well,
    borderWidth: 1,
    borderColor: C.border,
  },
  miniValue: {
    ...MONO,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  miniLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: C.textTertiary,
  },
  note: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: C.textTertiary,
  },
  actions: { gap: 10, paddingTop: 16 },
});

export default GameOverScreen;
