import { Injectable, OnModuleDestroy } from '@nestjs/common';

/**
 * Service for storing and managing refresh tokens.
 * Uses Redis for distributed token storage and invalidation.
 */
@Injectable()
export class TokenStoreService implements OnModuleDestroy {
  // Using an in-memory map instead of Redis for mocked local environment
  private readonly store = new Map<string, string>();
  private readonly TOKEN_PREFIX = 'refresh_token:';

  constructor() { }

  async onModuleDestroy() {
    this.store.clear();
  }

  /**
   * Stores a refresh token for a user.
   */
  async storeRefreshToken(userId: string, tokenId: string): Promise<void> {
    const key = this.buildKey(userId, tokenId);
    this.store.set(key, 'valid');
  }

  /**
   * Checks if a refresh token is valid (not revoked).
   */
  async isTokenValid(userId: string, tokenId: string): Promise<boolean> {
    const key = this.buildKey(userId, tokenId);
    return this.store.get(key) === 'valid';
  }

  /**
   * Invalidates a specific refresh token (logout from one device).
   */
  async invalidateToken(userId: string, tokenId: string): Promise<void> {
    const key = this.buildKey(userId, tokenId);
    this.store.delete(key);
  }

  /**
   * Invalidates all refresh tokens for a user (logout from all devices).
   */
  async invalidateAllUserTokens(userId: string): Promise<void> {
    const prefix = `${this.TOKEN_PREFIX}${userId}:`;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  private buildKey(userId: string, tokenId: string): string {
    return `${this.TOKEN_PREFIX}${userId}:${tokenId}`;
  }
}
