/**
 * Secure Storage
 * Wrapper around react-native-keychain for secure token storage
 */

import * as Keychain from 'react-native-keychain';
import type { AuthTokens } from '../../types/models';

const STORAGE_KEY = 'mancom_auth_tokens';

interface SecureStorageInterface {
  saveTokens: (tokens: AuthTokens) => Promise<boolean>;
  getTokens: () => Promise<AuthTokens | null>;
  clearTokens: () => Promise<boolean>;
}

export const secureStorage: SecureStorageInterface = {
  /**
   * Save auth tokens securely
   */
  async saveTokens(tokens: AuthTokens): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(STORAGE_KEY, JSON.stringify(tokens), {
        service: STORAGE_KEY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return true;
    } catch (error) {
      console.error('Failed to save tokens:', error);
      return false;
    }
  },

  /**
   * Retrieve auth tokens
   */
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: STORAGE_KEY });
      if (credentials) {
        return JSON.parse(credentials.password) as AuthTokens;
      }
      return null;
    } catch (error) {
      console.error('Failed to get tokens:', error);
      return null;
    }
  },

  /**
   * Clear all stored tokens (logout)
   */
  async clearTokens(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: STORAGE_KEY });
      return true;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      return false;
    }
  },
};

export default secureStorage;
