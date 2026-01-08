'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ADMIN_PASSWORD = 'president@cc'; // Hardcoded password as per requirement
const PANEL_PASSWORD = 'panel@cc'; // Hardcoded password as per requirement

type Role = 'admin' | 'panel';

interface AuthContextType {
  role: Role | null;
  isAuthenticated: boolean;
  login: (password: string, requestedRole: Role) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('evalai-role') as Role | null;
      if (storedRole) {
        setRole(storedRole);
      }
    } catch (error) {
      console.error('Could not access localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (password: string, requestedRole: Role) => {
    let success = false;
    if (requestedRole === 'admin' && password === ADMIN_PASSWORD) {
      setRole('admin');
      localStorage.setItem('evalai-role', 'admin');
      router.push('/admin');
      success = true;
    } else if (requestedRole === 'panel' && password === PANEL_PASSWORD) {
      setRole('panel');
      localStorage.setItem('evalai-role', 'panel');
      router.push('/panel');
      success = true;
    }
    return success;
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('evalai-role');
    router.push('/');
  };

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/' || pathname.startsWith('/login');
      if (!role && !isAuthPage) {
        router.push('/');
      }
      if (role && isAuthPage) {
        router.push(`/${role}`);
      }
    }
  }, [role, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ role, isAuthenticated: !!role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
