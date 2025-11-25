'use server';
/**
 * @fileOverview A chat flow that uses the Gemini API to respond to user messages.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const chatInputSchema = z.object({
  messages: z.array(MessageSchema),
});

export const chatOutputSchema = z.object({
  content: z.string(),
});

export type ChatInput = z.infer<typeof chatInputSchema>;
export type ChatOutput = z.infer<typeof chatOutputSchema>;

const chatPrompt = ai.definePrompt(
  {
    name: 'chatPrompt',
    input: { schema: chatInputSchema },
    output: { schema: chatOutputSchema },
    prompt: `
    You are a friendly and helpful travel assistant.
    Respond to the user's message in the same language they used.
    Here is the conversation history:
    {{#each messages}}
      {{role}}: {{content}}
    {{/each}}
  `,
  },
  async (input) => {
    const { messages } = input;
    const { text } = await ai.generate({
      model: 'googleai/gemini-pro',
      prompt: {
        messages: messages.map((m) => ({
          role: m.role,
          content: [{ text: m.content }],
        })),
      },
    });
    return { content: text };
  }
);

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: chatInputSchema,
    outputSchema: chatOutputSchema,
  },
  async (input) => {
    return await chatPrompt(input);
  }
);
