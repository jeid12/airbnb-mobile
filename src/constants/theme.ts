export const Colors = {
  // ── New flat Airbnb tokens ────────────────────────────────────────────────
  brand: '#FF385C',
  brandDark: '#E31C5F',
  text: '#222222',
  textSecondary: '#717171',
  textLight: '#AAAAAA',
  border: '#DDDDDD',
  borderLight: '#EEEEEE',
  white: '#FFFFFF',
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7F7',
  backgroundDark: '#222222',
  success: '#008A05',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.45)',
  black: '#000000',

  // ── Backward-compat nested tokens (legacy components only) ───────────────
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

/** @deprecated Use Colors directly */
export type ThemeColor = keyof typeof Colors.light;

export const Spacing = {
  // ── New semantic keys ─────────────────────────────────────────────────────
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // ── Backward-compat numeric keys (legacy components only) ─────────────────
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
  xxxl: 32,
} as const;

// ── Backward-compat constants ─────────────────────────────────────────────────
export const MaxContentWidth = 800;
export const BottomTabInset = 0;

import { Platform } from 'react-native';
/** @deprecated Prefer system fonts or a font-loading library */
export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'system-ui', serif: 'serif', rounded: 'normal', mono: 'monospace' },
});

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
