export const COLORS = {
  primary: '#E91E63', // Deep Pink/Red for SOS
  secondary: '#673AB7', // Purple for trust
  background: '#0F172A', // Slate 900 for dark mode
  surface: '#1E293B', // Slate 800 for cards
  text: '#F8FAFC', // Slate 50 for text
  textSecondary: '#94A3B8', // Slate 400 for secondary text
  success: '#10B981', // Emerald 500 for "Safe" status
  error: '#EF4444', // Red 500 for alerts
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SIZES = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 12,
  sosButton: 200,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};
