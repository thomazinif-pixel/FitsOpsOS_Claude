'use client';

import { HeatmapKPI } from '@/types';
import { cn } from '@/lib/utils';

const statusClass: Record<string, string> = {
  GREEN: 'bg-green-400',
  YELLOW: 'bg-yellow-400',
  RED: 'bg-red-400',
};

export function Heatmap({ data }: { data: HeatmapKPI[] }) {
  if (!data || data.length === 0) return null;

  const months = data[0]?.cells.map((c) => c.label) ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-x-auto">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Heatmap Executivo (KPI × Mês)</h2>
      <table className="text-xs min-w-full">
        <thead>
          <tr>
            <th className="text-left text-gray-500 font-medium pr-4 py-1 w-40">KPI</th>
            {months.map((m) => (
              <th key={m} className="text-center text-gray-500 font-medium px-2 py-1 min-w-[56px]">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row) => (
            <tr key={row.kpiId} className="hover:bg-gray-50">
              <td className="pr-4 py-1.5 text-gray-700 font-medium truncate max-w-[160px]" title={row.kpiNome}>
                {row.kpiNome}
              </td>
              {row.cells.map((cell) => (
                <td key={cell.label} className="px-2 py-1.5 text-center">
                  <div
                    className={cn(
                      'inline-flex items-center justify-center w-12 h-7 rounded text-white text-xs font-semibold',
                      cell.status ? statusClass[cell.status] : 'bg-gray-100 text-gray-400',
                    )}
                    title={cell.percentual !== null ? `${cell.percentual}%` : 'sem dado'}
                  >
                    {cell.percentual !== null ? `${Math.round(cell.percentual)}%` : '—'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-400" /> Verde ≥ 90%
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-400" /> Amarelo 70–89%
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-400" /> Vermelho {'<'} 70%
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Sem dado
        </div>
      </div>
    </div>
  );
}
