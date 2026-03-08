import * as fs from 'fs';

import { JwtPayload } from '@mancom/common';
import * as jwt from 'jsonwebtoken';

import { JwtConfig, DEFAULT_JWT_CONFIG } from './jwt.config';

/**
 * User data required to generate a token pair.
 */
export interface TokenUserData {
  id: string;
  email: string;
  name: string;
  roles: string[];
  societyId: string;
  flatId?: string;
}

/**
 * Token pair returned after successful authentication.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT service for signing and verifying tokens using RS256.
 *
 * Uses asymmetric cryptography:
 * - Private key: Used only by auth-service to sign tokens
 * - Public key: Used by all services to verify tokens
 */
export class JwtService {
  private readonly privateKey: string | null;
  private readonly publicKey: string;
  private readonly config: JwtConfig;

  constructor(config: Partial<JwtConfig> & Pick<JwtConfig, 'privateKeyPath' | 'publicKeyPath'>) {
    this.config = { ...DEFAULT_JWT_CONFIG, ...config } as JwtConfig;

    // Public key is always required for verification
    this.publicKey = fs.readFileSync(this.config.publicKeyPath, 'utf8');

    // Private key is optional (only needed for signing)
    try {
      this.privateKey = fs.readFileSync(this.config.privateKeyPath, 'utf8');
    } catch {
      this.privateKey = null;
    }
  }

  /**
   * Generates an access and refresh token pair.
   * Requires private key to be available.
   */
  generateTokenPair(user: TokenUserData): TokenPair {
    if (!this.privateKey) {
      throw new Error('Private key not available. Cannot sign tokens.');
    }

    const accessToken = this.signToken(user, 'access', this.config.accessTokenExpiry);
    const refreshToken = this.signToken(user, 'refresh', this.config.refreshTokenExpiry);

    // Calculate expiry in seconds
    const expiresIn = this.parseExpiryToSeconds(this.config.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verifies an access token and returns the payload.
   * Throws if token is invalid, expired, or not an access token.
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const payload = this.verifyToken(token);

    if (payload.type !== 'access') {
      throw new Error('Invalid token type. Expected access token.');
    }

    return payload;
  }

  /**
   * Verifies a refresh token and returns the payload.
   * Throws if token is invalid, expired, or not a refresh token.
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const payload = this.verifyToken(token);

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type. Expected refresh token.');
    }

    return payload;
  }

  private signToken(user: TokenUserData, type: 'access' | 'refresh', expiresIn: string): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      societyId: user.societyId,
      flatId: user.flatId,
      type,
    };

    return jwt.sign(payload, this.privateKey as jwt.Secret, {
      algorithm: 'RS256',
      expiresIn: expiresIn as any,
      issuer: this.config.issuer,
      audience: this.config.audience,
    });
  }

  private verifyToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as JwtPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * multipliers[unit];
  }
}
