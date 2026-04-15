'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { Spinner } from '@/components/ui/spinner';

interface InsightsData {
  top3_riscos: { titulo: string; descricao: string; kpis_afetados: string[] }[];
  top3_oportunidades: { titulo: string; descricao: string; kpis_afetados: string[] }[];
  resumo_executivo: string;
}

export function AiInsightsPanel({ mes, ano }: { mes: number; ano: number }) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/ai/insights', { mes, ano });
      setInsights(data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao gerar insights. Verifique a chave OpenAI.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Análise Inteligente</h3>
          <p className="text-xs text-gray-400 mt-0.5">Gerado por IA com base nos KPIs do período</p>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Spinner className="w-4 h-4" /> : <span>✦</span>}
          {loading ? 'Gerando...' : 'Gerar Insights IA'}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-3">{error}</div>}

      {insights && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Resumo Executivo</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{insights.resumo_executivo}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Riscos */}
            <div>
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Top 3 Riscos</h4>
              <div className="space-y-2">
                {insights.top3_riscos.map((r, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">{r.titulo}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{r.descricao}</p>
                    {r.kpis_afetados?.length > 0 && (
                      <p className="text-xs text-red-500 mt-1">KPIs: {r.kpis_afetados.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Oportunidades */}
            <div>
              <h4 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Top 3 Oportunidades</h4>
              <div className="space-y-2">
                {insights.top3_oportunidades.map((o, i) => (
                  <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">{o.titulo}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{o.descricao}</p>
                    {o.kpis_afetados?.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">KPIs: {o.kpis_afetados.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!insights && !loading && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">✦</div>
          <p className="text-sm">Clique em "Gerar Insights IA" para analisar os dados do período</p>
        </div>
      )}
    </div>
  );
}
