import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { C, MONO } from '../constants/theme';
import { formatDateShort, formatDelta, formatValue } from '../utils/format';

type Props = {
  dateIso: string;
  value: number;
  delta: number;
  decimals: number;
  hasPhoto: boolean;
  isReset: boolean;
};

/**
 * A history list row. Receives primitives only, so memo() actually skips
 * re-renders while the list scrolls (list-perf).
 */
function ReadingRowBase({
  dateIso,
  value,
  delta,
  decimals,
  hasPhoto,
  isReset,
}: Props) {
  const negative = delta < 0 || isReset;
  const badgeColor = negative ? C.alert : C.primary;

  return (
    <View style={styles.row}>
      <Text style={styles.date}>{formatDateShort(dateIso)}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {formatValue(value, decimals)}
      </Text>
      <View style={styles.right}>
        {hasPhoto ? (
          <Camera size={16} color={C.textTertiary} strokeWidth={1.75} />
        ) : null}
        <View style={[styles.badge, { backgroundColor: badgeColor + '1F' }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {isReset ? 'RESET' : formatDelta(delta, decimals)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const ReadingRow = memo(ReadingRowBase);

const styles = StyleSheet.create({
  row: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
  },
  date: {
    ...MONO,
    width: 62,
    fontSize: 13,
    fontWeight: '700',
    color: C.textSecondary,
  },
  value: {
    ...MONO,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: C.textPrimary,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    minWidth: 74,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeText: {
    ...MONO,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
});

export default ReadingRow;
