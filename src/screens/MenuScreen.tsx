import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart3, Gauge, List, Plus } from 'lucide-react-native';
import { assets } from '../assets';
import { C } from '../constants/theme';
import {
  CONTENT_W,
  GRID_W,
  HIT_SLOP,
  SPRING_PRESS,
  TILE_GAP,
  TILE_IN_MS,
  TILE_STAGGER_MS,
} from '../constants/config';
import {
  Meter,
  Reading,
  computeDelta,
  daysBetween,
  lastReading,
  monthlyTotal,
  perDay,
  previousReading,
  yoyPercent,
} from '../game/ledger';
import { LedgerSettings } from '../game/seed';
import { formatMonth, formatPercent, formatValue } from '../utils/format';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconCell } from '../components/IconCell';
import { MeterTile } from '../components/MeterTile';
import { StatRow } from '../components/StatCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  meters: Meter[];
  readings: Reading[];
  settings: LedgerSettings;
  onOpenMeter: (meterId: string) => void;
  onAddMeter: () => void;
  onHistory: () => void;
  onCharts: () => void;
  onSettings: () => void;
};

type TileData = {
  meterId: string;
  name: string;
  color: string;
  sprite: number;
  unit: string;
  decimals: number;
  lastValue?: number;
  perDay: number;
};

function AddMeterRow({ onPress }: { onPress: () => void }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97, SPRING_PRESS);
  return (
    <Pressable
      style={styles.addHit}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel="Add meter"
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.addCell, { transform: [{ scale }] }]}
      >
        <View style={styles.addRow}>
          <Plus size={24} color={C.primary} strokeWidth={2.2} />
          <Text style={styles.addLabel}>ADD METER</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Meter Board — M3 Bento-Hub. */
export function MenuScreen({
  meters,
  readings,
  settings,
  onOpenMeter,
  onAddMeter,
  onHistory,
  onCharts,
  onSettings,
}: Props) {
  const now = useMemo(() => new Date(), []);

  const tiles = useMemo<TileData[]>(
    () =>
      meters.map(meter => {
        const last = lastReading(readings, meter.id);
        if (!last) {
          return {
            meterId: meter.id,
            name: meter.name,
            color: meter.color,
            sprite: meter.sprite,
            unit: meter.unit,
            decimals: meter.decimals,
            lastValue: undefined,
            perDay: 0,
          };
        }
        const prev = previousReading(readings, last);
        const delta = computeDelta(last.value, prev?.value, last.isReset);
        const days = prev ? daysBetween(prev.dateIso, last.dateIso) : 1;
        return {
          meterId: meter.id,
          name: meter.name,
          color: meter.color,
          sprite: meter.sprite,
          unit: meter.unit,
          decimals: meter.decimals,
          lastValue: last.value,
          perDay: perDay(delta, days),
        };
      }),
    [meters, readings],
  );

  const primaryMeter = meters.length > 0 ? meters[0] : undefined;

  const monthTotal = primaryMeter
    ? monthlyTotal(readings, primaryMeter.id, now, settings.firstBillingDay)
    : 0;
  const yoy = primaryMeter ? yoyPercent(readings, primaryMeter.id, now) : null;

  const statItems = useMemo(
    () => [
      {
        value:
          monthTotal > 0 && primaryMeter
            ? formatValue(Math.round(monthTotal), 0, settings.numberFormat) +
              ' ' +
              primaryMeter.unit
            : '',
        label: 'THIS MONTH',
        valueColor: C.primary,
      },
      {
        value: yoy === null ? '' : formatPercent(yoy),
        label: 'VS LAST YEAR',
        valueColor: C.accent,
      },
    ],
    [monthTotal, primaryMeter, settings.numberFormat, yoy],
  );

  // Tile stagger animates opacity + translateY only, so the native driver is safe.
  const stagger = useRef<Animated.Value[]>([]).current;
  const tileCount = tiles.length;
  while (stagger.length < tileCount) {
    stagger.push(new Animated.Value(0));
  }

  useEffect(() => {
    const anim = Animated.stagger(
      TILE_STAGGER_MS,
      stagger.slice(0, tileCount).map(v =>
        Animated.timing(v, {
          toValue: 1,
          duration: TILE_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    );
    anim.start();
    return () => {
      anim.stop();
    };
  }, [stagger, tileCount]);

  const handleStart = useCallback(() => {
    if (primaryMeter) {
      onOpenMeter(primaryMeter.id);
    }
  }, [onOpenMeter, primaryMeter]);

  return (
    <ScreenBackground variant="menu">
      <ScreenHeader
        title="LEDGER"
        subtitle="METER BOARD"
        leftSlot={<Image source={assets.logo} style={styles.brand} />}
        rightSlot={
          <IconCell
            onPress={onSettings}
            label="Settings"
            image={assets.iconHome}
          />
        }
      />

      <View style={styles.body}>
        <View style={styles.periodStrip}>
          <Text style={styles.periodText}>
            {'BILLING MONTH · ' + formatMonth(now)}
          </Text>
          <View style={styles.dueWrap}>
            <View style={styles.dueDot} />
            <Text style={styles.dueText}>DUE IN 7 DAYS</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {tiles.map((tile, index) => {
            const p = stagger[index];
            return (
              <Animated.View
                key={tile.meterId}
                pointerEvents="box-none"
                style={{
                  opacity: p,
                  transform: [
                    {
                      translateY: p.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                  ],
                }}
              >
                <MeterTile
                  meterId={tile.meterId}
                  name={tile.name}
                  color={tile.color}
                  sprite={tile.sprite}
                  unit={tile.unit}
                  decimals={tile.decimals}
                  lastValue={tile.lastValue}
                  perDay={tile.perDay}
                  onPress={onOpenMeter}
                />
              </Animated.View>
            );
          })}
        </View>

        <AddMeterRow onPress={onAddMeter} />

        <View style={styles.stats}>
          <StatRow items={statItems} />
        </View>

        <View style={styles.secondaryRow}>
          <View style={styles.secondarySlot}>
            <SecondaryButton label="HISTORY" Icon={List} onPress={onHistory} />
          </View>
          <View style={styles.secondarySlot}>
            <SecondaryButton label="CHARTS" Icon={BarChart3} onPress={onCharts} />
          </View>
        </View>

        <Text style={styles.hint}>TAP A METER TO LOG A NEW VALUE</Text>

        <PrimaryButton label="START READING" Icon={Gauge} onPress={handleStart} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  brand: { width: 30, height: 30, resizeMode: 'contain' },
  body: {
    flex: 1,
    width: CONTENT_W,
    alignSelf: 'center',
    paddingBottom: 16,
    // Spare height is shared between the blocks instead of pooling in one
    // hole — the emulator viewport is far taller than a phone's.
    justifyContent: 'space-between',
  },
  periodStrip: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: C.textSecondary,
  },
  dueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dueDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  dueText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: C.accent,
  },
  grid: {
    width: GRID_W,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
    justifyContent: 'center',
  },
  addHit: { width: '100%', height: 46, marginTop: 10 },
  addCell: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(122,209,81,0.35)',
    backgroundColor: 'rgba(122,209,81,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addLabel: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: C.primary,
  },
  stats: { marginTop: 10 },
  secondaryRow: { marginTop: 10, flexDirection: 'row', gap: 10 },
  secondarySlot: { flex: 1 },
  hint: {
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: C.textTertiary,
  },
});

export default MenuScreen;
