import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CollectionFunnelProps {
  collected: number;
  pending: number;
}

export function CollectionFunnel({ collected, pending }: CollectionFunnelProps) {
  const data = [
    { name: 'Cobrado', value: collected, color: '#10B981' },
    { name: 'Por Cobrar', value: pending, color: '#FCD34D' },
  ];

  const total = collected + pending;
  const collectedPct = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <div className="relative h-full w-full min-h-[250px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: any) => `$${Number(value).toLocaleString()}`}
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-3xl font-black text-slate-800 dark:text-white">{collectedPct}%</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sano</span>
      </div>
    </div>
  );
}
