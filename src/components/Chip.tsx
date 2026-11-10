import React from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { C } from '../constants/theme';
import { CHIP_H, HIT_SLOP, SPRING_PRESS } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Explicit width keeps the Pressable from relying on intrinsic sizing. */
  width: number;
  accent?: string;
  height?: number;
};

export function Chip({
  label,
  active,
  onPress,
  width,
  accent = C.primary,
  height = CHIP_H,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95, SPRING_PRESS);

  return (
    <Pressable
      style={[styles.hit, { width, height }]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.surface,
          { width, height, transform: [{ scale }] },
          active
            ? { borderColor: accent, backgroundColor: accent + '1A' }
            : { borderColor: C.border, backgroundColor: C.fill },
        ]}
      >
        <Text
          style={[styles.label, { color: active ? accent : C.textSecondary }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {},
  surface: {
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});

export default Chip;
