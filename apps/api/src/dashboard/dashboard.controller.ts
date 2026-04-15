import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo executivo do dashboard' })
  getSummary(@Query('mes') mes: string, @Query('ano') ano: string) {
    const now = new Date();
    return this.dashboardService.getSummary(
      mes ? parseInt(mes) : now.getMonth() + 1,
      ano ? parseInt(ano) : now.getFullYear(),
    );
  }
}
