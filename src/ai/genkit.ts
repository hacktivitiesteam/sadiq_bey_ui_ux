/**
 * @fileoverview This file exports a singleton `genkit` instance.
 *
 * It is used to register all the plugins, flows, and other components that are part of the Genkit application.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { next } from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
