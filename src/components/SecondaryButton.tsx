import React from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, ViewStyle, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { C } from '../constants/theme';
import { HIT_SLOP, SECONDARY_H, SPRING_PRESS } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  tone?: 'neutral' | 'accent' | 'alert';
  style?: StyleProp<ViewStyle>;
};

const TONES = {
  neutral: { fg: C.textPrimary, border: C.borderStrong, bg: C.fill },
  accent: { fg: C.primary, border: 'rgba(122,209,81,0.35)', bg: C.primarySoft },
  alert: { fg: C.alert, border: 'rgba(255,92,92,0.35)', bg: 'rgba(255,92,92,0.10)' },
};

/**
 * Same icon geometry as PrimaryButton — 24x24 icon, lineHeight 24, gap 10.
 * Icon sizes never differ between Primary and Secondary on one screen.
 */
export function SecondaryButton({
  label,
  onPress,
  Icon,
  tone = 'neutral',
  style,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96, SPRING_PRESS);
  const t = TONES[tone];

  return (
    <Pressable
      style={[styles.hit, style]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.surface,
          { backgroundColor: t.bg, borderColor: t.border, transform: [{ scale }] },
        ]}
      >
        <View style={styles.row}>
          {Icon ? <Icon size={24} color={t.fg} strokeWidth={1.9} /> : null}
          <Text style={[styles.label, { color: t.fg }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: '100%', height: SECONDARY_H },
  surface: {
    width: '100%',
    height: SECONDARY_H,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});

export default SecondaryButton;
