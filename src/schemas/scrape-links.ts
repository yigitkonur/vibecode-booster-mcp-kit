import { z } from 'zod';
import { isLLMEnabledByDefault } from '../utils/llm-config';

// Input schema for scrape_links tool
export const scrapeLinksParamsShape = {
  urls: z
    .array(z.string().url('Must be a valid HTTP or HTTPS URL'))
    .min(1, 'At least one URL is required')
    .max(5, 'Cannot exceed 5 URLs per request')
    .describe('URLs to scrape (1-5). Use array format even for single URLs'),
  mode: z
    .enum(['basic', 'premium', 'javascript'])
    .default('basic')
    .describe('Scraping mode: basic=fast datacenter proxies, premium=residential proxies, javascript=browser rendering'),
  timeout: z
    .number()
    .min(5)
    .max(120)
    .default(30)
    .describe('Timeout in seconds for each URL'),
  country: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase ISO 3166-1 alpha-2 format')
    .optional()
    .describe('Country code (US, GB, DE, etc) for premium mode'),
  waitFor: z
    .number()
    .min(0)
    .max(35000)
    .default(5000)
    .describe('Wait time in milliseconds for JavaScript rendering')
    .optional(),
  use_llm: z
    .boolean()
    .default(isLLMEnabledByDefault())
    .describe('Enable AI processing for content extraction'),
  what_to_extract: z
    .string()
    .max(1000)
    .optional()
    .describe('Specific content extraction instructions for AI'),
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
  }),
};

export const scrapeLinksOutputSchema = z.object(scrapeLinksOutputShape);

export type ScrapeLinksOutput = z.infer<typeof scrapeLinksOutputSchema>;
