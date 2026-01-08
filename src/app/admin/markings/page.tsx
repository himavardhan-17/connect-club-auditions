'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contestant } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, ChevronDown, Sigma } from 'lucide-react';

export default function MarkingsPage() {
  const { role } = useAuth();
  const [evaluatedContestants, setEvaluatedContestants] = useState<Contestant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvaluatedContestants = async () => {
      try {
        const q = query(
          collection(db, 'contestants'),
          where('score', '!=', null),
          orderBy('score', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const contestantsData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Contestant)
        );
        setEvaluatedContestants(contestantsData);
      } catch (error) {
        console.error('Error fetching evaluated contestants: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluatedContestants();
  }, []);

  const filteredContestants = useMemo(() => {
    return evaluatedContestants.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.roll.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [evaluatedContestants, searchTerm]);

  const isAdmin = role === 'admin';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Panel Markings</CardTitle>
        <CardDescription>
          A list of all contestants who have been evaluated.
        </CardDescription>
        <div className="mt-4">
          <Input
            placeholder="Search by name or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
            {loading ? (
                 [...Array(5)].map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-8 w-full" /></CardHeader></Card>
                 ))
            ) : filteredContestants.length > 0 ? (
                filteredContestants.map((c) => (
                    <AccordionItem value={c.id} key={c.id} className="border-b-0">
                         <Card className="overflow-hidden">
                            <AccordionTrigger className="w-full text-left p-4 hover:no-underline hover:bg-accent/50 [&[data-state=open]]:bg-accent/50 [&>svg]:ml-auto">
                                <div className="grid grid-cols-4 md:grid-cols-4 gap-4 items-center flex-1">
                                    <div className="font-medium">{c.roll}</div>
                                    <div>{c.name}</div>
                                    <div>
                                        <Badge variant="default" className="bg-primary text-primary-foreground text-base">
                                            {c.score?.toFixed(2)}
                                        </Badge>
                                    </div>
                                    <div className="hidden md:block">{c.updatedAt ? format(c.updatedAt.toDate(), 'P') : 'N/A'}</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <div className="p-4 bg-muted/20 border-t">
                                    <h4 className="font-semibold mb-3 text-lg">Detailed Score & Feedback</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <ul className="space-y-2">
                                                {(c.scores || []).map(s => (
                                                    <li key={s.criterion} className="flex justify-between items-center text-sm p-3 rounded-lg bg-background shadow-sm">
                                                        <span className="flex items-center gap-2">
                                                            <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> 
                                                            {s.criterion}
                                                        </span>
                                                        <span className="font-bold text-primary text-base">{((s.score / 20) * s.maxScore).toFixed(1)} / {s.maxScore}</span>
                                                    </li>
                                                ))}
                                                 {(c.scores && c.scores.length > 0) && (
                                                    <li className="flex justify-between items-center text-sm p-3 rounded-lg bg-background shadow-inner mt-4 border-t-2 border-primary/20">
                                                        <span className="flex items-center gap-2 font-bold text-lg">
                                                            <Sigma className="w-5 h-5 text-primary" /> 
                                                            Total Score
                                                        </span>
                                                        <span className="font-bold text-primary text-lg">{c.score?.toFixed(2)} / {c.scores.reduce((acc, s) => acc + s.maxScore, 0)}</span>
                                                    </li>
                                                 )}
                                            </ul>
                                        </div>
                                        <div className="text-sm bg-background p-4 rounded-lg border shadow-sm">
                                            <p className="font-semibold mb-2 text-base">Panel Feedback:</p>
                                            <p className="text-muted-foreground leading-relaxed">{c.evaluatedByText || 'No feedback provided.'}</p>
                                        </div>
                                    </div>
                               </div>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                ))
            ) : (
                <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                    No evaluated contestants found.
                </div>
            )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
