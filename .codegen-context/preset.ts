export const DARK_PREMIUM = {
  name: 'dark-premium',

  colors: {
    bg: {
      primary: '#111114',
      secondary: '#18181C',
      tertiary: '#1F1F24',
      accent: '#252530',
    },
    accent: {
      primary: '#6C5CE7',       // muted purple
      secondary: '#A29BFE',
      warm: '#FD79A8',
      cool: '#74B9FF',
      success: '#55EFC4',
    },
    text: {
      primary: '#EEEEF0',
      secondary: '#7F7F8C',
      accent: '#A29BFE',
      muted: '#4A4A55',
    },
    ui: {
      border: '#2C2C34',
      divider: '#222228',
      overlay: 'rgba(0, 0, 0, 0.6)',
      glass: 'rgba(24, 24, 28, 0.9)',
    },
  },

  gradients: {
    primary: ['#6C5CE7', '#A29BFE'],
    surface: ['#18181C', '#1F1F24'],
    button: ['#6C5CE7', '#7C6CF7'],
    reward: ['#55EFC4', '#00B894'],
    header: ['#111114', '#18181C'],
  },

  typography: {
    hero: { fontSize: 40, fontWeight: '700' as const, letterSpacing: -1 },
    title: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
    subtitle: { fontSize: 16, fontWeight: '500' as const, letterSpacing: 0 },
    body: { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0.1 },
    caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
    button: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.5 },
    score: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 100,
  },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    button: {
      shadowColor: '#6C5CE7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  animation: {
    spring: { tension: 100, friction: 10 },
    bounce: { tension: 120, friction: 9 },
    smooth: { duration: 300 },
    slow: { duration: 500 },
  },
};

// ============================================================
// TROPICAL — vivid colours, energy, summer
// ============================================================
