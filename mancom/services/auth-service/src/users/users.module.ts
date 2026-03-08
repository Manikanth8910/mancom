import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule], // Need access to AppwriteService
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule { }
