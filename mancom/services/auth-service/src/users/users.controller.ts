import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Public, CurrentUser, UserContext } from '@mancom/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Public() // For demo purposes, we can leave Public or require Auth later
    @Get()
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() dto: { email: string; password?: string; name?: string; phone?: string; role: string; societyId?: string }) {
        return this.usersService.createUser(dto);
    }

    @Get('stats')
    async getStats(@CurrentUser() user: UserContext) {
        return this.usersService.getStats(user.societyId);
    }
}
