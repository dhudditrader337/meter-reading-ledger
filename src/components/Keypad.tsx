import React, { memo, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Delete } from 'lucide-react-native';
import { C, MONO } from '../constants/theme';
import {
  HIT_SLOP,
  KEY_GAP,
  KEY_H,
  KEY_W,
  PAD_FRAME,
  PAD_W,
  SPRING_KEY,
} from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

type KeyKind = 'digit' | 'dot' | 'back';

type KeyProps = {
  value: string;
  kind: KeyKind;
  disabled: boolean;
  onKey: (value: string, kind: KeyKind) => void;
};

function KeyBase({ value, kind, disabled, onKey }: KeyProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.93, SPRING_KEY);
  const tint =
    kind === 'dot' ? C.accent : kind === 'back' ? C.alert : C.textPrimary;

  return (
    <Pressable
      style={styles.keyHit}
      disabled={disabled}
      onPress={disabled ? undefined : () => onKey(value, kind)}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={
        kind === 'back' ? 'Backspace' : kind === 'dot' ? 'Decimal point' : value
      }
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.key, { transform: [{ scale }] }]}
      >
        {kind === 'back' ? (
          <Delete size={24} color={tint} strokeWidth={1.9} />
        ) : (
          <Text style={[styles.keyLabel, { color: tint }]}>{value}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const Key = memo(KeyBase);

type Props = {
  onDigit: (digit: string) => void;
  onDot: () => void;
  onBackspace: () => void;
  disabled?: boolean;
  allowDot?: boolean;
};

const ROWS: Array<Array<{ value: string; kind: KeyKind }>> = [
  [
    { value: '1', kind: 'digit' },
    { value: '2', kind: 'digit' },
    { value: '3', kind: 'digit' },
  ],
  [
    { value: '4', kind: 'digit' },
    { value: '5', kind: 'digit' },
    { value: '6', kind: 'digit' },
  ],
  [
    { value: '7', kind: 'digit' },
    { value: '8', kind: 'digit' },
    { value: '9', kind: 'digit' },
  ],
  [
    { value: '.', kind: 'dot' },
    { value: '0', kind: 'digit' },
    { value: 'back', kind: 'back' },
  ],
];

/**
 * 3x4 numeric pad sized by the frame formula (rules #4-5) so the keys can never
 * stick out of the panel. One hoisted handler for all twelve keys.
 */
export function Keypad({
  onDigit,
  onDot,
  onBackspace,
  disabled = false,
  allowDot = true,
}: Props) {
  const onKey = useCallback(
    (value: string, kind: KeyKind) => {
      if (kind === 'digit') {
        onDigit(value);
      } else if (kind === 'dot') {
        onDot();
      } else {
        onBackspace();
      }
    },
    [onDigit, onDot, onBackspace],
  );

  return (
    <View style={styles.pad}>
      {ROWS.map((row, rowIndex) => (
        <View key={'row-' + rowIndex} style={styles.row}>
          {row.map(key => (
            <Key
              key={key.value}
              value={key.value}
              kind={key.kind}
              disabled={disabled || (key.kind === 'dot' && !allowDot)}
              onKey={onKey}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    width: PAD_W,
    alignSelf: 'center',
    padding: PAD_FRAME - 1,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: KEY_GAP,
  },
  row: { flexDirection: 'row', gap: KEY_GAP },
  keyHit: { width: KEY_W, height: KEY_H },
  key: {
    width: KEY_W,
    height: KEY_H,
    borderRadius: 14,
    backgroundColor: C.surfaceRaised,
    borderWidth: 1,
    borderColor: C.fillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    ...MONO,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
});

export default Keypad;
