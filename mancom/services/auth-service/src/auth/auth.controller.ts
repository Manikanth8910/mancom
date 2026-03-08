import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { Public, CurrentUser, UserContext } from '@mancom/common';

import { AuthService, AuthTokenResponse } from './auth.service';
import { ExchangeTokenDto, RefreshTokenDto, LogoutDto, LoginDto, SignupDto, RequestOtpDto, VerifyOtpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * POST /auth/token
   * Exchange an Appwrite JWT for Mancom tokens.
   */
  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  async exchangeToken(@Body() dto: ExchangeTokenDto): Promise<AuthTokenResponse> {
    return this.authService.exchangeToken(dto.appwriteJwt);
  }

  /**
   * POST /auth/refresh
   * Refresh the token pair using a valid refresh token.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthTokenResponse> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Invalidate a refresh token.
   */
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  /**
   * POST /auth/login
   * Login with email and password to get tokens
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthTokenResponse> {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/signup
   * Signup with email, password and role
   */
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() dto: SignupDto): Promise<AuthTokenResponse> {
    return this.authService.signup(dto);
  }

  /**
   * POST /auth/otp/request
   * Request an OTP for a phone number
   */
  @Public()
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ message: string }> {
    return this.authService.requestOtp(dto);
  }

  /**
   * POST /auth/otp/verify
   * Verify an OTP and login
   */
  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokenResponse> {
    return this.authService.verifyOtp(dto);
  }

  /**
   * GET /auth/me
   * Get the current authenticated user's information.
   * Requires a valid access token.
   */
  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: UserContext,
    @Headers('authorization') _authHeader: string,
  ): Promise<UserContext> {
    // User is already attached by JwtAuthGuard
    // This endpoint validates the token is working correctly
    if (!user) {
      throw new UnauthorizedException({
        code: 'NO_USER_CONTEXT',
        message: 'User context not found',
      });
    }

    return user;
  }
}
