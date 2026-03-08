import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Request body for exchanging an Appwrite JWT for Mancom tokens.
 */
export class ExchangeTokenDto {
  /**
   * The JWT obtained from Appwrite after user login.
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @IsString()
  @IsNotEmpty()
  appwriteJwt!: string;
}
