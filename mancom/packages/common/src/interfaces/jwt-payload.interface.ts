/**
 * JWT payload structure for Mancom access tokens.
 * This is the decoded content of our custom JWTs.
 */
export interface JwtPayload {
  /** User's unique identifier */
  sub: string;

  /** User's email address */
  email: string;

  /** User's display name */
  name: string;

  /** User's phone number */
  phone?: string;

  /** User's roles for authorization */
  roles: string[];

  /** Society ID the user belongs to */
  societyId: string;

  /** Flat/unit ID within the society (optional for non-residents) */
  flatId?: string;

  /** Token type: 'access' or 'refresh' */
  type: 'access' | 'refresh';

  /** Issued at timestamp (Unix) */
  iat: number;

  /** Expiration timestamp (Unix) */
  exp: number;

  /** Token issuer */
  iss: string;

  /** Token audience */
  aud: string;
}
