import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ActionPlansService } from './action-plans.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';

@ApiTags('Planos de Ação')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('action-plans')
export class ActionPlansController {
  constructor(private actionPlansService: ActionPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar planos de ação' })
  findAll(@Query('kpiId') kpiId?: string, @Query('status') status?: string) {
    return this.actionPlansService.findAll({ kpiId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar plano de ação por ID' })
  findOne(@Param('id') id: string) {
    return this.actionPlansService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar plano de ação (ADMIN)' })
  create(@Body() dto: CreateActionPlanDto) {
    return this.actionPlansService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar plano de ação (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateActionPlanDto) {
    return this.actionPlansService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Excluir plano de ação (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.actionPlansService.remove(id);
  }
}
