import { Platform } from 'react-native';

export const COLORS = {
  // Neo-Noir Palette
  primary: '#FF0040',        // Electric Crimson (SOS)
  primaryLight: '#FF3366',
  primaryDark: '#B3002D',
  
  secondary: '#8A2BE2',      // Electric Violet (Tools)
  secondaryLight: '#A020F0',
  secondaryDark: '#4B0082',

  accent: '#00F5FF',         // Cyber Cyan (Feedback)
  
  background: '#000000',     // Pitch Black
  surface: '#0A0A0A',        // Onyx Surface
  surfaceLight: '#121212',   // Elevated Onyx
  
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  
  text: '#FFFFFF',           // High Contrast White
  textSecondary: '#8E8E93',  // Apple-style Muted Grey
  textMuted: '#48484A',      // Dark Muted
  
  success: '#30D158',        // Apple Success Green
  error: '#FF453A',
  warning: '#FFD60A',
  
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  glass: 'rgba(255, 255, 255, 0.03)',
  overlay: 'rgba(0, 0, 0, 0.9)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 56,
};

export const SIZES = {
  h1: 36,
  h2: 24,
  h3: 18,
  body: 16,
  caption: 13,
  tiny: 11,
  sosButton: 200,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 30,
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
  neon: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  glow: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  soft: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    android: { elevation: 4 },
    web: { boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
  }),
};
