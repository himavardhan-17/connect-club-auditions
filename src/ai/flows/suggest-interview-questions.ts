'use server';

/**
 * @fileOverview An AI agent that suggests interview questions based on a contestant's preferred position.
 *
 * - suggestInterviewQuestions - A function that generates interview questions.
 * - SuggestInterviewQuestionsInput - The input type for the suggestInterviewQuestions function.
 * - SuggestInterviewQuestionsOutput - The return type for the suggestInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInterviewQuestionsInputSchema = z.object({
  preferredPosition: z
    .string()
    .describe('The contestant\'s preferred position (e.g., Anchor, Creative Designer, Logistics).'),
});
export type SuggestInterviewQuestionsInput = z.infer<
  typeof SuggestInterviewQuestionsInputSchema
>;

const SuggestInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('An array of suggested interview questions.'),
});
export type SuggestInterviewQuestionsOutput = z.infer<
  typeof SuggestInterviewQuestionsOutputSchema
>;

export async function suggestInterviewQuestions(
  input: SuggestInterviewQuestionsInput
): Promise<SuggestInterviewQuestionsOutput> {
  return suggestInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInterviewQuestionsPrompt',
  input: {schema: SuggestInterviewQuestionsInputSchema},
  output: {schema: SuggestInterviewQuestionsOutputSchema},
  prompt: `You are an expert interviewer. Based on the candidate's preferred position and the corresponding question themes, suggest 5-7 relevant and insightful interview questions.

### Role-Specific Question Themes

**1. ANCHOR**
*   On-spot anchoring
*   Sudden topic change
*   Crowd control situations
*   Live event mishaps

**2. CREATIVE DESIGNER**
*   Design a poster on the spot
*   Redesign critique
*   Color psychology
*   Branding consistency

**3. VIDEO EDITOR**
*   Editing raw footage
*   Fixing bad audio/video
*   Short-form vs long-form edits
*   Content pacing

**4. LOGISTICS & OPERATIONS**
*   Last-minute venue change
*   Speaker delay
*   Crowd overflow
*   Budget constraint handling

---

**Candidate's Preferred Position:** {{{preferredPosition}}}

---

Generate questions based on the themes for the specified position.
Format your output as a JSON object with a "questions" key containing an array of strings. No intro text or explanation is required.
Example:
{
  "questions": ["Question 1", "Question 2", "Question 3"]
}`,
});

const suggestInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestInterviewQuestionsFlow',
    inputSchema: SuggestInterviewQuestionsInputSchema,
    outputSchema: SuggestInterviewQuestionsOutputSchema,
  },
  async input => {
    // Convert to uppercase to match the prompt's schema
    const upperCaseInput = {
        ...input,
        preferredPosition: input.preferredPosition.toUpperCase()
    };
    const {output} = await prompt(upperCaseInput);
    return output!;
  }
);
