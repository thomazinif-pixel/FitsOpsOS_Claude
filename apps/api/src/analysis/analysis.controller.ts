import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AnalysisService } from './analysis.service';

@ApiTags('Analysis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analysis')
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Get()
  @ApiOperation({ summary: 'Listar análises por mês/ano' })
  findAll(@Query('mes') mes?: string, @Query('ano') ano?: string) {
    return this.analysisService.findAll(
      mes ? parseInt(mes) : undefined,
      ano ? parseInt(ano) : undefined,
    );
  }

  @Get('kpi/:id')
  @ApiOperation({ summary: 'Histórico de análises de um KPI' })
  findByKpi(@Param('id') id: string, @Query('ano') ano?: string) {
    return this.analysisService.findByKpi(id, ano ? parseInt(ano) : undefined);
  }

  @Post('compute')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Recomputar análises de um mês/ano (ADMIN)' })
  compute(@Body() body: { mes: number; ano: number }) {
    return this.analysisService.computeAllForMonth(body.mes, body.ano);
  }
}
