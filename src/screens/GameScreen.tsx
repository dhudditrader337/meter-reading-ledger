import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { Camera, Check, ChevronLeft } from 'lucide-react-native';
import { assets } from '../assets';
import { C } from '../constants/theme';
import {
  CELL_H,
  CELL_W,
  COMPACT,
  CONTENT_W,
  DISPLAY_H,
  GAP_V,
  HIT_SLOP,
  INT_CELLS,
  PHOTO_ROW_H,
  SAVED_FLASH_MS,
  SAVING_MS,
  SPRING_PRESS,
} from '../constants/config';
import {
  Meter,
  Reading,
  computeDelta,
  daysBetween,
  lastReading,
  perDay,
} from '../game/ledger';
import { LedgerSettings } from '../game/seed';
import { formatDelta, formatValue } from '../utils/format';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconCell } from '../components/IconCell';
import { OdometerReadout } from '../components/OdometerReadout';
import { StatRow } from '../components/StatCard';
import { Keypad } from '../components/Keypad';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  meter: Meter;
  readings: Reading[];
  settings: LedgerSettings;
  onBack: () => void;
  onCancel: () => void;
  onSave: (value: number, isReset: boolean, hasPhoto: boolean) => void;
};

type EntryStatus = 'idle' | 'typing' | 'invalid' | 'saving' | 'saved';

function PhotoRow({
  attached,
  onPress,
}: {
  attached: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97, SPRING_PRESS);
  return (
    <Pressable
      style={styles.photoHit}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected: attached }}
      accessibilityLabel={attached ? 'Dial photo attached' : 'Attach dial photo'}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.photoCard, { transform: [{ scale }] }]}
      >
        <View style={styles.photoBadge}>
          {attached ? (
            <Image source={assets.sprite5} style={styles.photoThumb} />
          ) : (
            <Camera size={24} color={C.textSecondary} strokeWidth={1.75} />
          )}
        </View>
        <Text
          style={[
            styles.photoLabel,
            { color: attached ? C.primary : C.textSecondary },
          ]}
        >
          {attached ? 'PHOTO ATTACHED' : 'ATTACH DIAL PHOTO'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * New Reading — G3 Split Panel. Header / GameArea(flex:1) / Controls, no
 * ScrollView wrapper (rule #3). Every number in the strip recomputes live from
 * the keypad buffer.
 */
export function GameScreen({
  meter,
  readings,
  settings,
  onBack,
  onCancel,
  onSave,
}: Props) {
  const [buffer, setBuffer] = useState('');
  const [status, setStatus] = useState<EntryStatus>('idle');
  const [acceptReset, setAcceptReset] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);

  // Data read inside timer callbacks lives in refs, never in state (rule #8).
  const bufferRef = useRef(buffer);
  bufferRef.current = buffer;
  const resetRef = useRef(acceptReset);
  resetRef.current = acceptReset;
  const photoRef = useRef(hasPhoto);
  photoRef.current = hasPhoto;
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.length = 0;
    };
  }, []);

  const previous = useMemo(
    () => lastReading(readings, meter.id),
    [readings, meter.id],
  );

  const typed = buffer.length > 0;
  const entered = typed ? parseFloat(buffer) || 0 : 0;
  const belowPrevious =
    typed && previous !== undefined && entered < previous.value;
  const isReset = belowPrevious && acceptReset;

  const nowIso = useMemo(() => new Date().toISOString(), []);
  const days = previous ? daysBetween(previous.dateIso, nowIso) : 1;
  const delta = typed
    ? computeDelta(entered, previous?.value, isReset)
    : 0;
  const daily = perDay(delta, days);

  const digitColor =
    belowPrevious && !acceptReset ? C.alert : meter.color;

  const statItems = useMemo(() => {
    if (!previous) {
      return [];
    }
    return [
      {
        value: formatValue(previous.value, meter.decimals, settings.numberFormat),
        label: 'PREVIOUS',
        valueColor: C.textSecondary,
      },
      {
        value: typed ? formatDelta(delta, meter.decimals, settings.numberFormat) : '',
        label: 'DIFFERENCE',
        valueColor: delta < 0 ? C.alert : C.primary,
      },
      {
        value: typed ? formatDelta(daily, meter.decimals, settings.numberFormat) : '',
        label: 'PER DAY',
        valueColor: C.accent,
      },
    ];
  }, [previous, meter.decimals, settings.numberFormat, typed, delta, daily]);

  const onDigit = useCallback(
    (digit: string) => {
      Vibration.vibrate(10);
      setBuffer(current => {
        const [intPart = '', decPart] = current.split('.');
        if (decPart !== undefined) {
          if (decPart.length >= meter.decimals) {
            return current;
          }
          return intPart + '.' + decPart + digit;
        }
        if (intPart.length >= INT_CELLS) {
          return current;
        }
        return intPart + digit;
      });
      setStatus('typing');
    },
    [meter.decimals],
  );

  const onDot = useCallback(() => {
    if (meter.decimals === 0) {
      return;
    }
    Vibration.vibrate(10);
    setBuffer(current =>
      current.indexOf('.') >= 0 ? current : (current || '0') + '.',
    );
    setStatus('typing');
  }, [meter.decimals]);

  const onBackspace = useCallback(() => {
    Vibration.vibrate(10);
    setBuffer(current => {
      const next = current.slice(0, -1);
      if (next.length === 0) {
        setStatus('idle');
        setAcceptReset(false);
      }
      return next;
    });
  }, []);

  const onTogglePhoto = useCallback(() => {
    Vibration.vibrate(10);
    setHasPhoto(current => !current);
  }, []);

  const handleSave = useCallback(() => {
    if (!typed || status === 'saving' || status === 'saved') {
      return;
    }
    Vibration.vibrate(24);
    setStatus('saving');
    const toSaving = setTimeout(() => {
      setStatus('saved');
      const toDone = setTimeout(() => {
        const value = parseFloat(bufferRef.current) || 0;
        saveRef.current(value, resetRef.current, photoRef.current);
      }, SAVED_FLASH_MS);
      timers.current.push(toDone);
    }, SAVING_MS);
    timers.current.push(toSaving);
  }, [typed, status]);

  const keypadDim = status === 'saving' || status === 'saved';

  return (
    <ScreenBackground variant="game" glow={meter.color}>
      <ScreenHeader
        title={meter.name}
        subtitle={meter.unit + ' · ' + meter.decimals + ' DECIMAL'}
        leftSlot={
          <IconCell onPress={onBack} label="Back" Icon={ChevronLeft} />
        }
        rightSlot={
          <IconCell
            onPress={onCancel}
            label="Cancel entry"
            image={assets.iconPause}
          />
        }
      />

      <View style={styles.gameArea}>
        <View style={[styles.display, { height: DISPLAY_H }]}>
          <View style={styles.displayInset} />
          <Text style={styles.displayCaption}>
            {typed ? 'ENTER NEW VALUE' : 'PREVIOUS VALUE'}
          </Text>
          <OdometerReadout
            buffer={typed ? buffer : undefined}
            value={previous ? previous.value : 0}
            decimals={meter.decimals}
            intCells={INT_CELLS}
            color={digitColor}
            ghost={!typed}
            cellW={CELL_W}
            cellH={CELL_H}
            fontSize={Math.round(CELL_W * 0.72)}
            rollKey={status === 'saved' ? 'saved' : 'entry'}
          />
        </View>

        {statItems.length > 0 ? (
          <View style={styles.strip}>
            <StatRow items={statItems} />
          </View>
        ) : null}

        {belowPrevious && !acceptReset ? (
          <Text style={styles.warning}>
            LOWER THAN PREVIOUS - SAVE AS A METER RESET?
          </Text>
        ) : null}

        <PhotoRow attached={hasPhoto} onPress={onTogglePhoto} />
      </View>

      <View style={styles.controls}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.keypadWrap, keypadDim ? styles.dimmed : null]}
        >
          <Keypad
            onDigit={onDigit}
            onDot={onDot}
            onBackspace={onBackspace}
            disabled={keypadDim}
            allowDot={meter.decimals > 0}
          />
        </Animated.View>

        {belowPrevious && !acceptReset ? (
          <View style={styles.ctaRow}>
            <View style={styles.ctaSlot}>
              <SecondaryButton
                label="KEEP EDITING"
                onPress={onBackspace}
              />
            </View>
            <View style={styles.ctaSlot}>
              <SecondaryButton
                label="METER RESET"
                tone="alert"
                onPress={() => setAcceptReset(true)}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.ctaWrap}>
          <PrimaryButton
            label="SAVE READING"
            Icon={Check}
            disabled={!typed || keypadDim}
            onPress={handleSave}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  gameArea: {
    flex: 1,
    width: CONTENT_W,
    alignSelf: 'center',
    justifyContent: 'space-evenly',
    gap: GAP_V,
  },
  display: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: 'rgba(230,234,240,0.09)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  displayInset: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  displayCaption: {
    marginBottom: 10,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.6,
    color: C.textTertiary,
  },
  strip: { width: '100%' },
  warning: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: C.alert,
  },
  // flexShrink lets the photo row absorb any residual squeeze on a tiny
  // viewport instead of pushing the odometer panel off-screen.
  photoHit: { width: '100%', height: PHOTO_ROW_H, flexShrink: 1 },
  photoCard: {
    width: '100%',
    height: PHOTO_ROW_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: C.fill,
    borderWidth: 1,
    borderColor: C.border,
  },
  photoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.well,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoThumb: { width: 30, height: 30, resizeMode: 'contain' },
  photoLabel: {
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  controls: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(26,31,40,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(230,234,240,0.09)',
    paddingTop: COMPACT ? 10 : 14,
    paddingBottom: COMPACT ? 14 : 18,
    paddingHorizontal: 16,
  },
  keypadWrap: { width: '100%' },
  dimmed: { opacity: 0.4 },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  ctaSlot: { flex: 1 },
  ctaWrap: { marginTop: 14, width: CONTENT_W, alignSelf: 'center' },
});

export default GameScreen;
