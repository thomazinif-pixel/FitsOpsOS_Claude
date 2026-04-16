'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { mesesLabels } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Risco {
  titulo: string;
  descricao: string;
  kpis_afetados: string[];
}

interface Insights {
  top3_riscos: Risco[];
  top3_oportunidades: Risco[];
  resumo_executivo: string;
}

interface Padrao {
  tipo: string;
  descricao: string;
  kpis_afetados: string[];
  severidade: 'ALTA' | 'MEDIA' | 'BAIXA';
}

interface TrendAnalysis {
  padroes: Padrao[];
  resumo_periodo: string;
  recomendacao_prioritaria: string;
  mes: number;
  ano: number;
}

const severityColor: Record<string, string> = {
  ALTA: 'bg-red-100 text-red-800 border-red-200',
  MEDIA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  BAIXA: 'bg-green-100 text-green-800 border-green-200',
};

const tipoLabel: Record<string, string> = {
  QUEDA_EFICIENCIA: 'Queda de Eficiência',
  AUMENTO_INCIDENTES: 'Aumento de Incidentes',
  RISCO_OPERACIONAL: 'Risco Operacional',
  TENDENCIA_POSITIVA: 'Tendência Positiva',
  INSTABILIDADE: 'Instabilidade',
};

export default function InsightsPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  const [insights, setInsights] = useState<Insights | null>(null);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);

  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [errorInsights, setErrorInsights] = useState('');
  const [errorTrends, setErrorTrends] = useState('');

  async function fetchInsights() {
    setLoadingInsights(true);
    setErrorInsights('');
    try {
      const { data } = await apiClient.post('/ai/insights', { mes, ano });
      setInsights(data);
    } catch (err: any) {
      setErrorInsights(err.response?.data?.message || 'Erro ao gerar diagnóstico.');
    } finally {
      setLoadingInsights(false);
    }
  }

  async function fetchTrends() {
    setLoadingTrends(true);
    setErrorTrends('');
    try {
      const { data } = await apiClient.post('/ai/trend-analysis', { mes, ano });
      setTrends(data);
    } catch (err: any) {
      setErrorTrends(err.response?.data?.message || 'Erro ao analisar tendências.');
    } finally {
      setLoadingTrends(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IA Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Diagnóstico e análise de tendências powered by GPT-4o</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            {mesesLabels.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostico */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Diagnóstico Executivo</h2>
            <button
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="btn-primary px-4 py-2 text-xs"
            >
              {loadingInsights ? 'Gerando...' : 'Gerar Diagnóstico'}
            </button>
          </div>

          {errorInsights && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
              {errorInsights}
            </div>
          )}

          {!insights && !loadingInsights && (
            <p className="text-sm text-gray-400 text-center py-8">
              Clique em "Gerar Diagnóstico" para obter análise do período selecionado
            </p>
          )}

          {loadingInsights && (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-400">Analisando dados...</p>
            </div>
          )}

          {insights && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Resumo Executivo</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{insights.resumo_executivo}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Top 3 Riscos</h3>
                <div className="space-y-2">
                  {insights.top3_riscos.map((r, i) => (
                    <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-900">{r.titulo}</p>
                      <p className="text-xs text-red-700 mt-1">{r.descricao}</p>
                      {r.kpis_afetados?.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">KPIs: {r.kpis_afetados.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Top 3 Oportunidades</h3>
                <div className="space-y-2">
                  {insights.top3_oportunidades.map((o, i) => (
                    <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900">{o.titulo}</p>
                      <p className="text-xs text-green-700 mt-1">{o.descricao}</p>
                      {o.kpis_afetados?.length > 0 && (
                        <p className="text-xs text-green-500 mt-1">KPIs: {o.kpis_afetados.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trend Analysis */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Análise de Tendências</h2>
            <button
              onClick={fetchTrends}
              disabled={loadingTrends}
              className="btn-primary px-4 py-2 text-xs"
            >
              {loadingTrends ? 'Analisando...' : 'Analisar Tendências'}
            </button>
          </div>

          {errorTrends && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
              {errorTrends}
            </div>
          )}

          {!trends && !loadingTrends && (
            <p className="text-sm text-gray-400 text-center py-8">
              Clique em "Analisar Tendências" para detectar padrões dos últimos 6 meses
            </p>
          )}

          {loadingTrends && (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-400">Detectando padrões...</p>
            </div>
          )}

          {trends && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Resumo do Período</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{trends.resumo_periodo}</p>
              </div>
              {trends.recomendacao_prioritaria && (
                <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-brand-green uppercase tracking-wide mb-1">Recomendação Prioritária</p>
                  <p className="text-sm text-gray-700">{trends.recomendacao_prioritaria}</p>
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Padrões Detectados</h3>
                <div className="space-y-2">
                  {trends.padroes.map((p, i) => (
                    <div key={i} className={cn('border rounded-lg p-3', severityColor[p.severidade])}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{tipoLabel[p.tipo] || p.tipo}</p>
                        <span className="text-xs font-semibold">{p.severidade}</span>
                      </div>
                      <p className="text-xs opacity-80">{p.descricao}</p>
                      {p.kpis_afetados?.length > 0 && (
                        <p className="text-xs opacity-60 mt-1">KPIs: {p.kpis_afetados.join(', ')}</p>
                      )}
                    </div>
                  ))}
                  {trends.padroes.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhum padrão detectado no período</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
