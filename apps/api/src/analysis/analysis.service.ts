import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(private prisma: PrismaService) {}

  findAll(mes?: number, ano?: number) {
    const where: any = {};
    if (mes) where.mes = mes;
    if (ano) where.ano = ano;
    return this.prisma.kPIAnalysis.findMany({
      where,
      include: {
          kpi: {
            include: {
              owner: { select: { id: true, nome: true, cargo: true } },
              department: { select: { id: true, nome: true } },
            },
          },
        },
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });
  }

  findByKpi(kpiId: string, ano?: number) {
    const where: any = { kpiId };
    if (ano) where.ano = ano;
    return this.prisma.kPIAnalysis.findMany({
      where,
      orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
    });
  }

  async computeAllForMonth(mes: number, ano: number) {
    const kpis = await this.prisma.kPI.findMany({
      where: { ativo: true, values: { some: { mes, ano } } },
    });
    for (const kpi of kpis) {
      await this.computeAndSave(kpi.id, mes, ano);
    }
    return { computed: kpis.length };
  }

  async computeAndSave(kpiId: string, mes: number, ano: number) {
    const [kpiValue, kpi] = await Promise.all([
      this.prisma.kPIValue.findUnique({
        where: { kpiId_mes_ano: { kpiId, mes, ano } },
      }),
      this.prisma.kPI.findUnique({ where: { id: kpiId } }),
    ]);

    if (!kpiValue || !kpi) return null;

    // Compute percentual atingimento
    let percentualAtingimento: number;
    if (kpi.direcao === 'UP') {
      if (kpi.metaMensal === 0) return null;
      percentualAtingimento = (kpiValue.valorRealizado / kpi.metaMensal) * 100;
    } else {
      if (kpiValue.valorRealizado === 0) return null;
      percentualAtingimento = (kpi.metaMensal / kpiValue.valorRealizado) * 100;
    }
    percentualAtingimento = Math.round(percentualAtingimento * 10) / 10;

    // Compute status
    let status: 'GREEN' | 'YELLOW' | 'RED';
    if (percentualAtingimento >= 100) status = 'GREEN';
    else if (percentualAtingimento >= 80) status = 'YELLOW';
    else status = 'RED';

    // Compute tendencia (compare with previous month)
    const prevMes = mes === 1 ? 12 : mes - 1;
    const prevAno = mes === 1 ? ano - 1 : ano;
    const prevValue = await this.prisma.kPIValue.findUnique({
      where: { kpiId_mes_ano: { kpiId, mes: prevMes, ano: prevAno } },
    });

    let tendencia: 'UP' | 'DOWN' | 'STABLE';
    if (!prevValue) {
      tendencia = 'STABLE';
    } else if (kpiValue.valorRealizado > prevValue.valorRealizado) {
      tendencia = 'UP';
    } else if (kpiValue.valorRealizado < prevValue.valorRealizado) {
      tendencia = 'DOWN';
    } else {
      tendencia = 'STABLE';
    }

    return this.prisma.kPIAnalysis.upsert({
      where: { kpiId_mes_ano: { kpiId, mes, ano } },
      create: { kpiId, mes, ano, percentualAtingimento, status, tendencia },
      update: { percentualAtingimento, status, tendencia },
    });
  }
}
