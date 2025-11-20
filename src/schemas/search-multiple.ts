import { z } from 'zod';

// Input schema for search_multiple tool
const keywordsSchema = z
  .array(z.string().min(1, 'Keyword cannot be empty').max(500, 'Keyword cannot exceed 500 characters'))
  .min(1, 'At least one keyword is required')
  .max(100, 'Cannot exceed 100 keywords per request')
  .describe('Array of search keywords (1-100 keywords). Use specific, targeted keywords for best results.');

export const searchMultipleParamsShape = {
  keywords: keywordsSchema,
};

export const searchMultipleParamsSchema = z.object(searchMultipleParamsShape);

export type SearchMultipleParams = z.infer<typeof searchMultipleParamsSchema>;

// Output schema
export const searchMultipleOutputShape = {
  content: z.string().describe('Formatted markdown with all search results'),
  metadata: z.object({
    total_keywords: z.number(),
    total_results: z.number(),
    execution_time_ms: z.number(),
  }),
};

export const searchMultipleOutputSchema = z.object(searchMultipleOutputShape);

export type SearchMultipleOutput = z.infer<typeof searchMultipleOutputSchema>;
