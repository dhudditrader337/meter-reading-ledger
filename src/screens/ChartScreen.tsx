import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { C, MONO } from '../constants/theme';
import { CONTENT_W } from '../constants/config';
import {
  Meter,
  Reading,
  averageOf,
  monthlySeries,
  yearTotal,
} from '../game/ledger';
import { LedgerSettings } from '../game/seed';
import { MONTH_INITIALS, formatValue } from '../utils/format';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconCell } from '../components/IconCell';
import { TabSwitch } from '../components/TabSwitch';
import { Chip } from '../components/Chip';
import { BentoCard } from '../components/BentoCard';
import { BarChart } from '../components/BarChart';
import { SecondaryButton } from '../components/SecondaryButton';

type Props = {
  meters: Meter[];
  readings: Reading[];
  settings: LedgerSettings;
  activeMeterId: string;
  onSelectMeter: (meterId: string) => void;
  onBack: () => void;
};

const TABS = ['MONTH', 'YEAR'];

/** Monthly Chart + Year Overview. */
export function ChartScreen({
  meters,
  readings,
  settings,
  activeMeterId,
  onSelectMeter,
  onBack,
}: Props) {
  const [tab, setTab] = useState(0);
  const [showGhost, setShowGhost] = useState(true);

  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();

  const meter = useMemo(
    () => meters.find(m => m.id === activeMeterId) ?? meters[0],
    [meters, activeMeterId],
  );

  const series = useMemo(
    () => (meter ? monthlySeries(readings, meter.id, year) : new Array(12).fill(0)),
    [readings, meter, year],
  );

  const ghostSeries = useMemo(
    () => (meter ? monthlySeries(readings, meter.id, year - 1) : null),
    [readings, meter, year],
  );

  const hasGhost = !!ghostSeries && ghostSeries.some(v => v > 0);

  const average = useMemo(() => averageOf(series), [series]);

  const yearRows = useMemo(
    () =>
      meters.map(m => ({
        id: m.id,
        name: m.name,
        unit: m.unit,
        color: m.color,
        total: yearTotal(readings, m.id, year),
        spark: [
          yearTotal(readings, m.id, year - 2),
          yearTotal(readings, m.id, year - 1),
          yearTotal(readings, m.id, year),
        ],
      })),
    [meters, readings, year],
  );

  const chipWidth = Math.floor(
    (CONTENT_W - 10 * (meters.length - 1)) / Math.max(1, meters.length),
  );

  return (
    <ScreenBackground variant="plain">
      <ScreenHeader
        title="CHARTS"
        subtitle={meter ? meter.name : undefined}
        leftSlot={<IconCell onPress={onBack} label="Back" Icon={ChevronLeft} />}
      />

      <View style={styles.body}>
        <View style={styles.meterRow}>
          {meters.map(m => (
            <Chip
              key={m.id}
              label={m.name.slice(0, 5)}
              active={!!meter && m.id === meter.id}
              accent={m.color}
              width={chipWidth}
              height={40}
              onPress={() => onSelectMeter(m.id)}
            />
          ))}
        </View>

        <View style={styles.tabs}>
          <TabSwitch tabs={TABS} index={tab} onChange={setTab} />
        </View>

        {tab === 0 ? (
          <View style={styles.monthBlock}>
            <BentoCard title={'CONSUMPTION · ' + year} style={styles.chartCard}>
              <BarChart
                series={series}
                ghost={showGhost && hasGhost ? ghostSeries : null}
                labels={MONTH_INITIALS}
                accent={meter ? meter.color : C.primary}
                averageLabel={'AVG ' + Math.round(average)}
              />
            </BentoCard>

            {hasGhost ? (
              <View style={styles.legendRow}>
                <View style={styles.legend}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: meter ? meter.color : C.primary },
                    ]}
                  />
                  <Text style={styles.legendText}>THIS YEAR</Text>
                </View>
                {showGhost ? (
                  <View style={styles.legend}>
                    <View
                      style={[styles.legendDot, { backgroundColor: C.textSecondary }]}
                    />
                    <Text style={styles.legendText}>LAST YEAR</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {hasGhost ? (
              <SecondaryButton
                label={showGhost ? 'HIDE LAST YEAR' : 'SHOW LAST YEAR'}
                tone={showGhost ? 'accent' : 'neutral'}
                onPress={() => setShowGhost(current => !current)}
              />
            ) : null}
          </View>
        ) : (
          <View style={styles.yearGrid}>
            {yearRows.map(row => {
              const peak = Math.max(1, ...row.spark);
              return (
                <View key={row.id} style={styles.yearCell}>
                  <View style={[styles.yearStrip, { backgroundColor: row.color }]} />
                  <Text style={styles.yearName} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text style={[styles.yearValue, { color: row.color }]} numberOfLines={1}>
                    {formatValue(Math.round(row.total), 0, settings.numberFormat)}
                  </Text>
                  <Text style={styles.yearUnit}>{row.unit + ' / YEAR'}</Text>
                  <View style={styles.spark}>
                    {row.spark.map((value, index) => (
                      <View
                        key={'sp-' + index}
                        style={[
                          styles.sparkBar,
                          {
                            height: Math.max(3, Math.round((value / peak) * 26)),
                            backgroundColor:
                              index === 2 ? row.color : 'rgba(154,165,180,0.45)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: CONTENT_W,
    alignSelf: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  meterRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  tabs: { marginTop: 10, marginBottom: 12 },
  monthBlock: { gap: 12 },
  chartCard: { width: '100%' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: C.textTertiary,
  },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  yearCell: {
    width: (CONTENT_W - 12) / 2,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  yearStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  yearName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: C.textSecondary,
  },
  yearValue: {
    ...MONO,
    marginTop: 6,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  yearUnit: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: C.textTertiary,
  },
  spark: {
    marginTop: 10,
    height: 26,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  sparkBar: { width: 10, borderRadius: 3 },
});

export default ChartScreen;
