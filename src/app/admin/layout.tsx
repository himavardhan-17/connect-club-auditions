'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, FileCheck, LogOut, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/participants', icon: Users, label: 'Participants' },
  { href: '/admin/markings', icon: FileCheck, label: 'Markings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = (e: MediaQueryListEvent) => {
      if(e.matches) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    if (mediaQuery.matches) {
        setIsSidebarOpen(false);
    }
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);


  return (
    <ProtectedRoute allowedRole="admin">
      <TooltipProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <aside className={cn(
            "fixed inset-y-0 left-0 z-10 flex-col border-r bg-background transition-all duration-300 sm:flex",
            isSidebarOpen ? "w-64" : "w-16"
          )}>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
              <Link
                href="/admin"
                className={cn("flex h-10 items-center justify-center gap-2 rounded-lg text-lg font-semibold text-primary md:text-base", isSidebarOpen ? "px-4" : "")}
              >
                <Logo />
              </Link>
              {navItems.map((item) => (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-9 w-full items-center justify-center gap-2 rounded-lg text-muted-foreground transition-colors hover:text-primary md:h-8",
                        pathname === item.href && "bg-accent text-primary",
                        isSidebarOpen ? "justify-start px-3" : ""
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={cn("whitespace-nowrap", !isSidebarOpen && "hidden")}>{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  {!isSidebarOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("w-full", isSidebarOpen ? "justify-start px-3" : "w-9")} onClick={logout}>
                    <LogOut className="h-5 w-5" />
                    <span className={cn("ml-2 whitespace-nowrap", !isSidebarOpen && "hidden")}>Logout</span>
                  </Button>
                </TooltipTrigger>
                {!isSidebarOpen && <TooltipContent side="right">Logout</TooltipContent>}
              </Tooltip>
            </nav>
          </aside>
          <div className={cn("flex flex-1 flex-col transition-all duration-300", isSidebarOpen ? "sm:pl-64" : "sm:pl-16")}>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
              <Button size="icon" variant="outline" className="sm:hidden" onClick={() => setIsSidebarOpen(prev => !prev)}>
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
              </Button>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  );
}
