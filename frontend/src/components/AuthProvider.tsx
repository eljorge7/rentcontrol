"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, removeToken } from '@/lib/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getUser();
      setUser(currentUser);
      setLoading(false);

      const isPublicRoute = pathname.startsWith('/quote') || pathname.startsWith('/ticket');

      if (!currentUser && !pathname.includes('/login') && pathname !== '/' && !isPublicRoute) {
        router.push('/login');
      } else if (currentUser) {
        // Allow public routes for authenticated users as well without forcing role redirects
        if (isPublicRoute) return;

        // Evaluate if the current path violates the user's role limits
        const isLoginOrRoot = pathname === '/login' || pathname === '/';
        
        switch (currentUser.role) {
          case 'ADMIN':
            if (isLoginOrRoot || (!pathname.startsWith('/admin') && pathname !== '/')) {
              router.push('/admin');
            }
            break;
          case 'MANAGER':
            if (isLoginOrRoot || (!pathname.startsWith('/manager') && pathname !== '/')) {
              router.push('/manager');
            }
            break;
          case 'OWNER':
            if (isLoginOrRoot || (!pathname.startsWith('/owner') && pathname !== '/')) {
              router.push('/owner');
            }
            break;
          case 'TENANT':
            if (isLoginOrRoot || (!pathname.startsWith('/tenant') && pathname !== '/')) {
              router.push('/tenant');
            }
            break;
          default:
            if (!pathname.includes('/login')) router.push('/login');
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  const logout = () => {
    removeToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {loading && !pathname.includes('/login') && pathname !== '/' ? (
        <div className="flex bg-slate-50 items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
