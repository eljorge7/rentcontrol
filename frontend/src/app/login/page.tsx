"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { Building2, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

      setToken(data.access_token, data.user);
      
      // Redirigir según el rol
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'MANAGER') {
        router.push('/manager');
      } else if (data.user.role === 'OWNER') {
        router.push('/owner');
      } else {
        router.push('/tenant');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        {/* Lado izquierdo - Decorativo */}
        <div className="hidden md:flex flex-col w-1/2 bg-blue-600 p-12 text-white relative overflow-hidden justify-center items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 opacity-90 z-0"></div>
          
          {/* Patrones de fondo circulares */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

          <div className="z-10 text-center max-w-sm">
            <div className="bg-white/10 p-4 inline-flex rounded-2xl backdrop-blur-md mb-8 border border-white/20 shadow-xl">
              <Building2 className="h-12 w-12 text-white drop-shadow-md" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Grupo Hurtado</h1>
            <p className="text-blue-100 text-lg leading-relaxed font-medium">
              Internet Fibra y Gestión Inmobiliaria
            </p>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bienvenido de nuevo</h2>
              <p className="text-slate-500 mt-2 font-medium">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all duration-200 font-medium placeholder:text-slate-400"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all duration-200 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 group flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 text-center text-sm font-medium text-slate-500">
              ¿Olvidaste tu contraseña? <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">Recupérala aquí</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
