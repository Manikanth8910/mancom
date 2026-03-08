import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@mancom/database';

@Injectable()
export class VisitorsService {
    /** Create a visitor pre-approval pass */
    async createPass(dto: {
        visitorName: string;
        visitorPhone?: string;
        purpose?: string;
        expectedAt?: string;
        flatId?: string;
        societyId?: string;
        createdById: string;
    }) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // valid 24 hours

        const pass = await prisma.visitorPass.create({
            data: {
                visitorName: dto.visitorName,
                visitorPhone: dto.visitorPhone,
                purpose: dto.purpose,
                expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : undefined,
                flatId: dto.flatId,
                societyId: dto.societyId,
                createdById: dto.createdById,
                expiresAt,
                status: 'pending',
            },
        });

        return pass;
    }

    /** List passes created by a user */
    async getMyPasses(userId: string) {
        return prisma.visitorPass.findMany({
            where: { createdById: userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    /** List ALL passes for a society (admin view) */
    async getSocietyPasses(societyId: string, status?: string) {
        return prisma.visitorPass.findMany({
            where: {
                societyId,
                ...(status ? { status } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    /** Get a pass by token (for security to scan) */
    async getByToken(token: string) {
        const pass = await prisma.visitorPass.findUnique({ where: { token } });
        if (!pass) throw new NotFoundException('Visitor pass not found');
        return pass;
    }

    /** Mark pass as arrived (called on QR scan) */
    async markArrived(token: string, scannedById: string) {
        const pass = await prisma.visitorPass.findUnique({ where: { token } });
        if (!pass) throw new NotFoundException('Visitor pass not found');

        const updated = await prisma.visitorPass.update({
            where: { token },
            data: { status: 'arrived', scannedAt: new Date() },
        });

        // Log to VisitorLog as well for backwards compatibility
        if (pass.flatId && pass.societyId) {
            await prisma.visitorLog.create({
                data: {
                    name: pass.visitorName,
                    type: 'Guest',
                    phone: pass.visitorPhone,
                    flatId: pass.flatId,
                    societyId: pass.societyId,
                    approvedById: scannedById,
                },
            }).catch(() => { }); // Non-critical
        }

        return updated;
    }

    /** Cancel a pass */
    async cancelPass(token: string, userId: string) {
        return prisma.visitorPass.updateMany({
            where: { token, createdById: userId },
            data: { status: 'cancelled' },
        });
    }

    /** Admin stats */
    async getStats(societyId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, arrived, pending, todayCount] = await Promise.all([
            prisma.visitorPass.count({ where: { societyId } }),
            prisma.visitorPass.count({ where: { societyId, status: 'arrived' } }),
            prisma.visitorPass.count({ where: { societyId, status: 'pending' } }),
            prisma.visitorPass.count({ where: { societyId, createdAt: { gte: today } } }),
        ]);

        return { total, arrived, pending, todayCount };
    }
}
