import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, UserContext } from '@mancom/common';
import { JwtService, TokenPair } from '@mancom/jwt-utils';
import { prisma } from '@mancom/database';



import { AppwriteService, AppwriteUser } from './appwrite.service';
import { TokenStoreService } from './token-store.service';

/**
 * Response returned after successful token exchange or refresh.
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
  };
}

/**
 * Main authentication service.
 * Handles token exchange, refresh, and logout operations.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtService: JwtService;

  constructor(
    private readonly configService: ConfigService,
    private readonly appwriteService: AppwriteService,
    private readonly tokenStoreService: TokenStoreService,
  ) {
    this.jwtService = new JwtService({
      privateKeyPath: this.configService.get<string>('jwt.privateKeyPath')!,
      publicKeyPath: this.configService.get<string>('jwt.publicKeyPath')!,
      accessTokenExpiry: this.configService.get<string>('jwt.accessTokenExpiry')!,
      refreshTokenExpiry: this.configService.get<string>('jwt.refreshTokenExpiry')!,
      issuer: this.configService.get<string>('jwt.issuer')!,
      audience: this.configService.get<string>('jwt.audience')!,
    });
  }

  /**
   * Exchanges an Appwrite JWT for Mancom token pair.
   * 1. Verifies the Appwrite JWT
   * 2. Fetches user data from Appwrite
   * 3. Generates Mancom access and refresh tokens
   */
  async exchangeToken(appwriteJwt: string): Promise<AuthTokenResponse> {
    // Verify Appwrite session and get user data
    const appwriteUser = await this.appwriteService.verifySessionAndGetUser(appwriteJwt);

    // Map Appwrite user to our token payload
    const userData = this.mapAppwriteUserToTokenData(appwriteUser);

    // Generate token pair
    const tokenPair = this.jwtService.generateTokenPair(userData);

    // Extract token ID from refresh token for storage
    const refreshPayload = await this.jwtService.verifyRefreshToken(tokenPair.refreshToken);
    const tokenId = this.extractTokenId(refreshPayload);

    // Store refresh token for validation
    await this.tokenStoreService.storeRefreshToken(userData.id, tokenId);

    return this.formatTokenResponse(tokenPair, userData);
  }

  /**
   * Login with email and password.
   * Creates an Appwrite session via server-side and returns our tokens.
   */
  async login(dto: { email: string; password: string; role: string }): Promise<AuthTokenResponse> {
    const appwriteUser = await this.appwriteService.loginAndGetUser(dto.email, dto.password);

    // Check role (basic check, ideally we prevent non-admin from logging into admin apps)
    // For now, we trust the role sent but verify if the user HAS that role in Appwrite
    // However, Appwrite implementation below will fetch the user and we can check roles there.
    // If the user *expects* a role, we should verify it match or is allowed.
    // For simplicity, we just log them in and return their actual roles.

    // TODO: Verify dto.role is in appwriteUser.labels if strictly required

    const userData = this.mapAppwriteUserToTokenData(appwriteUser);
    const tokenPair = this.jwtService.generateTokenPair(userData);

    const refreshPayload = await this.jwtService.verifyRefreshToken(tokenPair.refreshToken);
    const tokenId = this.extractTokenId(refreshPayload);
    await this.tokenStoreService.storeRefreshToken(userData.id, tokenId);

    return this.formatTokenResponse(tokenPair, userData);
  }

  /**
   * Signup with email, password, and role.
   * Creates user in Appwrite, sets roles, logs them in, and returns our tokens.
   */
  async signup(dto: { email: string; password: string; name?: string; phone?: string; role: string }): Promise<AuthTokenResponse> {
    const appwriteUser = await this.appwriteService.createUser(dto);

    const userData = this.mapAppwriteUserToTokenData(appwriteUser);
    const tokenPair = this.jwtService.generateTokenPair(userData);

    const refreshPayload = await this.jwtService.verifyRefreshToken(tokenPair.refreshToken);
    const tokenId = this.extractTokenId(refreshPayload);
    await this.tokenStoreService.storeRefreshToken(userData.id, tokenId);

    return this.formatTokenResponse(tokenPair, userData);
  }
  /**
   * Request OTP for login
   */
  async requestOtp(dto: { phone: string }): Promise<{ message: string }> {
    // Basic phone validation
    if (!dto.phone || dto.phone.length < 10) {
      throw new UnauthorizedException('Invalid phone number');
    }

    const existing = await prisma.otp.findUnique({ where: { phone: dto.phone } });
    if (existing && existing.blockedUntil && existing.blockedUntil > new Date()) {
      throw new UnauthorizedException(`This phone number is temporary blocked due to too many attempts. Please try again after ${existing.blockedUntil.toLocaleTimeString()}`);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.otp.upsert({
      where: { phone: dto.phone },
      update: { otp, expiresAt, attempts: 0 }, // Reset attempts on new request if not blocked
      create: { phone: dto.phone, otp, expiresAt },
    });

    // In a real app, send via SMS provider. For now, log.
    console.log(`\n=========================================\nOTP for ${dto.phone} is ${otp}\n=========================================\n`);

    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP and login user entirely via Postgres Prisma
   */
  async verifyOtp(dto: { phone: string; otp: string }): Promise<AuthTokenResponse> {
    const record = await prisma.otp.findUnique({ where: { phone: dto.phone } });

    if (!record) {
      throw new UnauthorizedException('OTP not found for this phone number. Please request a new one.');
    }

    // Check if blocked
    if (record.blockedUntil && record.blockedUntil > new Date()) {
      throw new UnauthorizedException('Too many failed attempts. Access restricted.');
    }

    // Check if expired
    if (record.expiresAt < new Date()) {
      await prisma.otp.delete({ where: { phone: dto.phone } });
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    // Check OTP
    if (record.otp !== dto.otp) {
      const newAttempts = record.attempts + 1;
      const MAX_ATTEMPTS = 5;

      if (newAttempts >= MAX_ATTEMPTS) {
        const blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
        await prisma.otp.update({
          where: { phone: dto.phone },
          data: { attempts: newAttempts, blockedUntil }
        });
        throw new UnauthorizedException('Too many failed attempts. Your phone number is blocked for 15 minutes.');
      } else {
        await prisma.otp.update({
          where: { phone: dto.phone },
          data: { attempts: newAttempts }
        });
        throw new UnauthorizedException(`Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }

    // OTP is valid. Delete it so it cannot be reused.
    await prisma.otp.delete({ where: { phone: dto.phone } });

    // Fetch user from Postgres
    let user = await prisma.user.findFirst({ where: { phone: dto.phone } });

    // Auto-register if not found
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${dto.phone.replace('+', '')}@placeholder.com`, // Temporary email placeholder
          phone: dto.phone,
          password: 'NO_PASSWORD',
          role: 'USER',
        }
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      roles: [user.role.toLowerCase()],
      societyId: user.societyId || '',
      flatId: user.flatId || undefined,
      phone: user.phone || undefined,
    };

    const tokenPair = this.jwtService.generateTokenPair(userData);

    const refreshPayload = await this.jwtService.verifyRefreshToken(tokenPair.refreshToken);
    const tokenId = this.extractTokenId(refreshPayload);
    await this.tokenStoreService.storeRefreshToken(userData.id, tokenId);

    return this.formatTokenResponse(tokenPair, userData);
  }


  /**
   * Refreshes the token pair using a valid refresh token.
   * 1. Verifies the refresh token
   * 2. Checks if the refresh token is still valid (not revoked)
   * 3. Generates a new token pair
   * 4. Invalidates the old refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokenResponse> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      });
    }

    // Check if token is still valid (not revoked)
    const tokenId = this.extractTokenId(payload);
    const isValid = await this.tokenStoreService.isTokenValid(payload.sub, tokenId);

    if (!isValid) {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_REVOKED',
        message: 'Refresh token has been revoked',
      });
    }

    // Generate new token pair
    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
      societyId: payload.societyId,
      flatId: payload.flatId,
      phone: payload.phone, // Include phone if available in payload
    };

    const newTokenPair = this.jwtService.generateTokenPair(userData);

    // Extract new token ID
    const newRefreshPayload = await this.jwtService.verifyRefreshToken(newTokenPair.refreshToken);
    const newTokenId = this.extractTokenId(newRefreshPayload);

    // Invalidate old token and store new one
    await this.tokenStoreService.invalidateToken(payload.sub, tokenId);
    await this.tokenStoreService.storeRefreshToken(userData.id, newTokenId);

    return this.formatTokenResponse(newTokenPair, userData);
  }

  /**
   * Logs out by invalidating the refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.jwtService.verifyRefreshToken(refreshToken);
      const tokenId = this.extractTokenId(payload);
      await this.tokenStoreService.invalidateToken(payload.sub, tokenId);
    } catch {
      // Token is already invalid or expired - consider it logged out
      this.logger.debug('Logout called with invalid token - treating as already logged out');
    }
  }

  /**
   * Verifies an access token and returns the payload.
   * Used by JwtAuthGuard.
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAccessToken(token);
  }

  /**
   * Gets the current user context from an access token.
   */
  async getCurrentUser(accessToken: string): Promise<UserContext> {
    const payload = await this.verifyAccessToken(accessToken);

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
      societyId: payload.societyId,
      flatId: payload.flatId,
    };
  }

  private mapAppwriteUserToTokenData(appwriteUser: AppwriteUser) {
    // Map Appwrite labels to roles
    // Labels in Appwrite: ['resident', 'committee'] etc.
    const roles = appwriteUser.labels.length > 0 ? appwriteUser.labels : ['resident'];

    // Get society and flat from user preferences
    // These should be set when user is onboarded to a society
    const societyId = (appwriteUser.prefs.societyId as string) || '';
    const flatId = (appwriteUser.prefs.flatId as string) || undefined;

    return {
      id: appwriteUser.id,
      email: appwriteUser.email,
      name: appwriteUser.name,
      roles,
      societyId,
      flatId,
      phone: appwriteUser.phone,
    };
  }

  private extractTokenId(payload: JwtPayload): string {
    // Use iat (issued at) as unique identifier for the token
    // Combined with user ID, this ensures uniqueness
    return `${payload.iat}`;
  }

  private formatTokenResponse(tokenPair: TokenPair, userData: any): AuthTokenResponse {
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
      tokenType: 'Bearer',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'user', // Default to user if empty
        phone: userData.phone, // Ensure this is mapped if available
      },
    };
  }
}
