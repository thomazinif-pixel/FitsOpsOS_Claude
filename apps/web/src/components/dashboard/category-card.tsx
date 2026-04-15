import { CategorySummary } from '@/types';
import { categoriaLabels, categoriaColors } from '@/lib/utils';

interface CategoryCardProps {
  data: CategorySummary;
}

export function CategoryCard({ data }: CategoryCardProps) {
  const color = data.mediaAtingimento >= 100 ? '#16a34a' : data.mediaAtingimento >= 80 ? '#facc15' : '#dc2626';
  const catColor = categoriaColors[data.categoria];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 rounded-full" style={{ background: catColor }} />
          <h3 className="text-sm font-semibold text-gray-700">{categoriaLabels[data.categoria]}</h3>
        </div>
        <span className="text-2xl font-bold" style={{ color }}>{data.mediaAtingimento.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${Math.min(data.mediaAtingimento, 100)}%`, background: color }}
        />
      </div>
      <div className="flex gap-3 text-xs text-gray-500">
        <span className="text-green-600 font-medium">{data.green} ✓</span>
        <span className="text-yellow-600 font-medium">{data.yellow} !</span>
        <span className="text-red-600 font-medium">{data.red} ✗</span>
        <span className="ml-auto">{data.total} KPIs</span>
      </div>
    </div>
  );
}
