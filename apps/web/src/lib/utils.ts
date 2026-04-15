import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StatusKPI, Tendencia, Categoria, Unidade, StatusPlano } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValue(value: number, unidade: Unidade): string {
  if (unidade === 'REAIS') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  }
  if (unidade === 'PERCENTUAL') return `${value}%`;
  if (unidade === 'DIAS') return `${value} dias`;
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const statusColors: Record<StatusKPI, string> = {
  GREEN:  'status-green',
  YELLOW: 'status-yellow',
  RED:    'status-red',
};

export const statusLabels: Record<StatusKPI, string> = {
  GREEN:  'No Alvo',
  YELLOW: 'Atenção',
  RED:    'Crítico',
};

export const tendenciaIcons: Record<Tendencia, string> = {
  UP:     '↑',
  DOWN:   '↓',
  STABLE: '→',
};

export const categoriaLabels: Record<Categoria, string> = {
  CRESCIMENTO: 'Crescimento',
  EFICIENCIA:  'Eficiência',
  QUALIDADE:   'Qualidade',
  EXPERIENCIA: 'Experiência',
};

export const unidadeLabels: Record<Unidade, string> = {
  PERCENTUAL: '%',
  DIAS:       'dias',
  REAIS:      'R$',
  QUANTIDADE: 'qtd',
};

export const statusPlanoColors: Record<StatusPlano, string> = {
  PENDENTE:     'bg-gray-100 text-gray-700',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  CONCLUIDO:    'bg-green-100 text-green-700',
  CANCELADO:    'bg-red-100 text-red-700',
};

export const statusPlanoLabels: Record<StatusPlano, string> = {
  PENDENTE:     'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO:    'Concluído',
  CANCELADO:    'Cancelado',
};

export const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const categoriaColors: Record<Categoria, string> = {
  CRESCIMENTO: '#3b82f6',
  EFICIENCIA:  '#8b5cf6',
  QUALIDADE:   '#f59e0b',
  EXPERIENCIA: '#06b6d4',
};
