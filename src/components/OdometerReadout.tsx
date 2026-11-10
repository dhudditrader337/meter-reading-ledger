import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { C, MONO } from '../constants/theme';
import { CELL_GAP, DOT_DIAMETER, INT_CELLS } from '../constants/config';
import { useOdometer } from '../hooks/useOdometer';
import { bufferCells, odometerCells } from '../utils/format';

export type OdometerSize = 'sm' | 'md' | 'lg';

type Props = {
  /** Numeric value, or a raw keypad buffer like "48317.5" when typing. */
  value?: number;
  buffer?: string;
  decimals: number;
  intCells?: number;
  size?: OdometerSize;
  color?: string;
  /** Dims the whole readout — used for the "previous value" ghost. */
  ghost?: boolean;
  animate?: boolean;
  /** Changing this re-triggers the staggered roll. */
  rollKey?: string | number;
  /** Overrides the preset cell geometry (the GameScreen display panel). */
  cellW?: number;
  cellH?: number;
  fontSize?: number;
};

const SIZES: Record<OdometerSize, { w: number; h: number; font: number; radius: number }> = {
  sm: { w: 15, h: 22, font: 14, radius: 4 },
  md: { w: 20, h: 30, font: 19, radius: 5 },
  lg: { w: 26, h: 40, font: 25, radius: 6 },
};

/**
 * The mechanical odometer roll (signature animation): every cell slides in from
 * -cellHeight with a 40ms stagger. transform + opacity only, so
 * useNativeDriver stays true (animation-gpu-properties).
 */
export function OdometerReadout({
  value,
  buffer,
  decimals,
  intCells = INT_CELLS,
  size = 'md',
  color = C.primary,
  ghost = false,
  animate = true,
  rollKey,
  cellW,
  cellH,
  fontSize,
}: Props) {
  const preset = SIZES[size];
  const dims = {
    w: cellW ?? preset.w,
    h: cellH ?? preset.h,
    font: fontSize ?? preset.font,
    radius: preset.radius,
  };
  const total = intCells + decimals;
  const { progress, roll } = useOdometer(total, animate);

  useEffect(() => {
    roll();
  }, [roll, rollKey]);

  const cells = useMemo(() => {
    if (buffer !== undefined) {
      return bufferCells(buffer, decimals, intCells);
    }
    return odometerCells(value ?? 0, decimals, intCells);
  }, [buffer, value, decimals, intCells]);

  const digitColor = ghost ? C.textTertiary : color;
  const glow = ghost || size === 'sm' ? null : { textShadowColor: color + '66', textShadowRadius: 10 };

  const renderCell = (
    digit: string,
    index: number,
    dim: boolean,
    tint: string,
  ) => {
    const p = progress[index];
    // Nested native-driven opacity (ScreenFrame -> menu tile stagger -> this
    // Animated.Text) sticks at 0 on Android release builds and blanks the whole
    // readout. The digit opacity is therefore STATIC; only translateY animates,
    // and over a short range so a stalled roll still leaves the digit fully
    // inside its cell instead of parked behind overflow:hidden.
    const translateY = p.interpolate({
      inputRange: [0, 1],
      outputRange: [-Math.min(6, Math.round(dims.h * 0.22)), 0],
    });
    return (
      <View
        key={'cell-' + index}
        style={[
          styles.cell,
          { width: dims.w, height: dims.h, borderRadius: dims.radius },
        ]}
      >
        <Animated.Text
          style={[
            styles.digit,
            { fontSize: dims.font, lineHeight: dims.h, color: tint },
            glow,
            dim ? styles.dim : null,
            { opacity: dim ? 0.42 : 1, transform: [{ translateY }] },
          ]}
        >
          {digit}
        </Animated.Text>
      </View>
    );
  };

  return (
    <View style={styles.row}>
      {cells.intDigits.map((d, i) =>
        renderCell(d, i, i < cells.leadingZeros, digitColor),
      )}
      {decimals > 0 ? (
        <View style={[styles.dot, { backgroundColor: ghost ? C.textTertiary : C.accent }]} />
      ) : null}
      {cells.decDigits.map((d, i) =>
        renderCell(d, intCells + i, false, ghost ? C.textTertiary : C.accent),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // A flex gap, not a per-cell marginRight — a trailing margin on the last
  // cell silently widens the readout past its panel.
  row: { flexDirection: 'row', alignItems: 'center', gap: CELL_GAP },
  cell: {
    backgroundColor: C.well,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  digit: {
    ...MONO,
    fontWeight: '800',
    textAlign: 'center',
  },
  dim: { opacity: 0.42 },
  dot: { width: DOT_DIAMETER, height: DOT_DIAMETER, borderRadius: 3 },
});

export default OdometerReadout;
