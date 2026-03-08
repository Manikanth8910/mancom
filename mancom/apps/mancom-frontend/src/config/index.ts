/**
 * Application configuration
 * All environment-specific settings should be defined here
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: __DEV__ ? 'http://localhost:3000/api/v1' : 'https://api.mancom.app/api/v1',
    timeout: 30000,
  },

  // App Info
  app: {
    name: 'Mancom',
    version: '1.0.0',
  },

  // Feature Flags (for gradual rollouts)
  features: {
    enableBiometricAuth: false,
  },
} as const;

export type Config = typeof config;
