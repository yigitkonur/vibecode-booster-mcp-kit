import { z } from 'zod';
import { isLLMEnabledByDefault } from '../config/index.js';

// Input schema for scrape_links tool
export const scrapeLinksParamsShape = {
  urls: z
    .array(z.string().url('Must be a valid HTTP or HTTPS URL'))
    .min(3, 'Minimum 3 URLs required for efficient batch processing')
    .max(50, 'Maximum 50 URLs allowed per request')
    .describe('URLs to scrape (3-50). More URLs = broader coverage but fewer tokens per URL. 3 URLs: ~10K tokens each (deep); 50 URLs: ~640 tokens each (scan).'),
  timeout: z
    .number()
    .min(5)
    .max(120)
    .default(30)
    .describe('Timeout in seconds for each URL'),
  use_llm: z
    .boolean()
    .default(isLLMEnabledByDefault())
    .describe('Enable AI processing for content extraction'),
  what_to_extract: z
    .string()
    .max(1000)
    .optional()
    .describe('Specific content extraction instructions for AI. Will be enhanced with conciseness suffix automatically.'),
};

export const scrapeLinksParamsSchema = z.object(scrapeLinksParamsShape);

export type ScrapeLinksParams = z.infer<typeof scrapeLinksParamsSchema>;

// Output schema
export const scrapeLinksOutputShape = {
  content: z.string().describe('Formatted markdown content from all scraped URLs'),
  metadata: z.object({
    total_urls: z.number(),
    successful: z.number(),
    failed: z.number(),
    total_credits: z.number(),
    execution_time_ms: z.number(),
    // Token allocation metadata
    tokens_per_url: z.number().optional(),
    total_token_budget: z.number().optional(),
    batches_processed: z.number().optional(),
  }),
};

export const scrapeLinksOutputSchema = z.object(scrapeLinksOutputShape);

export type ScrapeLinksOutput = z.infer<typeof scrapeLinksOutputSchema>;
