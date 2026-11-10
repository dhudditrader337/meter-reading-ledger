import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { C } from '../constants/theme';
import { SAVED_FLASH_MS } from '../constants/config';

type Props = {
  title?: string;
  /** Flashes the border in `accent` once on mount (the "saved" confirmation). */
  flashOnMount?: boolean;
  accent?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * The BENTO_GRID surface primitive: radius 20, graphite fill, 1px border,
 * even shadow. Every panel in the app is one of these cells.
 * The 350ms border flash animates `borderColor`, so useNativeDriver is false —
 * never true for a non-transform/opacity property (animation-gpu-properties).
 */
export function BentoCard({
  title,
  flashOnMount = false,
  accent = C.primary,
  style,
  children,
}: Props) {
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!flashOnMount) {
      return;
    }
    Animated.sequence([
      Animated.timing(flash, {
        toValue: 1,
        duration: SAVED_FLASH_MS / 2,
        useNativeDriver: false,
      }),
      Animated.timing(flash, {
        toValue: 0,
        duration: SAVED_FLASH_MS / 2,
        useNativeDriver: false,
      }),
    ]).start();
  }, [flash, flashOnMount]);

  const borderColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, accent],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.card, style, { borderColor }]}
    >
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.6,
    color: C.textTertiary,
    marginBottom: 10,
  },
});

export default BentoCard;
