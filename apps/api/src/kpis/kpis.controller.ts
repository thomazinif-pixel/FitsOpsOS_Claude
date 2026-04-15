import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { KpisService } from './kpis.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';

@ApiTags('KPIs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kpis')
export class KpisController {
  constructor(private kpisService: KpisService) {}

  @Get()
  @ApiOperation({ summary: 'Listar KPIs com filtros opcionais' })
  @ApiQuery({ name: 'categoria', required: false })
  @ApiQuery({ name: 'ativo', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('categoria') categoria?: string,
    @Query('ativo') ativo?: string,
    @Query('search') search?: string,
  ) {
    return this.kpisService.findAll({ categoria, ativo, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar KPI por ID' })
  findOne(@Param('id') id: string) {
    return this.kpisService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar novo KPI (ADMIN)' })
  create(@Body() dto: CreateKpiDto) {
    return this.kpisService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar KPI (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateKpiDto) {
    return this.kpisService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar KPI - soft delete (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.kpisService.softDelete(id);
  }
}
