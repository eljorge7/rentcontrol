'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Database, MessageCircle, Home, XCircle, Cpu, HardDrive, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface SystemHealth {
  timestamp: string;
  hardware: {
    cpuUsagePerc: number;
    coreCount: number;
    memUsagePerc: number;
    totalMemGB: string;
    usedMemGB: string;
    osUptimeSec: number;
    nodeUptimeSec: number;
    processMemMB: string;
  };
  services: {
    rentControl: { status: string; latencyMs: number; label: string };
    facturaPro: { status: string; latencyMs: number; label: string };
    omniChat: { status: string; latencyMs: number; label: string };
  };
}

export default function InfrastructureDashboard() {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    try {
      const response = await api.get('/infrastructure/health');
      setData(response.data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Error al conectar con la API de Telemetría MAJIA.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor(seconds % (3600 * 24) / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
      if (status === 'ONLINE') return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      if (status === 'OFFLINESQL') return 'text-orange-500 bg-orange-50 border-orange-200';
      return 'text-red-500 bg-red-50 border-red-200';
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto transition-all duration-300 min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 flex items-center justify-center bg-slate-900 rounded-xl shadow-md">
                 <Activity className="h-5 w-5 text-emerald-400" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">MAJIA Network NOC</h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Control y Observabilidad del Servidor</p>
             </div>
          </div>
        </div>
        
        {data && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-600">
                <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />
                Validado: {new Date(data.timestamp).toLocaleTimeString()}
            </div>
        )}
      </div>

      {loading && !data && (
          <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
      )}

      {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center mb-6 shadow-sm">
              <XCircle className="h-5 w-5 mr-3" />
              <span className="font-bold">{error}</span>
          </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* HARDWARE GAUGES */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* CPU Gauge */}
                <div className="bg-white border flex flex-col items-center justify-center border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform origin-left transition-transform duration-1000 scale-x-100 opacity-90"></div>
                    <div className="flex w-full justify-between items-start mb-6">
                        <div>
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-indigo-500" /> Rendimiento CPU
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Instancias de Nucleos ({data.hardware.coreCount} Cores)</p>
                        </div>
                    </div>
                    
                    <div className="relative w-48 h-48 mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" className="text-slate-100" strokeWidth="20" stroke="currentColor" fill="transparent" />
                            <circle 
                                cx="96" cy="96" r="80" 
                                className={`${data.hardware.cpuUsagePerc > 80 ? 'text-red-500' : 'text-indigo-500'} transition-all duration-1000 ease-out`} 
                                strokeWidth="20" stroke="currentColor" fill="transparent" 
                                strokeDasharray={2 * Math.PI * 80} 
                                strokeDashoffset={2 * Math.PI * 80 * (1 - data.hardware.cpuUsagePerc / 100)} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-800">{data.hardware.cpuUsagePerc}%</span>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Carga</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-50 rounded-xl p-3 flex justify-between items-center px-4 transition-colors group-hover:bg-indigo-50/50">
                        <span className="text-xs font-bold text-slate-500">Node JS Process:</span>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{data.hardware.processMemMB} MB RAM</span>
                    </div>
                </div>

                {/* RAM Gauge */}
                <div className="bg-white border flex flex-col items-center justify-center border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="flex w-full justify-between items-start mb-6">
                        <div>
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-emerald-500" /> Memoria de Sistema
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">VPS Alocado ({data.hardware.totalMemGB} GB Total)</p>
                        </div>
                    </div>
                    
                    <div className="relative w-48 h-48 mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" className="text-slate-100" strokeWidth="20" stroke="currentColor" fill="transparent" />
                            <circle 
                                cx="96" cy="96" r="80" 
                                className={`${data.hardware.memUsagePerc > 85 ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} 
                                strokeWidth="20" stroke="currentColor" fill="transparent" 
                                strokeDasharray={2 * Math.PI * 80} 
                                strokeDashoffset={2 * Math.PI * 80 * (1 - data.hardware.memUsagePerc / 100)} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-800">{data.hardware.memUsagePerc}%</span>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Uso</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-50 rounded-xl p-3 flex justify-between items-center px-4 transition-colors group-hover:bg-emerald-50/50">
                        <span className="text-xs font-bold text-slate-500">Memoria Llena:</span>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{data.hardware.usedMemGB} GB / {data.hardware.totalMemGB} GB</span>
                    </div>
                </div>

            </div>

            {/* MICROSERVICES PING STATUS */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                    <div className="absolute -top-10 -right-10 opacity-[0.07] group-hover:opacity-10 transition-opacity">
                        <Server className="w-40 h-40 text-slate-100" />
                    </div>
                    <h3 className="font-bold tracking-wide text-slate-400 text-xs uppercase mb-1">Host del Servidor</h3>
                    <h2 className="text-2xl font-black text-white">{formatUptime(data.hardware.osUptimeSec)} <span className="text-sm font-medium text-emerald-400">UP</span></h2>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between">
                        <div>
                           <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Node.js Máster</p>
                           <p className="text-sm font-medium text-slate-300">{formatUptime(data.hardware.nodeUptimeSec)} online</p>
                        </div>
                    </div>
                </div>

                <h3 className="font-black text-slate-800 mt-2 mb-1 px-1 flex items-center justify-between text-sm uppercase tracking-wide">
                   Clúster de Aplicaciones
                </h3>

                {/* RentControl Card */}
                <div className={`p-4 rounded-2xl border bg-white shadow-sm flex items-center justify-between transition-all ${data.services.rentControl.status === 'ONLINE' ? 'border-emerald-200 hover:border-emerald-300' : 'border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(data.services.rentControl.status)}`}>
                            <Home className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800">{data.services.rentControl.label}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">radiotecpro.com</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${data.services.rentControl.status === 'ONLINE' ? 'text-emerald-500' : (data.services.rentControl.status === 'OFFLINESQL' ? 'text-orange-500' : 'text-red-500')}`}>
                            {data.services.rentControl.status === 'ONLINE' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                            {data.services.rentControl.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-1">{data.services.rentControl.latencyMs}ms</span>
                    </div>
                </div>

                {/* FacturaPro Card */}
                <div className={`p-4 rounded-2xl border bg-white shadow-sm flex items-center justify-between transition-all ${data.services.facturaPro.status === 'ONLINE' ? 'border-emerald-200 hover:border-emerald-300' : 'border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(data.services.facturaPro.status)}`}>
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800">{data.services.facturaPro.label}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">facturapro.radiotecpro.com</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${data.services.facturaPro.status === 'ONLINE' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {data.services.facturaPro.status === 'ONLINE' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                            {data.services.facturaPro.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-1">{data.services.facturaPro.latencyMs}ms</span>
                    </div>
                </div>

                {/* OmniChat Card */}
                <div className={`p-4 rounded-2xl border bg-white shadow-sm flex items-center justify-between transition-all ${data.services.omniChat.status === 'ONLINE' ? 'border-emerald-200 hover:border-emerald-300' : 'border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(data.services.omniChat.status)}`}>
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800">{data.services.omniChat.label}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">omnichat.radiotecpro.com</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${data.services.omniChat.status === 'ONLINE' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {data.services.omniChat.status === 'ONLINE' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                            {data.services.omniChat.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-1">{data.services.omniChat.latencyMs}ms</span>
                    </div>
                </div>

            </div>

        </div>
      )}
    </div>
  );
}
