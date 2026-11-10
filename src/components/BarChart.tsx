import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { C, MONO } from '../constants/theme';
import {
  BAR_AREA_H,
  BAR_GAP,
  BAR_GROW_MS,
  BAR_STAGGER_MS,
  BAR_W,
} from '../constants/config';
import { averageOf } from '../game/ledger';

type Props = {
  series: number[];
  ghost?: number[] | null;
  labels: string[];
  accent: string;
  /** Shown beside the average line, already formatted. */
  averageLabel: string;
};

const VERTICAL = { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } };

/**
 * 12 animated bars. `height` cannot run on the native driver
 * (animation-gpu-properties), so these timings explicitly use
 * useNativeDriver:false — the ghost series fades with opacity on the UI thread.
 */
export function BarChart({ series, ghost, labels, accent, averageLabel }: Props) {
  const grow = useRef(series.map(() => new Animated.Value(0))).current;
  const ghostFade = useRef(new Animated.Value(0)).current;

  const peak = useMemo(() => {
    const all = ghost ? series.concat(ghost) : series;
    return Math.max(1, ...all);
  }, [series, ghost]);

  const average = useMemo(() => averageOf(series), [series]);

  const signature = series.join(',');

  useEffect(() => {
    grow.forEach(v => v.setValue(0));
    ghostFade.setValue(0);
    const bars = Animated.stagger(
      BAR_STAGGER_MS,
      grow.map(v =>
        Animated.timing(v, {
          toValue: 1,
          duration: BAR_GROW_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ),
    );
    const fade = Animated.timing(ghostFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    const anim = Animated.sequence([bars, fade]);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [signature, grow, ghostFade]);

  const avgBottom = Math.round((average / peak) * BAR_AREA_H);

  return (
    <View>
      <View style={[styles.plot, { height: BAR_AREA_H }]}>
        {average > 0 ? (
          <View pointerEvents="none" style={[styles.avgLine, { bottom: avgBottom }]}>
            <View style={styles.avgRule} />
            <Text style={styles.avgLabel}>{averageLabel}</Text>
          </View>
        ) : null}

        <View style={styles.bars}>
          {series.map((value, index) => {
            const target = Math.max(3, Math.round((value / peak) * BAR_AREA_H));
            const ghostValue = ghost ? ghost[index] ?? 0 : 0;
            const ghostH = Math.max(3, Math.round((ghostValue / peak) * BAR_AREA_H));
            return (
              <View key={'bar-' + index} style={styles.barSlot}>
                {ghost ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.ghostBar,
                      { height: ghostH, opacity: Animated.multiply(ghostFade, 0.28) },
                    ]}
                  />
                ) : null}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.barWrap,
                    {
                      height: grow[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, target],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[accent, C.primaryDim]}
                    start={VERTICAL.start}
                    end={VERTICAL.end}
                    style={styles.barFill}
                  />
                </Animated.View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.axis}>
        {labels.map((label, index) => (
          <Text key={'ax-' + index} style={styles.axisLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: { justifyContent: 'flex-end' },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: BAR_GAP,
  },
  barSlot: { width: BAR_W, justifyContent: 'flex-end' },
  barWrap: { width: BAR_W, borderRadius: 4, overflow: 'hidden' },
  barFill: { flex: 1, width: '100%' },
  ghostBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: BAR_W,
    borderRadius: 4,
    backgroundColor: C.textSecondary,
  },
  avgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avgRule: { flex: 1, height: 1, backgroundColor: 'rgba(255,176,0,0.55)' },
  avgLabel: {
    ...MONO,
    marginLeft: 6,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: C.accent,
  },
  axis: {
    marginTop: 8,
    flexDirection: 'row',
    gap: BAR_GAP,
  },
  axisLabel: {
    width: BAR_W,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: C.textTertiary,
  },
});

export default BarChart;
