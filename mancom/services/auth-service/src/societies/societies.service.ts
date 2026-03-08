import { Injectable } from '@nestjs/common';
import { prisma } from '@mancom/database';

@Injectable()
export class SocietiesService {
    async getAllSocieties() {
        const societies = await prisma.society.findMany({
            include: {
                _count: {
                    select: { flats: true },
                },
            },
        });

        // We can also fetch total collected metrics here but since it's dummy for now, let's just return what we have in DB
        return societies.map(s => ({
            id: s.id,
            name: s.name,
            city: s.city,
            units: s._count.flats,
            status: 'Active',
            collected: '₹0L', // Still a dummy metric as payment system isn't fully linked
        }));
    }
}
