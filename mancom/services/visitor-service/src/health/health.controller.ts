import { Controller, Get } from '@nestjs/common';
import { Public } from '@mancom/common';

@Controller('health')
export class HealthController {
    @Public()
    @Get()
    check() {
        return {
            status: 'ok',
            service: 'visitor-service',
            timestamp: new Date().toISOString(),
        };
    }
}
