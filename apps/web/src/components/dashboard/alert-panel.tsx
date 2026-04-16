import Link from 'next/link';
import { AlertItem, AlertaQuedaItem } from '@/types';
import { tendenciaIcons, categoriaLabels } from '@/lib/utils';

interface Props {
  alertas: AlertItem[];
  alertasQueda?: AlertaQuedaItem[];
}

export function AlertPanel({ alertas, alertasQueda }: Props) {
  const hasQueda = alertasQueda && alertasQueda.length > 0;

  if (alertas.length === 0 && !hasQueda) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Alertas</h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">✓</div>
          <p className="text-sm text-gray-500">Nenhum KPI em estado crítico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Alertas Críticos
          <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{alertas.length}</span>
        </h3>
        <Link href="/performance" className="text-xs text-brand-green hover:underline">Ver todos →</Link>
      </div>
      <div className="space-y-2">
        {alertas.map((a) => (
          <div key={a.kpiId} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{a.nome}</p>
              <p className="text-xs text-gray-500">{categoriaLabels[a.categoria]}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-red-600">{a.percentualAtingimento.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">{tendenciaIcons[a.tendencia]}</p>
            </div>
          </div>
        ))}
      </div>

      {hasQueda && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">
            Queda Consecutiva (3 meses)
          </h4>
          <div className="space-y-1.5">
            {alertasQueda!.map((a) => (
              <div key={a.kpiId} className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-100 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-900 truncate flex-1">{a.nome}</p>
                <span className="text-xs text-orange-600 font-medium">↘ 3 meses</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
