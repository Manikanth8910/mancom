import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Request body for logout (refresh token invalidation).
 */
export class LogoutDto {
  /**
   * The refresh token to invalidate.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
