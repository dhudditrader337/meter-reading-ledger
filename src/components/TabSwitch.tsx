import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from './Chip';
import { CONTENT_W } from '../constants/config';

type Props = {
  tabs: string[];
  index: number;
  onChange: (next: number) => void;
  accent?: string;
};

/** The chip pair used on History and Charts. Widths are computed, not intrinsic. */
export function TabSwitch({ tabs, index, onChange, accent }: Props) {
  const gap = 10;
  const width = Math.floor((CONTENT_W - gap * (tabs.length - 1)) / tabs.length);

  return (
    <View style={styles.row}>
      {tabs.map((tab, i) => (
        <Chip
          key={tab}
          label={tab}
          active={i === index}
          width={width}
          height={40}
          accent={accent}
          onPress={() => onChange(i)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});

export default TabSwitch;
