'use server';
/**
 * @fileOverview An AI agent that answers user queries based on the Qur'an.
 *
 * - answerQueryWithQuran - A function that answers user queries based on the Qur'an.
 * - AnswerQueryWithQuranInput - The input type for the answerQueryWithQuran function.
 * - AnswerQueryWithQuranOutput - The return type for the answerQueryWithQuran function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQueryWithQuranInputSchema = z.object({
  query: z.string().describe('The user query related to Islamic teachings or guidance.'),
});
export type AnswerQueryWithQuranInput = z.infer<typeof AnswerQueryWithQuranInputSchema>;

const AnswerQueryWithQuranOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query, grounded in the verses and principles of the Qur\'an, with relevant verses cited.'),
});
export type AnswerQueryWithQuranOutput = z.infer<typeof AnswerQueryWithQuranOutputSchema>;

export async function answerQueryWithQuran(input: AnswerQueryWithQuranInput): Promise<AnswerQueryWithQuranOutput> {
  return answerQueryWithQuranFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQueryWithQuranPrompt',
  input: {schema: AnswerQueryWithQuranInputSchema},
  output: {schema: AnswerQueryWithQuranOutputSchema},
  prompt: `You are a knowledgeable Islamic scholar providing guidance based on the Qur'an.

  Answer the following query using verses and principles from the Qur'an. Cite relevant verses in your response.

  Query: {{{query}}}`,
});

const answerQueryWithQuranFlow = ai.defineFlow(
  {
    name: 'answerQueryWithQuranFlow',
    inputSchema: AnswerQueryWithQuranInputSchema,
    outputSchema: AnswerQueryWithQuranOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
