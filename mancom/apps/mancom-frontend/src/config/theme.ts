/**
 * Theme configuration
 * Black and white wireframe theme for boilerplate
 * Replace with actual brand colors when designing the app
 */

export const theme = {
  colors: {
    primary: '#6C47FF',
    primaryLight: '#EDE9FF',
    accent: '#00C48C',
    warning: '#FFAB00',
    background: '#F7F8FC',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#94A3B8',
      inverse: '#FFFFFF',
    },
    border: '#E5E7EB',
    error: '#FF4D4F',
    success: '#00C48C',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12, // buttons
    lg: 16, // cards
    xl: 24, // modals
    xxl: 28, // large sheet
    full: 9999,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 26, // large headings
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export type Theme = typeof theme;
