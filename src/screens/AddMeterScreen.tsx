import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, ChevronLeft } from 'lucide-react-native';
import { spriteFor } from '../assets';
import { C } from '../constants/theme';
import {
  COLOR_CHOICES,
  CONTENT_W,
  DECIMAL_CHOICES,
  HIT_SLOP,
  SPRING_PRESS,
  UNIT_CHOICES,
} from '../constants/config';
import { Decimals, Meter, Unit } from '../game/ledger';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconCell } from '../components/IconCell';
import { Chip } from '../components/Chip';
import { MeterTile } from '../components/MeterTile';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  onCancel: () => void;
  onSave: (meter: Omit<Meter, 'id'>) => void;
};

function Swatch({
  color,
  active,
  onPress,
}: {
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92, SPRING_PRESS);
  return (
    <Pressable
      style={styles.cellHit}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={'Colour ' + color}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.swatch,
          { backgroundColor: color, transform: [{ scale }] },
          active ? styles.swatchActive : null,
        ]}
      />
    </Pressable>
  );
}

function SpritePick({
  index,
  active,
  onPress,
}: {
  index: number;
  active: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92, SPRING_PRESS);
  return (
    <Pressable
      style={styles.cellHit}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={'Icon ' + index}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.spriteCell,
          { transform: [{ scale }] },
          active ? styles.spriteCellActive : null,
        ]}
      >
        <Image source={spriteFor(index)} style={styles.spriteImage} />
      </Animated.View>
    </Pressable>
  );
}

/** Add Meter — live preview on top, bento field cards underneath. */
export function AddMeterScreen({ onCancel, onSave }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('kWh');
  const [decimals, setDecimals] = useState<Decimals>(1);
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [sprite, setSprite] = useState<1 | 2 | 3 | 4>(1);

  const previewName = name.trim().length > 0 ? name.trim().toUpperCase() : 'NEW METER';

  const unitWidth = useMemo(
    () => Math.floor((CONTENT_W - 28 - 10 * 3) / 4),
    [],
  );
  const decimalWidth = useMemo(
    () => Math.floor((CONTENT_W - 28 - 10 * 2) / 3),
    [],
  );

  const noop = useCallback(() => {}, []);

  const handleSave = useCallback(() => {
    onSave({
      name: previewName,
      unit,
      decimals,
      color,
      sprite,
    });
  }, [onSave, previewName, unit, decimals, color, sprite]);

  return (
    <ScreenBackground variant="plain">
      <ScreenHeader
        title="ADD METER"
        subtitle="LOCAL ONLY"
        leftSlot={<IconCell onPress={onCancel} label="Back" Icon={ChevronLeft} />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.previewWrap}>
              <MeterTile
                meterId="preview"
                name={previewName}
                color={color}
                sprite={sprite}
                unit={unit}
                decimals={decimals}
                lastValue={undefined}
                perDay={0}
                onPress={noop}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAME</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="KITCHEN GAS"
                placeholderTextColor={C.textTertiary}
                maxLength={18}
                autoCapitalize="characters"
                returnKeyType="done"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>UNIT</Text>
              <View style={styles.chipRow}>
                {UNIT_CHOICES.map(option => (
                  <Chip
                    key={option}
                    label={option}
                    active={unit === option}
                    width={unitWidth}
                    accent={color}
                    onPress={() => setUnit(option)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DECIMALS</Text>
              <View style={styles.chipRow}>
                {DECIMAL_CHOICES.map(option => (
                  <Chip
                    key={option}
                    label={String(option)}
                    active={decimals === option}
                    width={decimalWidth}
                    accent={color}
                    onPress={() => setDecimals(option)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>COLOUR</Text>
              <View style={styles.chipRow}>
                {COLOR_CHOICES.map(option => (
                  <Swatch
                    key={option}
                    color={option}
                    active={color === option}
                    onPress={() => setColor(option)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>ICON</Text>
              <View style={styles.chipRow}>
                {[1, 2, 3, 4].map(option => (
                  <SpritePick
                    key={option}
                    index={option}
                    active={sprite === option}
                    onPress={() => setSprite(option as 1 | 2 | 3 | 4)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <PrimaryButton
              label="SAVE METER"
              Icon={Check}
              height={56}
              onPress={handleSave}
            />
            <SecondaryButton label="CANCEL" onPress={onCancel} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: {
    flex: 1,
    width: CONTENT_W,
    alignSelf: 'center',
    paddingBottom: 16,
  },
  scrollContent: { paddingTop: 14, paddingBottom: 14, gap: 12 },
  previewWrap: { alignSelf: 'center' },
  field: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.6,
    color: C.textTertiary,
    marginBottom: 10,
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.well,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: C.textPrimary,
  },
  chipRow: { flexDirection: 'row', gap: 10 },
  cellHit: { width: 44, height: 44 },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: { borderColor: C.textPrimary },
  spriteCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.well,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spriteCellActive: { borderWidth: 2, borderColor: C.primary },
  spriteImage: { width: 28, height: 28, resizeMode: 'contain' },
  actions: { gap: 10, paddingTop: 12 },
});

export default AddMeterScreen;
