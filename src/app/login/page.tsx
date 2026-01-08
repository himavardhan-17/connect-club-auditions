'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, LogIn } from 'lucide-react';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (role === 'admin' || role === 'panel') {
      const success = login(password, role);
      if (!success) {
        setError('Invalid password. Please try again.');
        toast({
          title: 'Login Failed',
          description: 'Invalid password. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      setError('Invalid role specified.');
    }
    setLoading(false);
  };

  if (role !== 'admin' && role !== 'panel') {
    router.push('/');
    return null;
  }
  
  const isAdmin = role === 'admin';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="absolute top-8 left-8">
        <Logo />
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            {isAdmin ? (
              <Shield className="h-8 w-8 text-primary" />
            ) : (
              <Users className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="font-headline text-2xl">
            {isAdmin ? 'Admin Login' : 'Panel Login'}
          </CardTitle>
          <CardDescription>
            Enter the password to access the {isAdmin ? 'dashboard' : 'panel'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}
