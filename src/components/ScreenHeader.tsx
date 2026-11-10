import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C } from '../constants/theme';
import { HEADER_CONTENT_H, HEADER_PAD_TOP } from '../constants/config';

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

/**
 * The one header used by every screen (Menu / Game / GameOver / History /
 * Charts / AddMeter / Settings). Screens differ only through leftSlot, title
 * and rightSlot — inline header markup per screen drifts in styling.
 * paddingTop: 44 keeps it clear of the status bar (rule #6).
 */
export function ScreenHeader({ title, subtitle, leftSlot, rightSlot }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.slot}>{leftSlot ?? null}</View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.slotRight}>{rightSlot ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: HEADER_PAD_TOP,
    height: HEADER_PAD_TOP + HEADER_CONTENT_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230,234,240,0.07)',
  },
  slot: { minWidth: 44, alignItems: 'flex-start', justifyContent: 'center' },
  slotRight: { minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: C.textPrimary,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: C.textTertiary,
  },
});

export default ScreenHeader;
