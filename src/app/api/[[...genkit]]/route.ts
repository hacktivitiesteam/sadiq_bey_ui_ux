import { ai } from '@/ai/genkit';
import { run } from '@genkit-ai/next';

export const POST = run({
  ai,
});
