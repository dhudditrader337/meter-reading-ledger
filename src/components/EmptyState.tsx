import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { C } from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  title: string;
  hint?: string;
};

export function EmptyState({ Icon, title, hint }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Icon size={32} color={C.textTertiary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36 },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.fill,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: C.textSecondary,
  },
  hint: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: C.textTertiary,
    textAlign: 'center',
  },
});

export default EmptyState;
