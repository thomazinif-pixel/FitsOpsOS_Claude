'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface ScoreCardProps {
  score: number;
  totalKpis: number;
  countGreen: number;
  countYellow: number;
  countRed: number;
}

export function ScoreCard({ score, totalKpis, countGreen, countYellow, countRed }: ScoreCardProps) {
  const color = score >= 100 ? '#16a34a' : score >= 80 ? '#facc15' : '#dc2626';
  const data = [{ value: Math.min(score, 100), fill: color }];

  return (
    <div className="card flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Score Geral</h3>
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score.toFixed(1)}%</span>
          <span className="text-xs text-gray-400">{totalKpis} KPIs</span>
        </div>
      </div>
      <div className="flex gap-4 mt-3">
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">{countGreen}</div>
          <div className="text-xs text-gray-500">No Alvo</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-500">{countYellow}</div>
          <div className="text-xs text-gray-500">Atenção</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-600">{countRed}</div>
          <div className="text-xs text-gray-500">Crítico</div>
        </div>
      </div>
    </div>
  );
}
