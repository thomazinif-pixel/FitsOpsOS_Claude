'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { MonthlyInputKPI } from '@/types';
import { LoadingPage } from '@/components/ui/spinner';
import { formatValue, mesesLabels, categoriaLabels } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export default function InputMensalPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [kpis, setKpis] = useState<MonthlyInputKPI[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await apiClient.get(`/kpi-values/month?mes=${mes}&ano=${ano}`);
    setKpis(data);
    const initial: Record<string, string> = {};
    data.forEach((k: MonthlyInputKPI) => {
      if (k.values?.[0]) initial[k.id] = String(k.values[0].valorRealizado);
    });
    setValues(initial);
    setLoading(false);
  }

  useEffect(() => { load(); }, [mes, ano]);

  async function handleSaveAll() {
    setSaving(true);
    setSavedMsg('');
    try {
      const items = Object.entries(values)
        .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
        .map(([kpiId, v]) => ({ kpiId, mes, ano, valorRealizado: parseFloat(v) }));
      await apiClient.post('/kpi-values/bulk', { items });
      setSavedMsg(`${items.length} valores salvos com sucesso!`);
      setTimeout(() => setSavedMsg(''), 3000);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleCellBlur(kpiId: string) {
    const v = values[kpiId];
    if (v === '' || isNaN(parseFloat(v))) return;
    await apiClient.post('/kpi-values', { kpiId, mes, ano, valorRealizado: parseFloat(v) });
  }

  function getAtingimento(kpi: MonthlyInputKPI): number | null {
    const v = values[kpi.id];
    if (!v || isNaN(parseFloat(v))) return null;
    const val = parseFloat(v);
    if (kpi.direcao === 'UP') {
      if (kpi.metaMensal === 0) return null;
      return (val / kpi.metaMensal) * 100;
    }
    if (val === 0) return null;
    return (kpi.metaMensal / val) * 100;
  }

  const grouped = kpis.reduce((acc, k) => {
    if (!acc[k.categoria]) acc[k.categoria] = [];
    acc[k.categoria].push(k);
    return acc;
  }, {} as Record<string, MonthlyInputKPI[]>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Input Mensal</h1>
          <p className="text-gray-500 text-sm mt-1">Insira os valores realizados de cada KPI</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            {mesesLabels.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            {[2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {isAdmin && (
            <button onClick={handleSaveAll} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Salvar Tudo'}
            </button>
          )}
        </div>
      </div>

      {savedMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{savedMsg}</div>}

      {loading ? <LoadingPage /> : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catKpis]) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">{categoriaLabels[cat as keyof typeof categoriaLabels]}</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500">KPI</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Meta</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Realizado</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Diferença</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Atingimento</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {catKpis.map((kpi) => {
                    const ating = getAtingimento(kpi);
                    const statusColor = ating === null ? '' : ating >= 100 ? 'text-green-600' : ating >= 80 ? 'text-yellow-600' : 'text-red-600';
                    const diff = values[kpi.id] ? parseFloat(values[kpi.id]) - kpi.metaMensal : null;

                    return (
                      <tr key={kpi.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{kpi.nome}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{formatValue(kpi.metaMensal, kpi.unidade)}</td>
                        <td className="px-4 py-3 text-right">
                          {isAdmin ? (
                            <input
                              type="number"
                              step="any"
                              value={values[kpi.id] ?? ''}
                              onChange={(e) => setValues((v) => ({ ...v, [kpi.id]: e.target.value }))}
                              onBlur={() => handleCellBlur(kpi.id)}
                              className="w-32 text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                              placeholder="—"
                            />
                          ) : (
                            <span className="text-sm">{values[kpi.id] ? formatValue(parseFloat(values[kpi.id]), kpi.unidade) : '—'}</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right ${diff === null ? '' : diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diff !== null ? `${diff > 0 ? '+' : ''}${formatValue(diff, kpi.unidade)}` : '—'}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-bold ${statusColor}`}>
                          {ating !== null ? `${ating.toFixed(1)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ating === null ? <span className="text-gray-300">—</span> : (
                            <span className={`inline-block w-3 h-3 rounded-full ${ating >= 100 ? 'bg-green-500' : ating >= 80 ? 'bg-yellow-400' : 'bg-red-500'}`} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
