import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { C } from '../constants/theme';
import { LOADER_DURATION_MS } from '../constants/config';
import { ScreenBackground } from '../components/ScreenBackground';
import { OdometerReadout } from '../components/OdometerReadout';

type Props = {
  onDone: () => void;
};

const TEASE_VALUE = 48317;
const PROGRESS_W = 190;
const HORIZONTAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };

/**
 * Splash. The one BRIGHT screen in the app — dark ink on the brand-green field
 * of ScreenBackground's `loader` variant — with no tiles and no CTA, so it can
 * never read as the Menu (rule #14). The inverted luminance, not the hue, is
 * what separates it: see the note on OVERLAYS in ScreenBackground.tsx.
 * Runs for exactly LOADER_DURATION_MS = 8000 (rule #13).
 */
export function LoaderScreen({ onDone }: Props) {
  const logoIn = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.84)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const subtitleIn = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const [teaseValue, setTeaseValue] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const entry = Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(logoIn, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 52,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.timing(titleIn, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    entry.start();

    // The progress bar animates `width`, so it must stay on the JS driver.
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    bar.start();

    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();

    const teaseTimer = setTimeout(() => setTeaseValue(TEASE_VALUE), 1100);
    const subtitleTimer = setTimeout(() => {
      Animated.timing(subtitleIn, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 1500);
    const doneTimer = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);

    return () => {
      entry.stop();
      bar.stop();
      blink.stop();
      clearTimeout(teaseTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(doneTimer);
    };
  }, [logoIn, logoScale, titleIn, subtitleIn, progress, pulse]);

  const titleStyle = {
    opacity: titleIn,
    transform: [
      {
        translateY: titleIn.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  return (
    <ScreenBackground variant="loader">
      <View style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.logoWrap,
            { opacity: logoIn, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image source={assets.logo} style={styles.logo} />
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.titleBlock, titleStyle]}>
          <Text style={styles.titleTop}>METER READING</Text>
          <Text style={styles.titleBottom}>LEDGER</Text>
        </Animated.View>

        <View style={styles.odometer}>
          <OdometerReadout
            value={teaseValue}
            decimals={0}
            intCells={6}
            size="lg"
            color={C.primary}
            rollKey={teaseValue}
          />
        </View>

        <Animated.Text
          style={[styles.subtitle, { opacity: subtitleIn }]}
          numberOfLines={1}
        >
          LOCAL ONLY · NO ACCOUNT NEEDED
        </Animated.Text>

        <View style={styles.progressTrack}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.progressFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, PROGRESS_W],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['#0B0F14', '#14181F', '#FFB000']}
              start={HORIZONTAL.start}
              end={HORIZONTAL.end}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.loading, { opacity: pulse }]}>
          LOADING…
        </Animated.Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { marginBottom: 26 },
  logo: { width: 132, height: 132, resizeMode: 'contain' },
  titleBlock: { alignItems: 'center', marginBottom: 30 },
  titleTop: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    color: 'rgba(11,15,20,0.80)',
  },
  titleBottom: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#0B0F14',
    textShadowColor: 'rgba(255,255,255,0.40)',
    textShadowRadius: 14,
  },
  odometer: { marginBottom: 26 },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.2,
    color: 'rgba(11,15,20,0.72)',
    marginBottom: 30,
  },
  progressTrack: {
    width: PROGRESS_W,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(11,15,20,0.22)',
    overflow: 'hidden',
  },
  progressFill: { height: 3, borderRadius: 2, overflow: 'hidden' },
  progressGradient: { flex: 1, width: '100%' },
  loading: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: 'rgba(11,15,20,0.66)',
  },
});

export default LoaderScreen;
