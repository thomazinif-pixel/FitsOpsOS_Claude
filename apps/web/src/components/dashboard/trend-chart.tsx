'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TendenciaSerie } from '@/types';
import { categoriaColors, categoriaLabels } from '@/lib/utils';

interface TrendChartProps {
  tendencias: TendenciaSerie[];
}

export function TrendChart({ tendencias }: TrendChartProps) {
  const allLabels = tendencias[0]?.series.map((s) => s.label) || [];

  const data = allLabels.map((label, idx) => {
    const point: any = { label };
    tendencias.forEach((t) => {
      point[t.categoria] = t.series[idx]?.media ?? null;
    });
    return point;
  });

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução Mensal por Categoria (últimos 6 meses)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 'dataMax + 10']} />
          <Tooltip formatter={(v: number) => [`${v?.toFixed(1)}%`, '']} />
          <Legend formatter={(v) => categoriaLabels[v as keyof typeof categoriaLabels] || v} />
          <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={80} stroke="#facc15" strokeDasharray="4 4" strokeWidth={1} />
          {tendencias.map((t) => (
            <Line
              key={t.categoria}
              type="monotone"
              dataKey={t.categoria}
              stroke={categoriaColors[t.categoria]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
