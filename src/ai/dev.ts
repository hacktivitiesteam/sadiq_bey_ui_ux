/**
 * @fileoverview This file is used to start the Genkit development server.
 *
 * It imports all the flows that are defined in the `src/ai` directory and makes them available to the server.
 */
import { ai } from './genkit';

// Import all flows
import './chat/chat-flow';

export const config = {
  flows: [...ai.registry.listFlows()],
};
