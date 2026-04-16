'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { User, Role, Cargo, Department } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'VIEWER'];
const CARGOS: Cargo[] = ['COO', 'MANAGER', 'ANALYST'];

type ModalMode = 'create' | 'edit' | null;

interface FormData {
  nome: string;
  email: string;
  password: string;
  role: Role;
  cargo: Cargo;
  departmentId: string;
}

const defaultForm: FormData = { nome: '', email: '', password: '', role: 'VIEWER', cargo: 'ANALYST', departmentId: '' };

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
    )}>
      {status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    VIEWER: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', colors[role] ?? colors.VIEWER)}>
      {role}
    </span>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modal, setModal] = useState<ModalMode>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/departments'),
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    if (filterStatus && u.status !== filterStatus) return false;
    if (filterRole && u.role !== filterRole) return false;
    return true;
  });

  function openCreate() {
    setForm(defaultForm);
    setEditingUser(null);
    setError('');
    setModal('create');
  }

  function openEdit(u: User) {
    setForm({ nome: u.nome, email: u.email, password: '', role: u.role, cargo: u.cargo, departmentId: u.departmentId || '' });
    setEditingUser(u);
    setError('');
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditingUser(null);
    setError('');
  }

  async function handleSave() {
    if (!form.departmentId) {
      setError('Selecione um departamento.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (modal === 'create') {
        await apiClient.post('/users', payload);
        flash('Usuário criado com sucesso!');
      } else if (modal === 'edit' && editingUser) {
        const { password, ...rest } = payload;
        await apiClient.patch(`/users/${editingUser.id}`, rest);
        flash('Usuário atualizado!');
      }
      closeModal();
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(u: User) {
    const newStatus = u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await apiClient.patch(`/users/${u.id}/status`, { status: newStatus });
      flash(`Usuário ${newStatus === 'ACTIVE' ? 'ativado' : 'bloqueado'}!`);
      load();
    } catch {
      flash('Erro ao alterar status.');
    }
  }

  async function resetPassword(u: User) {
    if (!confirm(`Resetar senha de ${u.nome} para "Fitbank@2026"?`)) return;
    try {
      await apiClient.post(`/users/${u.id}/reset-password`);
      flash('Senha resetada para: Fitbank@2026');
    } catch {
      flash('Erro ao resetar senha.');
    }
  }

  function flash(message: string) {
    setMsg(message);
    setTimeout(() => setMsg(''), 3500);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de acesso e permissões</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm">
            + Novo Usuário
          </button>
        )}
      </div>

      {msg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="BLOCKED">Bloqueados</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="">Todos os papéis</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Cargo</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Área</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Último Login</th>
                {isAdmin && <th className="text-right px-4 py-3 text-gray-600 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.cargo}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.department?.nome || '—'}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleString('pt-BR') : '—'}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleStatus(u)}
                        className={cn('text-xs font-medium', u.status === 'ACTIVE' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800')}
                      >
                        {u.status === 'ACTIVE' ? 'Bloquear' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => resetPassword(u)}
                        className="text-xs text-gray-500 hover:text-gray-800 font-medium"
                      >
                        Reset Senha
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  placeholder="nome@fitbank.com"
                />
              </div>
              {modal === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <select
                    value={form.cargo}
                    onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value as Cargo }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                  >
                    {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                >
                  <option value="" disabled>Selecione o departamento</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 py-2 text-sm"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
