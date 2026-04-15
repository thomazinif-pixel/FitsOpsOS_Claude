import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { KpiValuesService } from './kpi-values.service';
import { UpsertKpiValueDto } from './dto/upsert-kpi-value.dto';
import { BulkUpsertDto } from './dto/bulk-upsert.dto';

@ApiTags('KPI Values')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kpi-values')
export class KpiValuesController {
  constructor(private kpiValuesService: KpiValuesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar valores com filtros' })
  findAll(
    @Query('kpiId') kpiId?: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.kpiValuesService.findAll({
      kpiId,
      mes: mes ? parseInt(mes) : undefined,
      ano: ano ? parseInt(ano) : undefined,
    });
  }

  @Get('month')
  @ApiOperation({ summary: 'Buscar todos os KPIs com valores de um mês/ano (Input Mensal)' })
  @ApiQuery({ name: 'mes', required: true })
  @ApiQuery({ name: 'ano', required: true })
  findByMonth(@Query('mes') mes: string, @Query('ano') ano: string) {
    return this.kpiValuesService.findByMonth(parseInt(mes), parseInt(ano));
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upsert de valor mensal (ADMIN)' })
  upsert(@Body() dto: UpsertKpiValueDto) {
    return this.kpiValuesService.upsert(dto);
  }

  @Post('bulk')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upsert em massa de valores mensais (ADMIN)' })
  bulkUpsert(@Body() dto: BulkUpsertDto) {
    return this.kpiValuesService.bulkUpsert(dto);
  }
}
