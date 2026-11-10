import React from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { C } from '../constants/theme';
import { CTA_H, HIT_SLOP, SPRING_PRESS } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

export type PrimaryVariant = 'green' | 'amber';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  variant?: PrimaryVariant;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

const GRADIENTS: Record<PrimaryVariant, string[]> = {
  green: ['#7AD151', '#5FB93C'],
  amber: ['#FFB000', '#D18F00'],
};

const SHADOW: Record<PrimaryVariant, string> = {
  green: '#7AD151',
  amber: '#FFB000',
};

const HORIZONTAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };

/**
 * Icon geometry is fixed by rule #20 / the button-icon centering rule:
 * icon exactly 24x24, label lineHeight 24, gap 10, flex row centred.
 * Never position:'absolute', never a different icon size on another button.
 */
export function PrimaryButton({
  label,
  onPress,
  Icon,
  disabled = false,
  variant = 'green',
  height = CTA_H,
  style,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96, SPRING_PRESS);
  const fg = disabled ? C.textTertiary : C.onPrimary;

  return (
    <Pressable
      style={[styles.hit, { height }, style]}
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          { height, transform: [{ scale }] },
          disabled ? null : [styles.shadow, { shadowColor: SHADOW[variant] }],
        ]}
      >
        {disabled ? (
          <View style={[styles.surface, { height }, styles.disabled]}>
            <View style={styles.row}>
              {Icon ? <Icon size={24} color={fg} strokeWidth={2.2} /> : null}
              <Text style={[styles.label, { color: fg }]}>{label}</Text>
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={GRADIENTS[variant]}
            start={HORIZONTAL.start}
            end={HORIZONTAL.end}
            style={[styles.surface, { height }]}
          >
            <View style={styles.row}>
              {Icon ? <Icon size={24} color={fg} strokeWidth={2.2} /> : null}
              <Text style={[styles.label, { color: fg }]}>{label}</Text>
            </View>
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: '100%' },
  wrap: { width: '100%', borderRadius: 18 },
  shadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  surface: {
    width: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: C.fillStrong,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
});

export default PrimaryButton;
