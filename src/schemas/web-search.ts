import { z } from 'zod';

// Input schema for web_search tool (renamed from search_multiple)
const keywordsSchema = z
  .array(z.string().min(1, 'Keyword cannot be empty').max(500, 'Keyword cannot exceed 500 characters'))
  .min(1, 'At least one keyword is required')
  .max(100, 'Cannot exceed 100 keywords per request')
  .describe('Array of search keywords (1-100 keywords). Use specific, targeted keywords for best results.');

export const webSearchParamsShape = {
  keywords: keywordsSchema,
};

export const webSearchParamsSchema = z.object(webSearchParamsShape);

export type WebSearchParams = z.infer<typeof webSearchParamsSchema>;

// Output schema
export const webSearchOutputShape = {
  content: z.string().describe('Formatted markdown with aggregated summary and all search results'),
  metadata: z.object({
    total_keywords: z.number(),
    total_results: z.number(),
    execution_time_ms: z.number(),
    // New aggregation metadata
    total_unique_urls: z.number().optional(),
    consensus_url_count: z.number().optional(),
    frequency_threshold: z.number().optional(),
  }),
};

export const webSearchOutputSchema = z.object(webSearchOutputShape);

export type WebSearchOutput = z.infer<typeof webSearchOutputSchema>;
