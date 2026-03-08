import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from './config';
import { AuthModule } from './auth';
import { HealthModule } from './health';
import { SocietiesModule } from './societies/societies.module';
import { UsersModule } from './users/users.module';
import { VisitorsModule } from './visitors/visitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    HealthModule,
    SocietiesModule,
    UsersModule,
    VisitorsModule,
  ],
})
export class AppModule { }
