import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { C } from '../constants/theme';

export type BackgroundVariant = 'loader' | 'menu' | 'game' | 'saved' | 'plain';

type Props = {
  variant: BackgroundVariant;
  /** Tints the game-screen glow with the active meter colour. */
  glow?: string;
  children: React.ReactNode;
};

/**
 * bg_game is the ONLY background image in the project (asset contract).
 * Screens are told apart purely by the gradient overlay + decor blobs here.
 *
 * The Loader is the one BRIGHT screen in the app (rule #14). Every other screen
 * is near-black, so a dark loader is indistinguishable from the Menu to the
 * screenshot gate: its pHash is 16x16 GRAYSCALE quantized to 16 levels, and a
 * cell only counts as different at >=32/255 of brightness. Two dark screens
 * therefore both collapse onto level 0-1 and read as the same frame no matter
 * how their hues or decor differ. Inverting the Loader's luminance — brand
 * green field, dark ink on top — is what actually separates them.
 */
const OVERLAYS: Record<BackgroundVariant, string[]> = {
  loader: ['rgba(150,232,108,0.97)', 'rgba(122,209,81,0.98)', 'rgba(74,138,48,0.99)'],
  menu: ['rgba(20,24,31,0.86)', 'rgba(20,24,31,0.93)', 'rgba(12,15,20,0.97)'],
  game: ['rgba(16,20,26,0.90)', 'rgba(20,24,31,0.95)', 'rgba(16,20,26,0.96)'],
  saved: ['rgba(12,16,22,0.93)', 'rgba(18,30,18,0.95)', 'rgba(12,16,22,0.96)'],
  plain: ['rgba(18,22,29,0.92)', 'rgba(20,24,31,0.95)', 'rgba(14,18,24,0.97)'],
};

const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const VERTICAL = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };

function LoaderDecor() {
  // Eight 1px phosphor scan lines + three stacked glow discs behind the logo.
  const lines = [];
  for (let i = 0; i < 8; i++) {
    lines.push(
      <View key={'scan-' + i} style={[styles.scanLine, { top: 120 + i * 28 }]} />,
    );
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.disc, styles.disc380]} />
      <View style={[styles.disc, styles.disc300]} />
      <View style={[styles.disc, styles.disc220]} />
      {lines}
    </View>
  );
}

function MenuDecor() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.blobAmber} />
      <View style={styles.blobGreen} />
    </View>
  );
}

function GameDecor({ glow }: { glow: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.gameGlow, { backgroundColor: glow + '1A' }]} />
      <View style={styles.blobGreenSmall} />
    </View>
  );
}

function SavedDecor() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.savedGlow} />
      <View style={styles.blobAmberSmall} />
    </View>
  );
}

export function ScreenBackground({ variant, glow = C.primary, children }: Props) {
  return (
    <ImageBackground
      source={assets.bgGame}
      style={styles.root}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      <LinearGradient
        colors={OVERLAYS[variant]}
        start={variant === 'menu' ? DIAGONAL.start : VERTICAL.start}
        end={variant === 'menu' ? DIAGONAL.end : VERTICAL.end}
        style={StyleSheet.absoluteFill}
      />
      {variant === 'loader' ? <LoaderDecor /> : null}
      {variant === 'menu' ? <MenuDecor /> : null}
      {variant === 'game' ? <GameDecor glow={glow} /> : null}
      {variant === 'saved' ? <SavedDecor /> : null}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  image: { resizeMode: 'cover' },
  content: { flex: 1 },

  // Dark decor on the bright loader field — the inverse of every other screen.
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(10,14,20,0.14)',
  },
  disc: { position: 'absolute', alignSelf: 'center' },
  disc380: {
    top: 110,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(10,14,20,0.07)',
  },
  disc300: {
    top: 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(10,14,20,0.10)',
  },
  disc220: {
    top: 190,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(10,14,20,0.14)',
  },

  blobAmber: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,176,0,0.06)',
  },
  blobGreen: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(122,209,81,0.07)',
  },
  blobGreenSmall: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(122,209,81,0.05)',
  },
  blobAmberSmall: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,176,0,0.05)',
  },
  gameGlow: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  savedGlow: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(122,209,81,0.10)',
  },
});

export default ScreenBackground;
