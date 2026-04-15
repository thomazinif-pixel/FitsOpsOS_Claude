import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.get<string>('OPENAI_API_KEY') });
  }

  async getDiagnosis(mes: number, ano: number) {
    try {
      const analyses = await this.prisma.kPIAnalysis.findMany({
        where: { mes, ano },
        include: { kpi: true },
      });

      if (analyses.length === 0) {
        return { error: 'Nenhum dado encontrado para o período selecionado' };
      }

      const totalPeso = analyses.reduce((s, a) => s + a.kpi.peso, 0);
      const scoreGeral = totalPeso > 0
        ? Math.round(analyses.reduce((s, a) => s + a.percentualAtingimento * a.kpi.peso, 0) / totalPeso * 10) / 10
        : 0;

      const green = analyses.filter((a) => a.status === 'GREEN').map((a) => a.kpi.nome);
      const yellow = analyses.filter((a) => a.status === 'YELLOW').map((a) => a.kpi.nome);
      const red = analyses.filter((a) => a.status === 'RED').map((a) => `${a.kpi.nome} (${a.percentualAtingimento}%)`);

      const catSummary = ['CRESCIMENTO', 'EFICIENCIA', 'QUALIDADE', 'EXPERIENCIA'].map((cat) => {
        const catA = analyses.filter((a) => a.kpi.categoria === cat);
        if (!catA.length) return '';
        const media = Math.round(catA.reduce((s, a) => s + a.percentualAtingimento, 0) / catA.length * 10) / 10;
        return `${cat}: ${media}% (G:${catA.filter(a=>a.status==='GREEN').length} Y:${catA.filter(a=>a.status==='YELLOW').length} R:${catA.filter(a=>a.status==='RED').length})`;
      }).filter(Boolean).join('\n');

      const prompt = `Mês/Ano: ${mes}/${ano}
Score Geral: ${scoreGeral}%

KPIs por Status:
- GREEN (${green.length}): ${green.join(', ') || 'nenhum'}
- YELLOW (${yellow.length}): ${yellow.join(', ') || 'nenhum'}
- RED (${red.length}): ${red.join(', ') || 'nenhum'}

Por Categoria:
${catSummary}

Produza:
1. Diagnóstico executivo (2-3 parágrafos)
2. Principais destaques positivos (bullet points)
3. Principais pontos de atenção (bullet points)
4. Recomendação geral para o próximo mês`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista estratégico sênior de operações bancárias. Analise os dados de KPIs fornecidos e produza um diagnóstico executivo conciso e objetivo. Use linguagem profissional adequada para a diretoria. Responda em português.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.4,
      });

      return { diagnosis: response.choices[0].message.content, mes, ano, scoreGeral };
    } catch (err) {
      throw new ServiceUnavailableException('Serviço de IA temporariamente indisponível. Tente novamente em alguns instantes.');
    }
  }

  async getActionSuggestions(kpiId: string, mes: number, ano: number) {
    try {
      const kpi = await this.prisma.kPI.findUnique({ where: { id: kpiId } });
      if (!kpi) return { error: 'KPI não encontrado' };

      const prevMonths = [];
      let m = mes, a = ano;
      for (let i = 0; i < 3; i++) {
        prevMonths.unshift({ mes: m, ano: a });
        m--; if (m === 0) { m = 12; a--; }
      }

      const historico = await Promise.all(
        prevMonths.map(async ({ mes: pm, ano: pa }) => {
          const v = await this.prisma.kPIValue.findUnique({
            where: { kpiId_mes_ano: { kpiId, mes: pm, ano: pa } },
          });
          const an = await this.prisma.kPIAnalysis.findUnique({
            where: { kpiId_mes_ano: { kpiId, mes: pm, ano: pa } },
          });
          return v ? `${pm}/${pa}: ${v.valorRealizado} (${an?.percentualAtingimento ?? '?'}%)` : `${pm}/${pa}: sem dado`;
        }),
      );

      const analysis = await this.prisma.kPIAnalysis.findUnique({
        where: { kpiId_mes_ano: { kpiId, mes, ano } },
      });

      const existingPlans = await this.prisma.actionPlan.findMany({
        where: { kpiId, status: { not: 'CONCLUIDO' } },
        select: { descricao: true, status: true },
      });

      const prompt = `KPI: ${kpi.nome}
Categoria: ${kpi.categoria}
Direção: ${kpi.direcao} (UP = quanto maior melhor, DOWN = quanto menor melhor)
Unidade: ${kpi.unidade}
Meta Mensal: ${kpi.metaMensal}
Últimos 3 meses: ${historico.join(' | ')}
Atingimento atual: ${analysis?.percentualAtingimento ?? '?'}% — Status: ${analysis?.status ?? '?'}
Planos ativos existentes: ${existingPlans.map(p => `"${p.descricao}" (${p.status})`).join('; ') || 'nenhum'}

Sugira 3 planos de ação distintos. Para cada um forneça:
- descricao: string de 1-2 frases
- responsavel: cargo sugerido
- prazo_dias: número de dias a partir de hoje
- impacto_estimado: ex "+5 pontos percentuais no atingimento"

Responda em JSON válido com o formato: { "planos": [{ "descricao": "", "responsavel": "", "prazo_dias": 30, "impacto_estimado": "" }] }`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em melhoria de processos operacionais bancários. Sugira planos de ação específicos, mensuráveis e realizáveis. Responda APENAS com JSON válido, sem markdown.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      const today = new Date();
      const planos = (parsed.planos || []).map((p: any) => ({
        ...p,
        prazo: new Date(today.getTime() + p.prazo_dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        kpiId,
      }));

      return { planos, kpiNome: kpi.nome };
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new ServiceUnavailableException('Erro ao processar resposta da IA. Tente novamente.');
      }
      throw new ServiceUnavailableException('Serviço de IA temporariamente indisponível.');
    }
  }

  async getInsights(mes: number, ano: number) {
    try {
      const analyses = await this.prisma.kPIAnalysis.findMany({
        where: { mes, ano },
        include: { kpi: true },
      });

      if (analyses.length === 0) {
        return { error: 'Nenhum dado encontrado para o período selecionado' };
      }

      const totalPeso = analyses.reduce((s, a) => s + a.kpi.peso, 0);
      const scoreGeral = totalPeso > 0
        ? Math.round(analyses.reduce((s, a) => s + a.percentualAtingimento * a.kpi.peso, 0) / totalPeso * 10) / 10
        : 0;

      const summaryData = {
        mes, ano, scoreGeral,
        kpis: analyses.map((a) => ({
          nome: a.kpi.nome,
          categoria: a.kpi.categoria,
          percentual: a.percentualAtingimento,
          status: a.status,
          tendencia: a.tendencia,
        })),
      };

      const prompt = `Dados do mês ${mes}/${ano}:
${JSON.stringify(summaryData, null, 2)}

Produza exatamente o seguinte JSON:
{
  "top3_riscos": [
    { "titulo": "", "descricao": "", "kpis_afetados": [] }
  ],
  "top3_oportunidades": [
    { "titulo": "", "descricao": "", "kpis_afetados": [] }
  ],
  "resumo_executivo": ""
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista estratégico sênior de operações bancárias. Analise os dados e produza insights executivos. Responda APENAS com JSON válido, sem markdown.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      throw new ServiceUnavailableException('Serviço de IA temporariamente indisponível.');
    }
  }
}
