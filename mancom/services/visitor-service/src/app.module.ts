import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, JWT_VERIFIER } from '@mancom/common';

import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { JwtVerifierService } from './jwt-verifier.service';
import { VisitorsModule } from './visitors/visitors.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        HealthModule,
        VisitorsModule,
    ],
    providers: [
        JwtVerifierService,
        {
            provide: JWT_VERIFIER,
            useExisting: JwtVerifierService,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule { }
