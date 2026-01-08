'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  
  return (
    <ProtectedRoute allowedRole="panel">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/panel">
              <Logo />
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
