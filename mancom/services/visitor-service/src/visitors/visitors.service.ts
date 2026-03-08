import { Injectable } from '@nestjs/common';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class VisitorsService {
    private visitors: any[] = [];

    async getVisitors() {
        return this.visitors;
    }

    async createVisitor(dto: CreateVisitorDto, userId: string) {
        const visitor = {
            id: randomUUID(),
            ...dto,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        this.visitors.push(visitor);
        return visitor;
    }

    async getStats() {
        const todayCount = this.visitors.filter(v => new Date(v.createdAt).toDateString() === new Date().toDateString()).length;
        const pending = this.visitors.filter(v => v.status === 'pending').length;
        return { todayCount, pending };
    }
}
