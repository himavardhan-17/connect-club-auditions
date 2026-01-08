'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy as firestoreOrderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contestant } from '@/lib/types';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortConfig = {
    key: keyof Contestant;
    direction: 'ascending' | 'descending';
} | null;

export default function ParticipantsPage() {
  const [allContestants, setAllContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'score', direction: 'descending' });

  useEffect(() => {
    const fetchContestants = async () => {
      try {
        const q = query(collection(db, 'contestants'));
        const querySnapshot = await getDocs(q);
        const contestantsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contestant));
        setAllContestants(contestantsData);
      } catch (error) {
        console.error("Error fetching contestants: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContestants();
  }, []);

  const preferredPositions = useMemo(() => {
    const positions = new Set(allContestants.map(c => c.preferredposition));
    return ['all', ...Array.from(positions)];
  }, [allContestants]);

  const filteredAndSortedContestants = useMemo(() => {
    let filtered = allContestants.filter(c =>
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.roll.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (positionFilter === 'all' || c.preferredposition === positionFilter)
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [allContestants, searchTerm, positionFilter, sortConfig]);

  const requestSort = (key: keyof Contestant) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getTotalMaxScore = (contestant: Contestant) => {
    if (!contestant.scores || contestant.scores.length === 0) return 100; // Default to 100 if no scores array
    return contestant.scores.reduce((sum, s) => sum + s.maxScore, 0);
  }

  const getScoreBadgeVariant = (score: number | null, maxScore: number) => {
    if (score === null || score === undefined) return 'secondary';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Registered Participants</CardTitle>
        <CardDescription>A list of all contestants who have registered.</CardDescription>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Search by name or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              {preferredPositions.map(pos => (
                <SelectItem key={pos} value={pos}>{pos === 'all' ? 'All Positions' : pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Preferred Position</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('score')} className="px-1">
                    Score
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredAndSortedContestants.length > 0 ? (
                filteredAndSortedContestants.map((c) => {
                  const maxScore = getTotalMaxScore(c);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.roll}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.year}</TableCell>
                      <TableCell>{c.branch}</TableCell>
                      <TableCell>{c.preferredposition}</TableCell>
                      <TableCell>
                        {c.score !== null && c.score !== undefined ? (
                          <Badge variant={getScoreBadgeVariant(c.score, maxScore)} className={getScoreBadgeVariant(c.score, maxScore) === 'default' ? "bg-primary text-primary-foreground" : ""}>
                            {c.score.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}