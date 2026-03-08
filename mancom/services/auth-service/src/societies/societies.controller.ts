import { Controller, Get } from '@nestjs/common';
import { SocietiesService } from './societies.service';
import { Public } from '@mancom/common';

@Controller('societies')
export class SocietiesController {
    constructor(private readonly societiesService: SocietiesService) { }

    @Public() // Allow public for now based on context, or use @CurrentUser guards if required
    @Get()
    async getAllSocieties() {
        return this.societiesService.getAllSocieties();
    }
}
