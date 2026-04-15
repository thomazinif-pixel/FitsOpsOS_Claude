'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { RankingItem } from '@/types';

interface RankingChartProps {
  melhores: RankingItem[];
  piores: RankingItem[];
}

function getBarColor(status: string) {
  if (status === 'GREEN') return '#16a34a';
  if (status === 'YELLOW') return '#facc15';
  return '#dc2626';
}

function shortName(nome: string) {
  return nome.length > 20 ? nome.substring(0, 18) + '...' : nome;
}

export function RankingChart({ melhores, piores }: RankingChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 5 — Melhores KPIs</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={melhores} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 'dataMax + 5']} />
            <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} tickFormatter={shortName} width={120} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Atingimento']} />
            <Bar dataKey="percentualAtingimento" radius={[0, 4, 4, 0]}>
              {melhores.map((entry, idx) => <Cell key={idx} fill={getBarColor(entry.status)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 5 — KPIs Críticos</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={piores} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 'dataMax + 5']} />
            <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} tickFormatter={shortName} width={120} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Atingimento']} />
            <Bar dataKey="percentualAtingimento" radius={[0, 4, 4, 0]}>
              {piores.map((entry, idx) => <Cell key={idx} fill={getBarColor(entry.status)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
