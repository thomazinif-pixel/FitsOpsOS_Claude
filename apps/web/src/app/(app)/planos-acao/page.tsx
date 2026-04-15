'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { ActionPlan, KPI } from '@/types';
import { PlanoBadge, AIBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { LoadingPage, Spinner } from '@/components/ui/spinner';
import { categoriaLabels } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PlanosAcaoPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const now = new Date();

  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpiFilter, setKpiFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ActionPlan | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiKpiId, setAiKpiId] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ kpiId: '', descricao: '', responsavel: '', prazo: '', status: 'PENDENTE', impactoEstimado: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (kpiFilter) params.set('kpiId', kpiFilter);
    if (statusFilter) params.set('status', statusFilter);
    const [plansRes, kpisRes] = await Promise.all([
      apiClient.get(`/action-plans?${params}`),
      apiClient.get('/kpis?ativo=true'),
    ]);
    setPlans(plansRes.data);
    setKpis(kpisRes.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [kpiFilter, statusFilter]);

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await apiClient.patch(`/action-plans/${editing.id}`, form);
      } else {
        await apiClient.post('/action-plans', form);
      }
      setFormOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este plano de ação?')) return;
    await apiClient.delete(`/action-plans/${id}`);
    load();
  }

  async function openAiSuggestions(kpiId: string) {
    setAiKpiId(kpiId);
    setAiSuggestions([]);
    setAiModalOpen(true);
    setAiLoading(true);
    try {
      const { data } = await apiClient.post('/ai/action-suggestions', { kpiId, mes: now.getMonth() + 1, ano: now.getFullYear() });
      setAiSuggestions(data.planos || []);
    } catch {
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  }

  async function saveSuggestion(suggestion: any) {
    await apiClient.post('/action-plans', {
      kpiId: aiKpiId,
      descricao: suggestion.descricao,
      responsavel: suggestion.responsavel,
      prazo: suggestion.prazo,
      impactoEstimado: suggestion.impacto_estimado,
      aiGenerated: true,
    });
    load();
  }

  function openForm(plan?: ActionPlan) {
    setEditing(plan || null);
    setForm(plan ? {
      kpiId: plan.kpiId, descricao: plan.descricao, responsavel: plan.responsavel,
      prazo: plan.prazo.split('T')[0], status: plan.status, impactoEstimado: plan.impactoEstimado || '',
    } : { kpiId: '', descricao: '', responsavel: '', prazo: '', status: 'PENDENTE', impactoEstimado: '' });
    setFormOpen(true);
  }

  const statusOptions = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos de Ação</h1>
          <p className="text-gray-500 text-sm mt-1">{plans.length} planos cadastrados</p>
        </div>
        {isAdmin && <button onClick={() => openForm()} className="btn-primary">+ Novo Plano</button>}
      </div>

      <div className="flex gap-3 mb-6">
        <select value={kpiFilter} onChange={(e) => setKpiFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none w-64">
          <option value="">Todos os KPIs</option>
          {kpis.map((k) => <option key={k.id} value={k.id}>{k.nome}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">Todos os status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {loading ? <LoadingPage /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">KPI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Responsável</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Prazo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                {isAdmin && <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{plan.kpi?.nome}</p>
                    {plan.kpi?.categoria && <p className="text-xs text-gray-400">{categoriaLabels[plan.kpi.categoria]}</p>}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm text-gray-700 truncate">{plan.descricao}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {plan.aiGenerated && <AIBadge />}
                      {plan.impactoEstimado && <p className="text-xs text-gray-400">{plan.impactoEstimado}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{plan.responsavel}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {format(new Date(plan.prazo), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-center"><PlanoBadge status={plan.status} /></td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openForm(plan)} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100">Editar</button>
                        {plan.kpiId && (
                          <button onClick={() => openAiSuggestions(plan.kpiId)} className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50">✦ IA</button>
                        )}
                        <button onClick={() => handleDelete(plan.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Excluir</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {plans.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Nenhum plano de ação cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar Plano de Ação' : 'Novo Plano de Ação'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">KPI *</label>
            <select value={form.kpiId} onChange={(e) => setForm(f => ({ ...f, kpiId: e.target.value }))} className={inputClass + ' bg-white'} required>
              <option value="">Selecione um KPI</option>
              {kpis.map((k) => <option key={k.id} value={k.id}>{k.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
            <textarea value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} className={inputClass} rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Responsável *</label>
              <input value={form.responsavel} onChange={(e) => setForm(f => ({ ...f, responsavel: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prazo *</label>
              <input type="date" value={form.prazo} onChange={(e) => setForm(f => ({ ...f, prazo: e.target.value }))} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={inputClass + ' bg-white'}>
                {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Impacto Estimado</label>
              <input value={form.impactoEstimado} onChange={(e) => setForm(f => ({ ...f, impactoEstimado: e.target.value }))} className={inputClass} placeholder="Ex: +10% no atingimento" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setFormOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      </Modal>

      {/* AI Suggestions Modal */}
      <Modal open={aiModalOpen} onClose={() => setAiModalOpen(false)} title="Sugestões de Planos de Ação via IA" size="lg">
        {aiLoading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Spinner className="w-8 h-8" />
            <p className="text-gray-500 text-sm">Analisando KPI e gerando sugestões...</p>
          </div>
        ) : aiSuggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Nenhuma sugestão disponível</div>
        ) : (
          <div className="space-y-4">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="border border-purple-100 bg-purple-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">{s.descricao}</p>
                <div className="flex gap-4 text-xs text-gray-600 mb-2">
                  <span>Responsável: <b>{s.responsavel}</b></span>
                  <span>Prazo: <b>{s.prazo}</b></span>
                </div>
                {s.impacto_estimado && <p className="text-xs text-purple-700 mb-3">Impacto: {s.impacto_estimado}</p>}
                <button onClick={() => { saveSuggestion(s); setAiModalOpen(false); }} className="btn-primary text-xs py-1.5">
                  Salvar este plano
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
