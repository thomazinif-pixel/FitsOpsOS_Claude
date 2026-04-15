import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisService } from '../analysis/analysis.service';
import { UpsertKpiValueDto } from './dto/upsert-kpi-value.dto';
import { BulkUpsertDto } from './dto/bulk-upsert.dto';

@Injectable()
export class KpiValuesService {
  constructor(
    private prisma: PrismaService,
    private analysisService: AnalysisService,
  ) {}

  findAll(filters: { kpiId?: string; mes?: number; ano?: number }) {
    const where: any = {};
    if (filters.kpiId) where.kpiId = filters.kpiId;
    if (filters.mes) where.mes = filters.mes;
    if (filters.ano) where.ano = filters.ano;
    return this.prisma.kPIValue.findMany({ where, include: { kpi: true } });
  }

  findByMonth(mes: number, ano: number) {
    return this.prisma.kPI.findMany({
      where: { ativo: true },
      orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
      include: {
        values: { where: { mes, ano } },
        analyses: { where: { mes, ano } },
      },
    });
  }

  async upsert(dto: UpsertKpiValueDto) {
    const value = await this.prisma.kPIValue.upsert({
      where: { kpiId_mes_ano: { kpiId: dto.kpiId, mes: dto.mes, ano: dto.ano } },
      create: dto,
      update: { valorRealizado: dto.valorRealizado },
    });
    await this.analysisService.computeAndSave(dto.kpiId, dto.mes, dto.ano);
    return value;
  }

  async bulkUpsert(dto: BulkUpsertDto) {
    const results = [];
    for (const item of dto.items) {
      const value = await this.prisma.kPIValue.upsert({
        where: { kpiId_mes_ano: { kpiId: item.kpiId, mes: item.mes, ano: item.ano } },
        create: item,
        update: { valorRealizado: item.valorRealizado },
      });
      results.push(value);
    }
    // Recompute analyses after bulk save
    const uniquePairs = [...new Set(dto.items.map(i => `${i.kpiId}-${i.mes}-${i.ano}`))];
    for (const pair of uniquePairs) {
      const [kpiId, mes, ano] = pair.split('-');
      await this.analysisService.computeAndSave(kpiId, parseInt(mes), parseInt(ano));
    }
    return { saved: results.length, message: `${results.length} valores atualizados` };
  }
}
