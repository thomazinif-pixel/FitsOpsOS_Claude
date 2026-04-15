'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { KPI } from '@/types';
import { StatusBadge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/spinner';
import { formatValue, categoriaLabels, mesesLabels, tendenciaIcons } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function KpiDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/kpis/${id}`)
      .then((r) => setKpi(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (!kpi) return <div className="p-8 text-gray-500">KPI não encontrado</div>;

  const chartData = (kpi.analyses || [])
    .sort((a, b) => a.ano === b.ano ? a.mes - b.mes : a.ano - b.ano)
    .map((a) => ({
      label: `${mesesLabels[a.mes - 1]}/${a.ano}`,
      atingimento: a.percentualAtingimento,
      status: a.status,
    }));

  return (
    <div className="p-8">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
        ← Voltar
      </button>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{kpi.nome}</h1>
          <p className="text-gray-500 text-sm mt-1">{categoriaLabels[kpi.categoria]} · Meta mensal: {formatValue(kpi.metaMensal, kpi.unidade)} · Direção: {kpi.direcao}</p>
        </div>
        {kpi.analyses?.[0] && <StatusBadge status={kpi.analyses[0].status} />}
      </div>

      {/* History Chart */}
      {chartData.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Histórico de Atingimento</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Atingimento']} />
              <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="4 4" />
              <ReferenceLine y={80} stroke="#facc15" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="atingimento" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analyses table */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Análises Mensais</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-xs text-gray-500">Mês/Ano</th>
            <th className="text-right py-2 px-3 text-xs text-gray-500">Atingimento</th>
            <th className="text-center py-2 px-3 text-xs text-gray-500">Status</th>
            <th className="text-center py-2 px-3 text-xs text-gray-500">Tendência</th>
          </tr></thead>
          <tbody>
            {(kpi.analyses || []).map((a) => (
              <tr key={a.id} className="border-b border-gray-50">
                <td className="py-2 px-3 font-medium">{mesesLabels[a.mes - 1]}/{a.ano}</td>
                <td className="py-2 px-3 text-right font-bold">{a.percentualAtingimento.toFixed(1)}%</td>
                <td className="py-2 px-3 text-center"><StatusBadge status={a.status} /></td>
                <td className="py-2 px-3 text-center text-lg">{tendenciaIcons[a.tendencia]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Plans */}
      {(kpi.actionPlans || []).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Planos de Ação Vinculados</h3>
          <div className="space-y-2">
            {kpi.actionPlans!.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex-1">{p.descricao}</div>
                <div className="text-gray-500 text-xs">{p.responsavel}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
