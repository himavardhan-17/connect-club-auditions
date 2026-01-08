import type { Timestamp } from 'firebase/firestore';

export type MarkingCriterion = {
  criterion: string;
  score: number;
  maxScore: number;
};

export type Contestant = {
  id: string; // Document ID, same as roll
  roll: string;
  name:string;
  year: string;
  branch: string;
  sec: string;
  preferredposition: string;
  whatsapp: string;
  mail: string;
  scores: MarkingCriterion[] | null;
  score: number | null; // This is the total weighted score now, not a percentage
  evaluatedByText: string;
  updatedAt: Timestamp | null;
};
