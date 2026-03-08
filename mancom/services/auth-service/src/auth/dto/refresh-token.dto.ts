import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Request body for refreshing the token pair.
 */
export class RefreshTokenDto {
  /**
   * The refresh token from a previous token exchange.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
