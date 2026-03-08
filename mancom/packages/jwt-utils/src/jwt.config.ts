/**
 * Configuration options for the JWT service.
 */
export interface JwtConfig {
  /** Path to the RSA private key file (PEM format) */
  privateKeyPath: string;

  /** Path to the RSA public key file (PEM format) */
  publicKeyPath: string;

  /** Access token expiry (e.g., '15m', '1h') */
  accessTokenExpiry: string;

  /** Refresh token expiry (e.g., '7d', '30d') */
  refreshTokenExpiry: string;

  /** Token issuer claim */
  issuer: string;

  /** Token audience claim */
  audience: string;
}

/**
 * Default JWT configuration values.
 * Override these via environment variables.
 */
export const DEFAULT_JWT_CONFIG: Partial<JwtConfig> = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'mancom-auth',
  audience: 'mancom-services',
};
