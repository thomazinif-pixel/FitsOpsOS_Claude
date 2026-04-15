'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { DashboardSummary } from '@/types';
import { ScoreCard } from '@/components/dashboard/score-card';
import { CategoryCard } from '@/components/dashboard/category-card';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { RankingChart } from '@/components/dashboard/ranking-chart';
import { AlertPanel } from '@/components/dashboard/alert-panel';
import { AiInsightsPanel } from '@/components/dashboard/ai-insights-panel';
import { LoadingPage } from '@/components/ui/spinner';
import { mesesLabels } from '@/lib/utils';

export default function DashboardPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/dashboard/summary?mes=${mes}&ano=${ano}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [mes, ano]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-500 text-sm mt-1">Visão consolidada da performance operacional</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
          >
            {mesesLabels.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
          >
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <LoadingPage /> : !data ? (
        <div className="text-center py-20 text-gray-400">
          <p>Sem dados para o período selecionado</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Score + Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-1">
              <ScoreCard
                score={data.scoreGeral}
                totalKpis={data.totalKpis}
                countGreen={data.countGreen}
                countYellow={data.countYellow}
                countRed={data.countRed}
              />
            </div>
            <div className="xl:col-span-4 grid grid-cols-2 xl:grid-cols-4 gap-4">
              {data.porCategoria.map((cat) => (
                <CategoryCard key={cat.categoria} data={cat} />
              ))}
            </div>
          </div>

          {/* Row 2: Trend Chart */}
          {data.tendencias?.length > 0 && <TrendChart tendencias={data.tendencias} />}

          {/* Row 3: Ranking */}
          {(data.rankingMelhores?.length > 0 || data.rankingPiores?.length > 0) && (
            <RankingChart melhores={data.rankingMelhores} piores={data.rankingPiores} />
          )}

          {/* Row 4: Alerts + AI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AlertPanel alertas={data.alertas || []} />
            <AiInsightsPanel mes={mes} ano={ano} />
          </div>
        </div>
      )}
    </div>
  );
}
