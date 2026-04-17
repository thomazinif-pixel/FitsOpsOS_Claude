'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { KPI } from '@/types';
import { KpiForm } from '@/components/kpis/kpi-form';
import { StatusBadge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/spinner';
import { formatValue, categoriaLabels, unidadeLabels } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export default function KpisPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [atoFilter, setAtoFilter] = useState('true');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KPI | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (catFilter) params.set('categoria', catFilter);
    if (atoFilter) params.set('ativo', atoFilter);
    const { data } = await apiClient.get(`/kpis?${params}`);
    setKpis(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [search, catFilter, atoFilter]);

  async function handleSave(formData: Partial<KPI>) {
    if (editing) {
      await apiClient.patch(`/kpis/${editing.id}`, formData);
    } else {
      await apiClient.post('/kpis', formData);
    }
    load();
  }

  async function handleDelete(kpi: KPI) {
    if (!confirm(`Desativar "${kpi.nome}"?`)) return;
    await apiClient.delete(`/kpis/${kpi.id}`);
    load();
  }

  const owners = Array.from(new Map(kpis.filter((k) => k.owner).map((k) => [k.owner!.id, k.owner!])).values());
  const departments = Array.from(new Map(kpis.filter((k) => k.department).map((k) => [k.department!.id, k.department!])).values());

  const visibleKpis = kpis.filter((kpi) => {
    if (ownerFilter && kpi.ownerId !== ownerFilter) return false;
    if (deptFilter && kpi.departmentId !== deptFilter) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de KPIs</h1>
          <p className="text-gray-500 text-sm mt-1">{visibleKpis.length} de {kpis.length} KPIs</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary">
            + Novo KPI
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="">Todas as categorias</option>
          {['CRESCIMENTO', 'EFICIENCIA', 'QUALIDADE', 'EXPERIENCIA'].map((c) => (
            <option key={c} value={c}>{categoriaLabels[c as keyof typeof categoriaLabels]}</option>
          ))}
        </select>
        <select
          value={atoFilter}
          onChange={(e) => setAtoFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
          <option value="">Todos</option>
        </select>
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="">Todos os responsáveis</option>
          {owners.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="">Todas as áreas</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </div>

      {loading ? <LoadingPage /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Mensal</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Direção</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsável</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Área</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Peso</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                {isAdmin && <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {visibleKpis.map((kpi) => {
                const lastAnalysis = kpi.analyses?.[0];
                return (
                  <tr key={kpi.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/kpis/${kpi.id}`} className="font-medium text-gray-900 hover:text-brand-green text-sm">
                        {kpi.nome}
                      </Link>
                      {kpi.descricao && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{kpi.descricao}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{categoriaLabels[kpi.categoria]}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatValue(kpi.metaMensal, kpi.unidade)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold ${kpi.direcao === 'UP' ? 'text-green-600' : 'text-blue-600'}`}>
                        {kpi.direcao === 'UP' ? '↑ UP' : '↓ DOWN'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{kpi.owner?.nome || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{kpi.department?.nome || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{kpi.peso}x</td>
                    <td className="px-4 py-3 text-center">
                      {lastAnalysis ? <StatusBadge status={lastAnalysis.status} /> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setEditing(kpi); setFormOpen(true); }}
                            className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                          >Editar</button>
                          <button
                            onClick={() => handleDelete(kpi)}
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                          >Desativar</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {visibleKpis.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">Nenhum KPI encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <KpiForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initial={editing} />
    </div>
  );
}
