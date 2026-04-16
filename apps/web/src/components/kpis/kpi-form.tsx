'use client';

import { useState, useEffect } from 'react';
import { KPI, User, Department } from '@/types';
import { Modal } from '@/components/ui/modal';
import apiClient from '@/lib/api-client';

interface KpiFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<KPI>) => Promise<void>;
  initial?: KPI | null;
}

const categorias = ['CRESCIMENTO', 'EFICIENCIA', 'QUALIDADE', 'EXPERIENCIA'];
const unidades = ['PERCENTUAL', 'DIAS', 'REAIS', 'QUANTIDADE'];
const direcoes = ['UP', 'DOWN'];

export function KpiForm({ open, onClose, onSave, initial }: KpiFormProps) {
  const [form, setForm] = useState({
    nome: '', descricao: '', categoria: 'CRESCIMENTO',
    unidade: 'PERCENTUAL', metaAnual: '', metaMensal: '',
    direcao: 'UP', peso: '1', ownerId: '', departmentId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (open) {
      apiClient.get('/users').then((r) => setUsers(r.data)).catch(() => {});
      apiClient.get('/departments').then((r) => setDepartments(r.data)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (initial) {
      setForm({
        nome: initial.nome, descricao: initial.descricao || '',
        categoria: initial.categoria, unidade: initial.unidade,
        metaAnual: String(initial.metaAnual), metaMensal: String(initial.metaMensal),
        direcao: initial.direcao, peso: String(initial.peso),
        ownerId: initial.ownerId || '', departmentId: initial.departmentId || '',
      });
    } else {
      setForm({ nome: '', descricao: '', categoria: 'CRESCIMENTO', unidade: 'PERCENTUAL', metaAnual: '', metaMensal: '', direcao: 'UP', peso: '1', ownerId: '', departmentId: '' });
    }
  }, [initial, open]);

  function handleOwnerChange(ownerId: string) {
    const selectedUser = users.find((u) => u.id === ownerId);
    setForm((f) => ({
      ...f,
      ownerId,
      departmentId: selectedUser?.departmentId || f.departmentId,
    }));
  }

  const ownerHasDept = !!users.find((u) => u.id === form.ownerId)?.departmentId;
  const deptNome = ownerHasDept
    ? departments.find((d) => d.id === form.departmentId)?.nome
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        metaAnual: parseFloat(form.metaAnual),
        metaMensal: parseFloat(form.metaMensal),
        peso: parseFloat(form.peso),
        ownerId: form.ownerId || undefined,
        departmentId: form.departmentId || undefined,
      } as any);
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar KPI.');
    } finally {
      setSaving(false);
    }
  }

  const field = (key: string) => ({
    value: (form as any)[key],
    onChange: (e: any) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green';
  const selectClass = inputClass + ' bg-white';
  const readonlyClass = 'w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-default';

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar KPI' : 'Novo KPI'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
            <input {...field('nome')} className={inputClass} required placeholder="Ex: Captação de Novos Clientes" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
            <textarea {...field('descricao')} className={inputClass} rows={2} placeholder="Descrição opcional" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoria *</label>
            <select {...field('categoria')} className={selectClass}>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade *</label>
            <select {...field('unidade')} className={selectClass}>
              {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meta Mensal *</label>
            <input {...field('metaMensal')} type="number" step="any" className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meta Anual *</label>
            <input {...field('metaAnual')} type="number" step="any" className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Direção *</label>
            <select {...field('direcao')} className={selectClass}>
              {direcoes.map((d) => <option key={d} value={d}>{d === 'UP' ? 'UP — Quanto maior, melhor' : 'DOWN — Quanto menor, melhor'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Peso</label>
            <input {...field('peso')} type="number" step="0.1" min="0.1" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Responsável (Owner)</label>
            <select
              value={form.ownerId}
              onChange={(e) => handleOwnerChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Sem responsável</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.nome} ({u.cargo})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Departamento / Área
              {ownerHasDept && <span className="ml-1 text-gray-400 font-normal">(herdado do responsável)</span>}
            </label>
            {ownerHasDept ? (
              <div className={readonlyClass}>
                {deptNome || '—'}
              </div>
            ) : (
              <select {...field('departmentId')} className={selectClass}>
                <option value="">Sem área</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Salvando...' : 'Salvar KPI'}</button>
        </div>
      </form>
    </Modal>
  );
}
