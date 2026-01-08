'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contestant, MarkingCriterion } from '@/lib/types';
import { suggestInterviewQuestions } from '@/ai/flows/suggest-interview-questions';
import { suggestMarkingCriteria } from '@/ai/flows/suggest-marking-criteria';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Wand2, BrainCircuit, List, Loader2, Info, GraduationCap, Briefcase, Star, Sigma } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';


const evaluationSchema = z.object({
  scores: z.array(z.object({
    criterion: z.string(),
    score: z.number().min(0).max(20),
    maxScore: z.number(),
  })).min(1, "At least one criterion must be scored."),
  evaluatedByText: z.string().min(10, 'Feedback must be at least 10 characters.').max(500, 'Feedback cannot exceed 500 characters.'),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

export default function PanelPage() {
  const [roll, setRoll] = useState('');
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [liveTotal, setLiveTotal] = useState(0);

  const { toast } = useToast();

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      scores: [],
      evaluatedByText: '',
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'scores',
  });

  const watchedScores = form.watch('scores');

  useEffect(() => {
    if (watchedScores && watchedScores.length > 0) {
      const totalWeightedScore = watchedScores.reduce((sum, item) => {
        return sum + (item.score / 20) * item.maxScore;
      }, 0);
      setLiveTotal(totalWeightedScore);
    } else {
      setLiveTotal(0);
    }
  }, [watchedScores]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roll) return;

    setLoading(true);
    setContestant(null);
    setError(null);
    setAiQuestions([]);
    form.reset();
    replace([]);

    try {
      const contestantDocRef = doc(db, 'contestants', roll.trim());
      const docSnap = await getDoc(contestantDocRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Contestant;
        setContestant(data);
        form.setValue('evaluatedByText', data.evaluatedByText ?? '');

        setCriteriaLoading(true);
        try {
          if (data.scores && data.scores.length > 0) {
             replace(data.scores.map(s => ({...s, score: s.score ?? 10})));
          } else {
            const result = await suggestMarkingCriteria({ preferredPosition: data.preferredposition });
            if (result.criteria && result.criteria.length > 0) {
                const newCriteria = result.criteria.map(c => ({ criterion: c.criterion, score: 10, maxScore: c.maxScore }));
                replace(newCriteria);
            } else {
                throw new Error("AI returned no criteria");
            }
          }
        } catch (aiError) {
          console.error("AI criteria generation failed:", aiError);
          replace([{ criterion: 'Overall Performance', score: 10, maxScore: 100 }]);
          toast({
            title: 'AI Assistant Error',
            description: 'Could not generate marking criteria. Using default.',
            variant: 'destructive',
          });
        } finally {
          setCriteriaLoading(false);
        }

        setAiLoading(true);
        try {
          const result = await suggestInterviewQuestions({ preferredPosition: data.preferredposition });
          setAiQuestions(result.questions);
        } catch (aiError) {
          console.error("AI question generation failed:", aiError);
          toast({
            title: 'AI Assistant Error',
            description: 'Could not generate suggested questions.',
            variant: 'destructive',
          });
        } finally {
          setAiLoading(false);
        }

      } else {
        setError('No contestant found with this roll number.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the contestant.');
      toast({
        title: 'Error',
        description: 'Failed to fetch contestant data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EvaluationFormData) => {
    if (!contestant) return;

    const totalWeightedScore = data.scores.reduce((sum, item) => {
        return sum + (item.score / 20) * item.maxScore;
    }, 0);
    
    try {
      const contestantDocRef = doc(db, 'contestants', contestant.id);
      await updateDoc(contestantDocRef, {
        scores: data.scores,
        evaluatedByText: data.evaluatedByText,
        score: parseFloat(totalWeightedScore.toFixed(2)),
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Success!',
        description: 'Evaluation has been saved successfully.',
      });
       const docSnap = await getDoc(contestantDocRef);
       if(docSnap.exists()){
         setContestant({ id: docSnap.id, ...docSnap.data() } as Contestant)
       }

    } catch (err) {
      console.error(err);
      toast({
        title: 'Save Failed',
        description: 'An error occurred while saving the evaluation.',
        variant: 'destructive',
      });
    }
  };

  const totalMaxPossibleScore = fields.reduce((sum, field) => sum + field.maxScore, 0);

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Contestant Evaluation</CardTitle>
          <CardDescription>Search for a contestant by their roll number to evaluate them.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              placeholder="Enter Roll Number"
              value={roll}
              onChange={(e) => setRoll(e.target.value.toUpperCase())}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && (
        <Card className="mt-8 border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
             <Info className="h-6 w-6 text-destructive" />
             <div>
                <CardTitle className="text-destructive">Search Error</CardTitle>
                <CardDescription className="text-destructive/80">{error}</CardDescription>
             </div>
          </CardHeader>
        </Card>
      )}

      {contestant && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <User className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle className="font-headline text-2xl">{contestant.name}</CardTitle>
                        <CardDescription>Roll No: {contestant.roll}</CardDescription>
                      </div>
                    </div>
                    {contestant.score !== null && contestant.score !== undefined && (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Final Score</p>
                            <p className="text-3xl font-bold text-primary">{contestant.score.toFixed(2)}</p>
                        </div>
                    )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                   <GraduationCap className="h-5 w-5 text-muted-foreground" />
                   <span>{contestant.year}, {contestant.branch} - Sec {contestant.sec}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <Briefcase className="h-5 w-5 text-muted-foreground" />
                   <span>Preferred Position: <strong>{contestant.preferredposition}</strong></span>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl">Evaluation</CardTitle>
                </div>
                <CardDescription>Use the sliders to score each criterion from 0 to 20.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {criteriaLoading ? (
                      <div className="space-y-6">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {fields.map((field, index) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`scores.${index}.score`}
                            render={({ field: renderField }) => (
                              <FormItem>
                                <div className="flex justify-between items-center">
                                  <FormLabel className="text-base flex items-center gap-2">
                                    <Star className="h-4 w-4 text-amber-400" />
                                    {field.criterion}
                                  </FormLabel>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-primary w-12 text-center">
                                      {((renderField.value / 20) * field.maxScore).toFixed(1)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">/ {field.maxScore}</span>
                                  </div>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={20}
                                    step={1}
                                    value={[renderField.value]}
                                    onValueChange={(value) => renderField.onChange(value[0])}
                                  />
                                </FormControl>
                                <FormMessage />
                                <div className="text-xs text-muted-foreground text-right">Score: {renderField.value} / 20</div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )}
                    
                    {!criteriaLoading && fields.length > 0 && (
                        <>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold p-4 bg-accent/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Sigma className="h-5 w-5" />
                                    <span>Total Score</span>
                                </div>
                                <span>{liveTotal.toFixed(2)} / {totalMaxPossibleScore}</span>
                            </div>
                        </>
                    )}

                    <FormField
                      control={form.control}
                      name="evaluatedByText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evaluator Feedback</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Strengths, weaknesses, and overall feedback..." {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting || criteriaLoading} className="w-full">
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Evaluation
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Wand2 className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-xl">AI Suggested Questions</CardTitle>
              </div>
              <CardDescription>
                Based on preferred position: <strong>{contestant.preferredposition}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                aiQuestions.length > 0 ? (
                  <ul className="space-y-3">
                    {aiQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-primary/10">
                        <List className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                    <div className="text-center text-muted-foreground">No questions to suggest.</div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
