/**
 * User context attached to authenticated requests.
 * Extracted from the verified JWT and attached to req.user.
 */
export interface UserContext {
  /** User's unique identifier */
  id: string;

  /** User's email address */
  email: string;

  /** User's display name */
  name: string;

  /** User's roles for authorization checks */
  roles: string[];

  /** Society ID the user belongs to */
  societyId: string;

  /** Flat/unit ID within the society */
  flatId?: string;
}
