'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://firebasestorage.googleapis.com/v0/b/connect-auditions.firebasestorage.app/o/Hero_Section_Background_Video_720P.mp4?alt=media&token=197077b4-7e70-43da-988e-b73d070450d6" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/90 p-2 shadow-lg md:h-28 md:w-28 animate-breathing">
           <Image
            src="https://firebasestorage.googleapis.com/v0/b/connect-auditions.firebasestorage.app/o/logo-transparent-png.png?alt=media&token=7c4a5f7c-f542-49ff-92b4-0288025b42a2"
            alt="Connect Club Logo"
            width={100}
            height={100}
            className="h-auto w-full"
            priority
          />
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary-foreground drop-shadow-lg">
            Connect Club Auditions
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80 drop-shadow-md">
          A streamlined internal evaluation system where panels assess candidates with AI-assisted interview questions, and admins monitor the progress.
        </p>
      </div>

      <div className="relative z-10 mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="group w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-white/20">
          <CardHeader className="items-center text-center p-6">
            <div className="mb-4 h-24 w-24 rounded-full bg-white/90 p-1.5 shadow-lg overflow-hidden">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/connect-auditions.firebasestorage.app/o/admin.jpg?alt=media&token=4dc10eef-8c77-4a53-9552-aa7f2a3eb24b"
                  alt="Admin"
                  width={100}
                  height={100}
                  className="h-full w-full object-cover rounded-full"
                />
            </div>
            <CardTitle className="font-headline text-2xl">Admin</CardTitle>
            <CardDescription>Monitor progress and view analytics.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-6 pb-6">
            <Button asChild className="w-full">
              <Link href="/login?role=admin">Admin Login</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-white/20">
          <CardHeader className="items-center text-center p-6">
            <div className="mb-4 h-24 w-24 rounded-full bg-white/90 p-1.5 shadow-lg overflow-hidden">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/connect-auditions.firebasestorage.app/o/panel.jpg?alt=media&token=f68f6deb-9a9c-4c3a-99e7-261cfd4d8d56"
                  alt="Panel"
                  width={100}
                  height={100}
                  className="h-full w-full object-cover rounded-full"
                />
            </div>
            <CardTitle className="font-headline text-2xl">Panel</CardTitle>
            <CardDescription>Evaluate candidates and submit scores.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-6 pb-6">
            <Button asChild className="w-full">
              <Link href="/login?role=panel">Panel Login</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="group w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-white/20">
          <CardHeader className="items-center text-center p-6">
            <div className="mb-4 h-24 w-24 rounded-full bg-white/90 p-1.5 shadow-lg overflow-hidden">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/connect-auditions.firebasestorage.app/o/public.jpg?alt=media&token=218837c7-8373-4c6a-ad7e-de1afad8fc50"
                  alt="Public"
                  width={100}
                  height={100}
                  className="h-full w-full object-cover rounded-full"
                />
            </div>
            <CardTitle className="font-headline text-2xl">Public</CardTitle>
            <CardDescription>View leaderboards and results.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-6 pb-6">
             <Button asChild className="w-full">
              <Link href="/public/leaderboard">View Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
