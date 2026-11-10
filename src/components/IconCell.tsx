import React from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { C } from '../constants/theme';
import { HIT_SLOP, SPRING_PRESS } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  onPress: () => void;
  label: string;
  /** Either a lucide icon component or one of the contract PNG glyphs. */
  Icon?: LucideIcon;
  image?: ImageSourcePropType;
  tint?: string;
};

/**
 * The 44x44 square action cell used in every header.
 * Pressable is the parent with an explicit width AND height (ui-pressable);
 * the Animated.View scales inside it.
 */
export function IconCell({ onPress, label, Icon, image, tint = C.textPrimary }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92, SPRING_PRESS);

  return (
    <Pressable
      style={styles.hit}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.cell, { transform: [{ scale }] }]}
      >
        {Icon ? <Icon size={24} color={tint} strokeWidth={1.75} /> : null}
        {image ? <Image source={image} style={styles.image} /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: 44, height: 44 },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.fill,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 24, height: 24, resizeMode: 'contain' },
});

export default IconCell;
