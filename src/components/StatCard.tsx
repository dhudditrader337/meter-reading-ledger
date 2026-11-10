import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, MONO } from '../constants/theme';
import { CONTENT_W } from '../constants/config';

const ROW_GAP = 10;
const CARD_PAD_H = 10;
const CARD_BORDER = 1;

/**
 * The value is a long grouped number ("-48 663.0") in a pill that is only a
 * third of the content width on GameScreen, so a fixed 20pt font ellipsised it
 * mid-number. The size is derived from the string length and the slot width
 * instead — monospace advances at ~0.66em, so the fit is predictable.
 */
function valueFontSize(value: string, columns: number): number {
  const slotW =
    (CONTENT_W - ROW_GAP * (columns - 1)) / columns -
    2 * (CARD_PAD_H + CARD_BORDER);
  const chars = Math.max(1, value.length);
  const fit = Math.floor((slotW - 2) / (chars * 0.66));
  return Math.max(12, Math.min(20, fit));
}

export type StatItem = {
  value: string;
  label: string;
  valueColor: string;
};

type CardProps = StatItem & { columns?: number };

/**
 * Rule #21: no raster icons in a stat pill — an 8x8 accent dot carries the
 * semantics, the number is the hero. Identical on every screen.
 * `width:'100%'` and NOT `flex:1`, because the parent slot is already flex:1
 * (rule #19a — flex inside flex collapses the card to ~0-30px).
 */
export function StatCard({ value, label, valueColor, columns = 2 }: CardProps) {
  const fontSize = valueFontSize(value, columns);
  return (
    <View style={[styles.card, { borderColor: valueColor + '55' }]}>
      <View style={[styles.dot, { backgroundColor: valueColor }]} />
      <Text
        style={[
          styles.value,
          { color: valueColor, fontSize, lineHeight: fontSize + 4 },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type RowProps = {
  items: StatItem[];
};

/**
 * Renders the row only when at least 2 pills carry a real value — a lone pill
 * looks orphaned and an empty pill reads as a broken skeleton (rule #21).
 */
export function StatRow({ items }: RowProps) {
  const visible = items.filter(
    item => item.value !== '' && item.value !== '--' && item.value !== '0',
  );
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={styles.row}>
      {visible.map(item => (
        <View key={item.label} style={styles.slot}>
          <StatCard {...item} columns={visible.length} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', gap: ROW_GAP },
  slot: { flex: 1 },
  card: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: CARD_PAD_H,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: CARD_BORDER,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  value: {
    ...MONO,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: C.textTertiary,
  },
});

export default StatCard;
