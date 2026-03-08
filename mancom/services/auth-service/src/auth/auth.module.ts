import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, JWT_VERIFIER } from '@mancom/common';
import { Reflector } from '@nestjs/core';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppwriteService } from './appwrite.service';
import { TokenStoreService } from './token-store.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AppwriteService,
    TokenStoreService,
    // Provide AuthService as the JWT verifier for JwtAuthGuard
    {
      provide: JWT_VERIFIER,
      useExisting: AuthService,
    },
    // Apply JwtAuthGuard globally for this service
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, jwtVerifier: AuthService) => {
        return new JwtAuthGuard(reflector, jwtVerifier);
      },
      inject: [Reflector, AuthService],
    },
  ],
  exports: [AuthService, AppwriteService],
})
export class AuthModule { }
