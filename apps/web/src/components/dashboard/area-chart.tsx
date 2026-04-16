'use client';

interface AreaItem {
  area: string;
  media: number | null;
}

function getColor(media: number | null): string {
  if (media === null) return 'bg-gray-200';
  if (media >= 90) return 'bg-green-500';
  if (media >= 70) return 'bg-yellow-400';
  return 'bg-red-500';
}

function getTextColor(media: number | null): string {
  if (media === null) return 'text-gray-400';
  if (media >= 90) return 'text-green-700';
  if (media >= 70) return 'text-yellow-700';
  return 'text-red-700';
}

export function AreaChart({ data }: { data: AreaItem[] }) {
  const filtered = data.filter((d) => d.media !== null);
  if (filtered.length === 0) return null;

  const max = Math.max(...filtered.map((d) => d.media as number), 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Performance por Área</h2>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.area} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-44 truncate shrink-0">{item.area}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getColor(item.media)}`}
                style={{ width: item.media !== null ? `${(item.media / max) * 100}%` : '0%' }}
              />
            </div>
            <span className={`text-sm font-semibold w-14 text-right ${getTextColor(item.media)}`}>
              {item.media !== null ? `${item.media}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
