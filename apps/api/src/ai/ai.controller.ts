import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('IA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('diagnosis')
  @ApiOperation({ summary: 'Diagnóstico executivo automático via IA' })
  getDiagnosis(@Body() body: { mes: number; ano: number }) {
    return this.aiService.getDiagnosis(body.mes, body.ano);
  }

  @Post('action-suggestions')
  @ApiOperation({ summary: 'Sugestão de planos de ação via IA para um KPI' })
  getActionSuggestions(@Body() body: { kpiId: string; mes: number; ano: number }) {
    return this.aiService.getActionSuggestions(body.kpiId, body.mes, body.ano);
  }

  @Post('insights')
  @ApiOperation({ summary: 'Top 3 riscos, oportunidades e resumo executivo via IA' })
  getInsights(@Body() body: { mes: number; ano: number }) {
    return this.aiService.getInsights(body.mes, body.ano);
  }
}
