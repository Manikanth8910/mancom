import { Controller, Get, Post, Body } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { CurrentUser, UserContext } from '@mancom/common';

@Controller('visitors')
export class VisitorsController {
    constructor(private readonly visitorsService: VisitorsService) { }

    @Get()
    async getVisitors() {
        return this.visitorsService.getVisitors();
    }

    @Post()
    async createVisitor(
        @Body() dto: CreateVisitorDto,
        @CurrentUser() user: UserContext,
    ) {
        return this.visitorsService.createVisitor(dto, user.id);
    }

    @Get('passes/stats')
    async getPassesStats() {
        return this.visitorsService.getStats();
    }
}
