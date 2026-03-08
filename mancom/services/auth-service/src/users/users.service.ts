import { Injectable, ConflictException } from '@nestjs/common';
import { prisma } from '@mancom/database';
import { AppwriteService } from '../auth/appwrite.service';


@Injectable()
export class UsersService {
    constructor(private readonly appwriteService: AppwriteService) { }

    async createUser(dto: { email: string; password?: string; name?: string; phone?: string; role: string; societyId?: string }) {
        // 1. Create in Appwrite (optional, but good for SSO syncing)
        // We already have appwriteService.createUser
        try {
            await this.appwriteService.createUser({
                email: dto.email,
                password: dto.password || 'TempPassword123!',
                name: dto.name,
                phone: dto.phone,
                role: dto.role.toLowerCase(),
            });
        } catch (e) {
            console.error('Appwrite creation failed (they might exist already)', e);
        }

        // 2. Create in Prisma Postgres
        const existing = await prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('User with that email already exists in Postgres.');
        }

        const user = await prisma.user.create({
            data: {
                email: dto.email,
                password: dto.password || 'NO_PASSWORD',
                name: dto.name || null,
                phone: dto.phone || null,
                role: dto.role.toUpperCase(),
                societyId: dto.societyId || null,
            }
        });

        return user;
    }

    async getAllUsers() {
        return prisma.user.findMany({
            include: {
                society: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getStats(societyId?: string) {
        const totalUsers = await prisma.user.count({
            where: societyId ? { societyId } : {}
        });
        // optionally counting residents, etc.
        return { totalUsers };
    }
}
