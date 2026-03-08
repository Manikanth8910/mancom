import {
    Controller, Post, Get, Patch, Body, Param, Query,
    HttpCode, HttpStatus,
} from '@nestjs/common';
import { CurrentUser, UserContext } from '@mancom/common';
import { VisitorsService } from './visitors.service';

@Controller('visitors')
export class VisitorsController {
    constructor(private readonly visitorsService: VisitorsService) { }

    /** POST /visitors/passes — create a pre-approval pass */
    @Post('passes')
    @HttpCode(HttpStatus.CREATED)
    async createPass(
        @CurrentUser() user: UserContext,
        @Body() body: {
            visitorName: string;
            visitorPhone?: string;
            purpose?: string;
            expectedAt?: string;
        },
    ) {
        return this.visitorsService.createPass({
            ...body,
            createdById: user.id,
            flatId: user.flatId,
            societyId: user.societyId,
        });
    }

    /** GET /visitors/passes — list my passes */
    @Get('passes')
    async getMyPasses(@CurrentUser() user: UserContext) {
        return this.visitorsService.getMyPasses(user.id);
    }

    /** GET /visitors/passes/society — admin: list all passes in society */
    @Get('passes/society')
    async getSocietyPasses(
        @CurrentUser() user: UserContext,
        @Query('status') status?: string,
    ) {
        return this.visitorsService.getSocietyPasses(user.societyId!, status);
    }

    /** GET /visitors/passes/stats — admin stats */
    @Get('passes/stats')
    async getStats(@CurrentUser() user: UserContext) {
        return this.visitorsService.getStats(user.societyId!);
    }

    /** GET /visitors/passes/scan/:token — lookup by token (security) */
    @Get('passes/scan/:token')
    async getByToken(@Param('token') token: string) {
        return this.visitorsService.getByToken(token);
    }

    /** PATCH /visitors/passes/arrive/:token — mark arrived (security scan) */
    @Patch('passes/arrive/:token')
    async markArrived(
        @Param('token') token: string,
        @CurrentUser() user: UserContext,
    ) {
        return this.visitorsService.markArrived(token, user.id);
    }

    /** PATCH /visitors/passes/cancel/:token — resident cancels */
    @Patch('passes/cancel/:token')
    async cancelPass(
        @Param('token') token: string,
        @CurrentUser() user: UserContext,
    ) {
        return this.visitorsService.cancelPass(token, user.id);
    }
}
