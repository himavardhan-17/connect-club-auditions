'use server';

/**
 * @fileOverview An AI agent that suggests marking criteria based on a contestant's preferred position.
 *
 * - suggestMarkingCriteria - A function that generates marking criteria.
 * - SuggestMarkingCriteriaInput - The input type for the suggestMarkingCriteria function.
 * - SuggestMarkingCriteriaOutput - The return type for the suggestMarkingCriteria function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMarkingCriteriaInputSchema = z.object({
  preferredPosition: z
    .string()
    .describe('The contestant\'s preferred position (e.g., Anchor, Creative Designer, Logistics).'),
});
export type SuggestMarkingCriteriaInput = z.infer<
  typeof SuggestMarkingCriteriaInputSchema
>;

const CriterionSchema = z.object({
    criterion: z.string().describe("The name of the marking criterion."),
    maxScore: z.number().describe("The maximum score for this criterion.")
});

const SuggestMarkingCriteriaOutputSchema = z.object({
  criteria: z
    .array(CriterionSchema)
    .describe('An array of suggested marking criteria objects, each with a "criterion" and "maxScore" field.'),
});
export type SuggestMarkingCriteriaOutput = z.infer<
  typeof SuggestMarkingCriteriaOutputSchema
>;

export async function suggestMarkingCriteria(
  input: SuggestMarkingCriteriaInput
): Promise<SuggestMarkingCriteriaOutput> {
  return suggestMarkingCriteriaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMarkingCriteriaPrompt',
  input: {schema: SuggestMarkingCriteriaInputSchema},
  output: {schema: SuggestMarkingCriteriaOutputSchema},
  prompt: `You are an expert HR manager creating a scorecard. Based on the candidate's preferred position, return the predefined marking schema.

### Role-Specific Marking Schemas

**1. ANCHOR**
*   Communication Clarity (20)
*   Confidence & Stage Presence (20)
*   Spontaneity / Thinking on Feet (20)
*   Audience Engagement (20)
*   Language & Tone Control (20)

**2. CREATIVE DESIGNER**
*   Creativity & Originality (25)
*   Design Sense (25)
*   Tool Awareness (20)
*   Concept Explanation (15)
*   Adaptability to Feedback (15)

**3. VIDEO EDITOR**
*   Storytelling Ability (25)
*   Technical Editing Skills (25)
*   Tool Proficiency (20)
*   Creativity & Effects (15)
*   Time & Workflow Awareness (15)

**4. LOGISTICS & OPERATIONS**
*   Planning & Organization (25)
*   Problem Solving (25)
*   Responsibility & Reliability (20)
*   Communication & Coordination (15)
*   Availability & Commitment (15)

---

**Candidate's Preferred Position:** {{{preferredPosition}}}

---

Return the exact criteria and their corresponding max scores for the specified position.
Format your output as a JSON object with a "criteria" key containing an array of objects. Each object must have a "criterion" (string) and "maxScore" (number) key. No intro text or explanation is required.

Example for "ANCHOR":
{
  "criteria": [
    { "criterion": "Communication Clarity", "maxScore": 20 },
    { "criterion": "Confidence & Stage Presence", "maxScore": 20 },
    { "criterion": "Spontaneity / Thinking on Feet", "maxScore": 20 },
    { "criterion": "Audience Engagement", "maxScore": 20 },
    { "criterion": "Language & Tone Control", "maxScore": 20 }
  ]
}`,
});

const suggestMarkingCriteriaFlow = ai.defineFlow(
  {
    name: 'suggestMarkingCriteriaFlow',
    inputSchema: SuggestMarkingCriteriaInputSchema,
    outputSchema: SuggestMarkingCriteriaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
