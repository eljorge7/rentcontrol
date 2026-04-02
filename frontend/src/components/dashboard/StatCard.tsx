import React from 'react';

import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    rawPct?: number; // Ej. 12.5%
  };
  subtitle?: string;
  sparklineData?: any[]; // [{val: 10}, {val: 20}]
}

export function StatCard({ title, value, icon, trend, subtitle, sparklineData }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      
      {/* Sparkline Background */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute right-0 bottom-0 w-32 h-16 opacity-30 group-hover:opacity-60 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke={trend?.isPositive ? "#10B981" : "#F43F5E"} 
                fill={trend?.isPositive ? "#10B981" : "#F43F5E"} 
                strokeWidth={2}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 p-2.5 rounded-xl shadow-inner">{icon}</div>}
      </div>
      
      <div className="relative z-10 mt-auto">
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
        
        <div className="mt-3 flex items-center gap-2 text-sm">
          {trend && (
            <span className={`font-bold flex items-center px-2 py-0.5 rounded text-xs ${trend.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
              {trend.isPositive ? (
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {trend.rawPct ? `${trend.rawPct.toFixed(1)}% ` : ''}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-400 font-medium truncate max-w-[150px]">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
