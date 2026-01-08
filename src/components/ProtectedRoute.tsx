'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRole: 'admin' | 'panel';
};

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!role || role !== allowedRole) {
        router.push('/login');
      }
    }
  }, [role, loading, allowedRole, router]);

  if (loading || !role || role !== allowedRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
