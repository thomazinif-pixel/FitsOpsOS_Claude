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

    // Performance por área (Department)
    const performancePorArea = await this.getPerformancePorArea(mes, ano);

    // Heatmap: KPI x últimos 6 meses
    const heatmapData = await this.getHeatmapData(mes, ano);

    // Alertas de queda consecutiva (3 meses)
    const alertasQuedaConsecutiva = await this.getAlertasQuedaConsecutiva(mes, ano);

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
      performancePorArea,
      heatmapData,
      alertasQuedaConsecutiva,
    };
  }

  private async getPerformancePorArea(mes: number, ano: number) {
    const departments = await this.prisma.department.findMany({ select: { id: true, nome: true } });
    return Promise.all(
      departments.map(async (dept) => {
        const analyses = await this.prisma.kPIAnalysis.findMany({
          where: { mes, ano, kpi: { departmentId: dept.id } },
        });
        if (analyses.length === 0) return { area: dept.nome, media: null };
        const media = Math.round(
          analyses.reduce((s, a) => s + a.percentualAtingimento, 0) / analyses.length * 10,
        ) / 10;
        return { area: dept.nome, media };
      }),
    );
  }

  private async getHeatmapData(mes: number, ano: number) {
    const months: { mes: number; ano: number; label: string }[] = [];
    let m = mes, a = ano;
    for (let i = 0; i < 6; i++) {
      months.unshift({ mes: m, ano: a, label: `${m}/${a}` });
      m--; if (m === 0) { m = 12; a--; }
    }

    const kpis = await this.prisma.kPI.findMany({ where: { ativo: true }, select: { id: true, nome: true } });

    return Promise.all(
      kpis.map(async (kpi) => {
        const cells = await Promise.all(
          months.map(async ({ mes: pm, ano: pa, label }) => {
            const analysis = await this.prisma.kPIAnalysis.findUnique({
              where: { kpiId_mes_ano: { kpiId: kpi.id, mes: pm, ano: pa } },
            });
            return { mes: pm, ano: pa, label, status: analysis?.status ?? null, percentual: analysis?.percentualAtingimento ?? null };
          }),
        );
        return { kpiId: kpi.id, kpiNome: kpi.nome, cells };
      }),
    );
  }

  private async getAlertasQuedaConsecutiva(mes: number, ano: number) {
    const months: { mes: number; ano: number }[] = [];
    let m = mes, a = ano;
    for (let i = 0; i < 3; i++) {
      months.unshift({ mes: m, ano: a });
      m--; if (m === 0) { m = 12; a--; }
    }

    const kpis = await this.prisma.kPI.findMany({ where: { ativo: true }, select: { id: true, nome: true, categoria: true } });
    const result: any[] = [];

    for (const kpi of kpis) {
      const analyses = await Promise.all(
        months.map(({ mes: pm, ano: pa }) =>
          this.prisma.kPIAnalysis.findUnique({
            where: { kpiId_mes_ano: { kpiId: kpi.id, mes: pm, ano: pa } },
          }),
        ),
      );
      const values = analyses.map((a) => a?.percentualAtingimento ?? null);
      if (values.every((v) => v !== null)) {
        const [v1, v2, v3] = values as number[];
        if (v1 > v2 && v2 > v3) {
          result.push({ kpiId: kpi.id, nome: kpi.nome, categoria: kpi.categoria, valores: values, meses: months });
        }
      }
    }

    return result;
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
