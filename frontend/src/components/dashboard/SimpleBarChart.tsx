"use client";

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface SimpleBarChartProps {
  data: Array<any>;
  bars: Array<{ dataKey: string; color: string; name: string }>;
  xAxisKey: string;
  height?: number;
}

export function SimpleBarChart({ data, bars, xAxisKey, height = 300 }: SimpleBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dx={-10}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Monto']}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {bars.map((bar, idx) => (
            <Bar 
              key={idx} 
              dataKey={bar.dataKey} 
              fill={bar.color} 
              name={bar.name} 
              radius={[4, 4, 0, 0]} 
              barSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
