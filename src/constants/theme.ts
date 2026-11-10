/**
 * DARK_PREMIUM preset copy (design-system/preset.ts).
 * Rule #11b: the `name` field stays exactly as in the preset — only the
 * accent colours are overridden to the brief's instrument-panel hexes.
 */

export const theme = {
  name: 'dark-premium',

  colors: {
    bg: {
      primary: '#14181F',
      secondary: '#1C222C',
      tertiary: '#232A35',
      accent: '#2A313D',
    },
    accent: {
      primary: '#7AD151',
      secondary: '#4E8F33',
      warm: '#FFB000',
      cool: '#3FB8E0',
      success: '#7AD151',
    },
    text: {
      primary: '#E6EAF0',
      secondary: '#9AA5B4',
      accent: '#7AD151',
      muted: '#5E6877',
    },
    ui: {
      border: 'rgba(230,234,240,0.08)',
      divider: 'rgba(230,234,240,0.06)',
      overlay: 'rgba(0,0,0,0.30)',
      glass: 'rgba(26,31,40,0.96)',
    },
  },

  gradients: {
    primary: ['#7AD151', '#5FB93C'],
    surface: ['#1C222C', '#232A35'],
    button: ['#7AD151', '#5FB93C'],
    reward: ['#4E8F33', '#7AD151'],
    header: ['#14181F', '#1C222C'],
  },

  typography: {
    hero: { fontSize: 32, fontWeight: '900' as const, letterSpacing: 8 },
    title: { fontSize: 26, fontWeight: '900' as const, letterSpacing: 2.4 },
    subtitle: { fontSize: 14, fontWeight: '800' as const, letterSpacing: 2.2 },
    body: { fontSize: 15, fontWeight: '500' as const, letterSpacing: 0.1 },
    caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.4 },
    micro: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 2.6 },
    button: { fontSize: 17, fontWeight: '900' as const, letterSpacing: 1.6 },
    score: { fontSize: 34, fontWeight: '800' as const, letterSpacing: 0.5 },
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: { sm: 8, md: 12, lg: 16, xl: 20, pill: 100 },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    button: {
      shadowColor: '#7AD151',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 10,
    },
  },

  animation: {
    spring: { tension: 300, friction: 12 },
    bounce: { tension: 160, friction: 9 },
    smooth: { duration: 300 },
    slow: { duration: 500 },
  },
};

/** Flat palette — the instrument-panel colours used across the app. */
export const C = {
  bgBase: '#14181F',
  bgDeep: '#0C1016',
  surface: '#1C222C',
  surfaceRaised: '#232A35',
  surfaceAlt: '#2A313D',
  well: '#11151C',

  border: 'rgba(230,234,240,0.08)',
  borderStrong: 'rgba(230,234,240,0.14)',
  borderSoft: 'rgba(230,234,240,0.06)',
  fill: 'rgba(230,234,240,0.05)',
  fillStrong: 'rgba(230,234,240,0.07)',

  primary: '#7AD151',
  primaryDim: '#4E8F33',
  primaryGlow: 'rgba(122,209,81,0.40)',
  primarySoft: 'rgba(122,209,81,0.12)',

  accent: '#FFB000',
  accentDim: '#B37A00',
  accentSoft: 'rgba(255,176,0,0.12)',

  water: '#3FB8E0',
  heat: '#FF7A45',
  alert: '#FF5C5C',

  textPrimary: '#E6EAF0',
  textSecondary: '#9AA5B4',
  textTertiary: '#5E6877',
  onPrimary: '#0E1A08',
} as const;

/** Monospaced numerals — used for every number in the ledger. */
export const MONO = {
  fontFamily: 'monospace',
  fontVariant: ['tabular-nums' as const],
};

export default theme;
