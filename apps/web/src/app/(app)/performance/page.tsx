'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { KPIAnalysis } from '@/types';
import { StatusBadge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/spinner';
import { mesesLabels, categoriaLabels, tendenciaIcons, formatPercent } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function PerformancePage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [analyses, setAnalyses] = useState<KPIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, any[]>>({});

  async function load() {
    setLoading(true);
    const { data } = await apiClient.get(`/analysis?mes=${mes}&ano=${ano}`);
    setAnalyses(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [mes, ano]);
  useEffect(() => { setHistory({}); }, [ano]);

  async function loadHistory(kpiId: string) {
    if (history[kpiId]) return;
    const { data } = await apiClient.get(`/analysis/kpi/${kpiId}?ano=${ano}`);
    const chartData = data.map((a: KPIAnalysis) => ({
      label: mesesLabels[a.mes - 1],
      atingimento: a.percentualAtingimento,
    }));
    setHistory((h) => ({ ...h, [kpiId]: chartData }));
  }

  function toggleExpand(kpiId: string) {
    if (expanded === kpiId) {
      setExpanded(null);
    } else {
      setExpanded(kpiId);
      loadHistory(kpiId);
    }
  }

  const owners = Array.from(new Map(analyses.filter((a) => a.kpi?.owner).map((a) => [a.kpi!.owner!.id, a.kpi!.owner!])).values());
  const departments = Array.from(new Map(analyses.filter((a) => a.kpi?.department).map((a) => [a.kpi!.department!.id, a.kpi!.department!])).values());

  const filtered = analyses.filter((a) => {
    if (catFilter && a.kpi?.categoria !== catFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (ownerFilter && a.kpi?.owner?.id !== ownerFilter) return false;
    if (deptFilter && a.kpi?.department?.id !== deptFilter) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análise de Performance</h1>
          <p className="text-gray-500 text-sm mt-1">Atingimento e semáforo por KPI</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            {mesesLabels.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            {[2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">Todas as categorias</option>
          {['CRESCIMENTO', 'EFICIENCIA', 'QUALIDADE', 'EXPERIENCIA'].map((c) => (
            <option key={c} value={c}>{categoriaLabels[c as keyof typeof categoriaLabels]}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">Todos os status</option>
          <option value="GREEN">No Alvo</option>
          <option value="YELLOW">Atenção</option>
          <option value="RED">Crítico</option>
        </select>
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">Todos os responsáveis</option>
          {owners.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">Todas as áreas</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </div>

      {loading ? <LoadingPage /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">KPI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsável</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Área</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Atingimento</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tendência</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Histórico</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <>
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{a.kpi?.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.kpi ? categoriaLabels[a.kpi.categoria] : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{a.kpi?.owner?.nome || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.kpi?.department?.nome || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(a.percentualAtingimento, 100)}%`,
                              background: a.status === 'GREEN' ? '#16a34a' : a.status === 'YELLOW' ? '#facc15' : '#dc2626'
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-14 text-right">{formatPercent(a.percentualAtingimento)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-center text-xl">{tendenciaIcons[a.tendencia]}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExpand(a.kpiId)}
                        className="text-xs text-brand-green hover:underline"
                      >
                        {expanded === a.kpiId ? 'Fechar ▲' : 'Ver ▼'}
                      </button>
                    </td>
                  </tr>
                  {expanded === a.kpiId && (
                    <tr key={`${a.id}-detail`} className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-4">
                        {history[a.kpiId] ? (
                          <ResponsiveContainer width="100%" height={140}>
                            <LineChart data={history[a.kpiId]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                              <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                              <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="3 3" />
                              <ReferenceLine y={80} stroke="#facc15" strokeDasharray="3 3" />
                              <Line type="monotone" dataKey="atingimento" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-gray-400 text-sm">Carregando histórico...</div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Nenhum dado encontrado para o período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
