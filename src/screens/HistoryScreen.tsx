import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ImageOff, Plus } from 'lucide-react-native';
import { assets } from '../assets';
import { C, MONO } from '../constants/theme';
import { CONTENT_W, PHOTO_CELL, PHOTO_GAP } from '../constants/config';
import { Meter, Reading, deltaOf, readingsForMeter } from '../game/ledger';
import { formatDateShort } from '../utils/format';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconCell } from '../components/IconCell';
import { TabSwitch } from '../components/TabSwitch';
import { Chip } from '../components/Chip';
import { ReadingRow } from '../components/ReadingRow';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = {
  meters: Meter[];
  readings: Reading[];
  activeMeterId: string;
  onSelectMeter: (meterId: string) => void;
  onBack: () => void;
  onAddReading: () => void;
};

type Row = {
  id: string;
  dateIso: string;
  value: number;
  delta: number;
  hasPhoto: boolean;
  isReset: boolean;
};

const TABS = ['READINGS', 'PHOTOS'];

/** Meter History + Photo Archive. */
export function HistoryScreen({
  meters,
  readings,
  activeMeterId,
  onSelectMeter,
  onBack,
  onAddReading,
}: Props) {
  const [tab, setTab] = useState(0);

  const meter = useMemo(
    () => meters.find(m => m.id === activeMeterId) ?? meters[0],
    [meters, activeMeterId],
  );

  const rows = useMemo<Row[]>(() => {
    if (!meter) {
      return [];
    }
    return readingsForMeter(readings, meter.id).map(reading => ({
      id: reading.id,
      dateIso: reading.dateIso,
      value: reading.value,
      delta: deltaOf(readings, reading),
      hasPhoto: reading.hasPhoto,
      isReset: reading.isReset,
    }));
  }, [readings, meter]);

  const photos = useMemo(() => rows.filter(row => row.hasPhoto), [rows]);

  const decimals = meter ? meter.decimals : 0;

  const keyExtractor = useCallback((item: Row) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <ReadingRow
        dateIso={item.dateIso}
        value={item.value}
        delta={item.delta}
        decimals={decimals}
        hasPhoto={item.hasPhoto}
        isReset={item.isReset}
      />
    ),
    [decimals],
  );

  const chipWidth = Math.floor((CONTENT_W - 10 * (meters.length - 1)) / Math.max(1, meters.length));

  return (
    <ScreenBackground variant="plain">
      <ScreenHeader
        title="HISTORY"
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

        <View style={styles.panel}>
          {tab === 0 ? (
            rows.length > 0 ? (
              <FlatList
                data={rows}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <EmptyState
                Icon={ImageOff}
                title="NO READINGS YET"
                hint="LOG A VALUE TO START THE LEDGER"
              />
            )
          ) : photos.length > 0 ? (
            <View style={styles.photoGrid}>
              {photos.map(photo => (
                <View key={photo.id} style={styles.photoSlot}>
                  <View style={styles.photoCell}>
                    <Image source={assets.sprite5} style={styles.photoImage} />
                  </View>
                  <Text style={styles.photoDate}>
                    {formatDateShort(photo.dateIso)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              Icon={ImageOff}
              title="NO DIAL PHOTOS YET"
              hint="ATTACH A PHOTO WHILE LOGGING A READING"
            />
          )}
        </View>

        <PrimaryButton
          label="ADD READING"
          Icon={Plus}
          height={56}
          onPress={onAddReading}
        />
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
  panel: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PHOTO_GAP,
    padding: 14,
  },
  photoSlot: { width: PHOTO_CELL - 10, alignItems: 'center' },
  photoCell: {
    width: PHOTO_CELL - 10,
    height: PHOTO_CELL - 10,
    borderRadius: 14,
    backgroundColor: C.surfaceRaised,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: PHOTO_CELL - 36, height: PHOTO_CELL - 36, resizeMode: 'contain' },
  photoDate: {
    ...MONO,
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    color: C.textTertiary,
  },
});

export default HistoryScreen;
