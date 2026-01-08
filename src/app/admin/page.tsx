'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contestant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Users, FileCheck, Star, Activity, PieChart as PieChartIcon, BarChart2, Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const fetchContestants = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'contestants'));
      const contestantsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contestant));
      setContestants(contestantsData);
    } catch (error) {
      console.error("Error fetching contestants: ", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestants();
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    const { id } = toast({
      title: "Resetting Data...",
      description: "Please wait while we reset all evaluation data.",
    });

    try {
        const contestantsQuery = await getDocs(collection(db, 'contestants'));
        const batch = writeBatch(db);
        contestantsQuery.forEach((contestantDoc) => {
            const docRef = doc(db, 'contestants', contestantDoc.id);
            batch.update(docRef, {
                score: null,
                scores: null,
                evaluatedByText: '',
                updatedAt: null
            });
        });
        await batch.commit();

        toast({
          id,
          title: "Success!",
          description: "All contestant scores and feedback have been reset.",
        });
        // Refetch data to update UI
        await fetchContestants();

    } catch(error) {
        console.error("Error resetting data:", error);
        toast({
            id,
            title: "Reset Failed",
            description: "An error occurred while resetting the data.",
            variant: "destructive",
        });
    } finally {
        setIsResetting(false);
    }
  }

  const stats = useMemo(() => {
    const total = contestants.length;
    const evaluated = contestants.filter(c => c.score !== null && c.score !== undefined).length;
    const notEvaluated = total - evaluated;
    const evaluatedContestants = contestants.filter(c => c.score !== null && c.score !== undefined);
    
    const totalPercentageScore = evaluatedContestants.reduce((sum, c) => {
        const maxScore = c.scores?.reduce((max, s) => max + s.maxScore, 0) || 100;
        const percentage = maxScore > 0 ? ((c.score || 0) / maxScore) * 100 : 0;
        return sum + percentage;
    }, 0);
    
    const averageScorePercentage = evaluated > 0 ? (totalPercentageScore / evaluated) : 0;
    
    return { total, evaluated, notEvaluated, averageScore: averageScorePercentage };
  }, [contestants]);

  const positionDistribution = useMemo(() => {
    const distribution = contestants.reduce((acc, c) => {
      acc[c.preferredposition] = (acc[c.preferredposition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(distribution).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [contestants]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  if (loading && contestants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-7">
            <Skeleton className="h-[400px] md:col-span-4" />
            <Skeleton className="h-[400px] md:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total registered contestants</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
            <FileCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.evaluated}</div>
            <p className="text-xs text-muted-foreground">out of {stats.total} participants</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageScore.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Average score of evaluated</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total > 0 ? ((stats.evaluated / stats.total) * 100).toFixed(1) : 0}%</div>
            <p className="text-xs text-muted-foreground">Percentage of evaluated</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="font-headline">Preferred Positions</CardTitle>
            </div>
            <CardDescription>Distribution of contestants by preferred position.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={positionDistribution} layout="vertical" margin={{ left: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--foreground))' }} width={120} />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="font-headline">Evaluation Status</CardTitle>
            </div>
            <CardDescription>Comparison of evaluated vs. unevaluated contestants.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-80 w-full">
                <ResponsiveContainer>
                    <PieChart>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Pie
                            data={[
                                { name: 'Evaluated', value: stats.evaluated },
                                { name: 'Not Evaluated', value: stats.notEvaluated },
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            innerRadius={70}
                            paddingAngle={5}
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                const textAnchor = x > cx ? 'start' : 'end';
                                return (
                                    <g>
                                        <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={textAnchor} dominantBaseline="central" className="text-xs">
                                            {name}
                                        </text>
                                        <text x={x} y={y + 15} textAnchor={textAnchor} dominantBaseline="central" className="text-lg font-bold" fill="hsl(var(--foreground))" >
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    </g>
                                );
                            }}
                        >
                            <Cell fill="hsl(var(--chart-1))" />
                            <Cell fill="hsl(var(--chart-5))" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="font-headline text-destructive">Admin Actions</CardTitle>
            <CardDescription>
              These actions are irreversible. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isResetting}>
                        {isResetting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Reset All Scores & Feedback
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently reset all contestant scores,
                        individual criteria markings, and feedback text. It will NOT delete the contestants
                        themselves.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Yes, reset all data</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
       </Card>
    </div>
  );
}