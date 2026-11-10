import React, { memo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { C, MONO } from '../constants/theme';
import {
  HIT_SLOP,
  SPRING_PRESS,
  TILE_CELLS,
  TILE_CELL_H,
  TILE_CELL_W,
  TILE_H,
  TILE_PAD_H,
  TILE_W,
} from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';
import { OdometerReadout } from './OdometerReadout';
import { spriteFor } from '../assets';
import { formatDelta } from '../utils/format';

type Props = {
  meterId: string;
  name: string;
  color: string;
  sprite: number;
  unit: string;
  decimals: number;
  /** undefined when the meter has no reading yet. */
  lastValue?: number;
  perDay: number;
  onPress: (meterId: string) => void;
};

/**
 * A bento cell: 3px top accent strip, the meter sprite, the odometer readout
 * and a per-day caption. The sprite is a plain transparent <Image> — no
 * overflow:hidden + borderRadius mask (rule #7) — and sits at positive
 * offsets so it can never poke out of the rounded corner (rule #18).
 */
function MeterTileBase({
  meterId,
  name,
  color,
  sprite,
  unit,
  decimals,
  lastValue,
  perDay,
  onPress,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97, SPRING_PRESS);
  const hasReading = lastValue !== undefined;

  return (
    <Pressable
      style={styles.hit}
      onPress={() => onPress(meterId)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={name + ' meter, open new reading'}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.tile, { transform: [{ scale }] }]}
      >
        <View style={[styles.accentStrip, { backgroundColor: color }]} />
        <View style={styles.topRow}>
          <Image source={spriteFor(sprite)} style={styles.sprite} />
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <Text style={[styles.name, { color: C.textSecondary }]} numberOfLines={1}>
          {name}
        </Text>
        {hasReading ? (
          <OdometerReadout
            value={Math.round(lastValue)}
            decimals={0}
            intCells={TILE_CELLS}
            size="sm"
            color={color}
            cellW={TILE_CELL_W}
            cellH={TILE_CELL_H}
            fontSize={Math.round(TILE_CELL_W * 0.74)}
            rollKey={lastValue}
          />
        ) : (
          <Text style={styles.placeholder}>------</Text>
        )}
        <Text style={styles.caption} numberOfLines={1}>
          {hasReading
            ? formatDelta(perDay, decimals) + ' / DAY'
            : 'NO READINGS YET'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export const MeterTile = memo(MeterTileBase);

const styles = StyleSheet.create({
  hit: { width: TILE_W, height: TILE_H },
  tile: {
    width: TILE_W,
    height: TILE_H,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingTop: 13,
    paddingHorizontal: TILE_PAD_H,
    paddingBottom: 10,
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  accentStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sprite: { width: 28, height: 28, resizeMode: 'contain' },
  unit: {
    ...MONO,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: C.textTertiary,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  placeholder: {
    ...MONO,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.textTertiary,
  },
  caption: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: C.textTertiary,
  },
});

export default MeterTile;
