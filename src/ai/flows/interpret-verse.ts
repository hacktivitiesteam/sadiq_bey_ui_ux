// src/ai/flows/interpret-verse.ts
'use server';
/**
 * @fileOverview A flow for interpreting a specific verse from the Qur'an.
 *
 * - interpretVerse - A function that interprets a given verse.
 * - InterpretVerseInput - The input type for the interpretVerse function.
 * - InterpretVerseOutput - The return type for the interpretVerse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretVerseInputSchema = z.object({
  verse: z.string().describe('The specific verse from the Qur\'an to interpret.'),
});
export type InterpretVerseInput = z.infer<typeof InterpretVerseInputSchema>;

const InterpretVerseOutputSchema = z.object({
  interpretation: z.string().describe('An AI-powered interpretation of the verse, providing context and deeper understanding.'),
});
export type InterpretVerseOutput = z.infer<typeof InterpretVerseOutputSchema>;

export async function interpretVerse(input: InterpretVerseInput): Promise<InterpretVerseOutput> {
  return interpretVerseFlow(input);
}

const interpretVersePrompt = ai.definePrompt({
  name: 'interpretVersePrompt',
  input: {schema: InterpretVerseInputSchema},
  output: {schema: InterpretVerseOutputSchema},
  prompt: `You are an AI assistant specialized in providing interpretations of verses from the Qur'an. Provide context and deeper understanding of the meaning of the verse: {{{verse}}}.`,
});

const interpretVerseFlow = ai.defineFlow(
  {
    name: 'interpretVerseFlow',
    inputSchema: InterpretVerseInputSchema,
    outputSchema: InterpretVerseOutputSchema,
  },
  async input => {
    const {output} = await interpretVersePrompt(input);
    return output!;
  }
);
