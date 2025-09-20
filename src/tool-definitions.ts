import { zodToJsonSchema } from 'zod-to-json-schema';
import { deepSearchParamsSchema } from './schemas/deepsearch';

export const toolDefinitions = [
  {
    name: 'deepsearch.research',
    description: 'Executes a comprehensive, synchronous, and blocking research task using the Jina DeepSearch engine. This single function call performs an iterative process of web searching, content reading, and reasoning to generate a synthesized answer with citations. WARNING: This can be a long-running and token-intensive operation. Use parameters to control cost and depth.',
    costHint: 'high',
    destructiveHint: false,
    parameters: {
      ...zodToJsonSchema(deepSearchParamsSchema, {
        name: 'DeepSearchParams',
        $refStrategy: 'none',
      }),
      type: 'object',
    },
  },
] as const;
