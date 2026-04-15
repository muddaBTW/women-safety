export const COLORS = {
  primary: '#FF3B6F',
  primaryLight: '#FF6B9D',
  primaryDark: '#D42A5A',
  secondary: '#7C5CFC',
  secondaryLight: '#9B82FF',
  background: '#0A0E1A',
  surface: '#141A2E',
  surfaceLight: '#1C2440',
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.12)',
  text: '#F0F2F5',
  textSecondary: '#6B7A99',
  textMuted: '#4A5568',
  success: '#00D68F',
  successLight: '#00FFB2',
  error: '#FF4757',
  errorLight: '#FF6B7A',
  warning: '#FFB800',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  gradient: {
    primary: ['#FF3B6F', '#FF6B9D'],
    dark: ['#0A0E1A', '#141A2E'],
    card: ['rgba(20,26,46,0.8)', 'rgba(28,36,64,0.6)'],
  },
  overlay: 'rgba(10,14,26,0.85)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const SIZES = {
  h1: 34,
  h2: 26,
  h3: 20,
  body: 15,
  caption: 12,
  tiny: 10,
  sosButton: 180,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  glow: {
    shadowColor: '#FF3B6F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  successGlow: {
    shadowColor: '#00D68F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};
