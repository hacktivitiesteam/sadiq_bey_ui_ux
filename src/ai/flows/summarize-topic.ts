'use server';

/**
 * @fileOverview Summarizes a topic from the Qur'an.
 *
 * - summarizeTopic - A function that summarizes the given topic from the Qur'an.
 * - SummarizeTopicInput - The input type for the summarizeTopic function.
 * - SummarizeTopicOutput - The return type for the summarizeTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTopicInputSchema = z.object({
  topic: z.string().describe('The topic to summarize from the Qur\'an.'),
});
export type SummarizeTopicInput = z.infer<typeof SummarizeTopicInputSchema>;

const SummarizeTopicOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the relevant verses and teachings from the Qur\'an.'),
});
export type SummarizeTopicOutput = z.infer<typeof SummarizeTopicOutputSchema>;

export async function summarizeTopic(input: SummarizeTopicInput): Promise<SummarizeTopicOutput> {
  return summarizeTopicFlow(input);
}

const summarizeTopicPrompt = ai.definePrompt({
  name: 'summarizeTopicPrompt',
  input: {schema: SummarizeTopicInputSchema},
  output: {schema: SummarizeTopicOutputSchema},
  prompt: `You are an AI assistant specialized in providing summaries of topics based on the Qur\'an.
  Please provide a concise summary of the following topic based on relevant verses and teachings from the Qur\'an:

  Topic: {{{topic}}}
  `,
});

const summarizeTopicFlow = ai.defineFlow(
  {
    name: 'summarizeTopicFlow',
    inputSchema: SummarizeTopicInputSchema,
    outputSchema: SummarizeTopicOutputSchema,
  },
  async input => {
    const {output} = await summarizeTopicPrompt(input);
    return output!;
  }
);
