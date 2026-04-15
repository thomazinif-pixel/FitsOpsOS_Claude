import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(mes: number, ano: number) {
    const analyses = await this.prisma.kPIAnalysis.findMany({
      where: { mes, ano },
      include: { kpi: true },
    });

    if (analyses.length === 0) {
      return {
        mes,
        ano,
        scoreGeral: 0,
        totalKpis: 0,
        porCategoria: [],
        alertas: [],
        rankingMelhores: [],
        rankingPiores: [],
        tendencias: [],
      };
    }

    // Score geral (weighted average)
    const totalPeso = analyses.reduce((sum, a) => sum + a.kpi.peso, 0);
    const scoreGeral = totalPeso > 0
      ? Math.round(analyses.reduce((sum, a) => sum + a.percentualAtingimento * a.kpi.peso, 0) / totalPeso * 10) / 10
      : 0;

    // Por categoria
    const categorias = ['CRESCIMENTO', 'EFICIENCIA', 'QUALIDADE', 'EXPERIENCIA'];
    const porCategoria = categorias.map((cat) => {
      const catAnalyses = analyses.filter((a) => a.kpi.categoria === cat);
      if (catAnalyses.length === 0) return { categoria: cat, mediaAtingimento: 0, green: 0, yellow: 0, red: 0, total: 0 };
      const media = Math.round(catAnalyses.reduce((sum, a) => sum + a.percentualAtingimento, 0) / catAnalyses.length * 10) / 10;
      return {
        categoria: cat,
        mediaAtingimento: media,
        green: catAnalyses.filter((a) => a.status === 'GREEN').length,
        yellow: catAnalyses.filter((a) => a.status === 'YELLOW').length,
        red: catAnalyses.filter((a) => a.status === 'RED').length,
        total: catAnalyses.length,
      };
    });

    // Alertas (RED KPIs)
    const alertas = analyses
      .filter((a) => a.status === 'RED')
      .map((a) => ({
        kpiId: a.kpiId,
        nome: a.kpi.nome,
        categoria: a.kpi.categoria,
        percentualAtingimento: a.percentualAtingimento,
        tendencia: a.tendencia,
      }))
      .sort((a, b) => a.percentualAtingimento - b.percentualAtingimento);

    // Rankings
    const sorted = [...analyses].sort((a, b) => b.percentualAtingimento - a.percentualAtingimento);
    const rankingMelhores = sorted.slice(0, 5).map((a) => ({
      kpiId: a.kpiId,
      nome: a.kpi.nome,
      categoria: a.kpi.categoria,
      percentualAtingimento: a.percentualAtingimento,
      status: a.status,
    }));
    const rankingPiores = sorted.slice(-5).reverse().map((a) => ({
      kpiId: a.kpiId,
      nome: a.kpi.nome,
      categoria: a.kpi.categoria,
      percentualAtingimento: a.percentualAtingimento,
      status: a.status,
    }));

    // Tendências dos últimos 6 meses por categoria
    const tendencias = await this.getTendencias(mes, ano);

    return {
      mes,
      ano,
      scoreGeral,
      totalKpis: analyses.length,
      countGreen: analyses.filter((a) => a.status === 'GREEN').length,
      countYellow: analyses.filter((a) => a.status === 'YELLOW').length,
      countRed: analyses.filter((a) => a.status === 'RED').length,
      porCategoria,
      alertas,
      rankingMelhores,
      rankingPiores,
      tendencias,
    };
  }

  private async getTendencias(mes: number, ano: number) {
    const months: { mes: number; ano: number }[] = [];
    let m = mes;
    let a = ano;
    for (let i = 0; i < 6; i++) {
      months.unshift({ mes: m, ano: a });
      m--;
      if (m === 0) { m = 12; a--; }
    }

    const categorias = ['CRESCIMENTO', 'EFICIENCIA', 'QUALIDADE', 'EXPERIENCIA'];
    return Promise.all(
      categorias.map(async (cat) => {
        const series = await Promise.all(
          months.map(async ({ mes: m, ano: a }) => {
            const catAnalyses = await this.prisma.kPIAnalysis.findMany({
              where: { mes: m, ano: a, kpi: { categoria: cat as any } },
            });
            const media = catAnalyses.length > 0
              ? Math.round(catAnalyses.reduce((s, x) => s + x.percentualAtingimento, 0) / catAnalyses.length * 10) / 10
              : null;
            return { mes: m, ano: a, label: `${m}/${a}`, media };
          }),
        );
        return { categoria: cat, series };
      }),
    );
  }
}
