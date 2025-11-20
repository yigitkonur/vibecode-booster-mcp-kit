import { z } from 'zod';
import { isLLMEnabledByDefault } from '../utils/llm-config';

// Input schema for scrape_links tool
export const scrapeLinksParamsSchema = z.object({
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
});

export type ScrapeLinksParams = z.infer<typeof scrapeLinksParamsSchema>;

// Output schema
export const scrapeLinksOutputSchema = z.object({
  content: z.string().describe('Formatted markdown content from all scraped URLs'),
  metadata: z.object({
    total_urls: z.number(),
    successful: z.number(),
    failed: z.number(),
    total_credits: z.number(),
    execution_time_ms: z.number(),
  }),
});

export type ScrapeLinksOutput = z.infer<typeof scrapeLinksOutputSchema>;

// JSON Schema shapes for MCP
export const scrapeLinksParamsShape = {
  type: 'object' as const,
  properties: {
    urls: {
      type: 'array',
      items: { type: 'string', format: 'uri' },
      minItems: 1,
      maxItems: 5,
      description: 'URLs to scrape (1-5). Use array format even for single URLs',
    },
    mode: {
      type: 'string',
      enum: ['basic', 'premium', 'javascript'],
      default: 'basic',
      description: 'Scraping mode: basic=fast datacenter proxies, premium=residential proxies, javascript=browser rendering',
    },
    timeout: {
      type: 'number',
      minimum: 5,
      maximum: 120,
      default: 30,
      description: 'Timeout in seconds for each URL',
    },
    country: {
      type: 'string',
      pattern: '^[A-Z]{2}$',
      description: 'Country code (US, GB, DE, etc) for premium mode',
    },
    waitFor: {
      type: 'number',
      minimum: 0,
      maximum: 35000,
      default: 5000,
      description: 'Wait time in milliseconds for JavaScript rendering',
    },
    use_llm: {
      type: 'boolean',
      default: true,
      description: 'Enable AI processing for content extraction',
    },
    what_to_extract: {
      type: 'string',
      maxLength: 1000,
      description: 'Specific content extraction instructions for AI',
    },
  },
  required: ['urls'],
};

export const scrapeLinksOutputShape = {
  type: 'object' as const,
  properties: {
    content: {
      type: 'string',
      description: 'Formatted markdown content from all scraped URLs',
    },
    metadata: {
      type: 'object',
      properties: {
        total_urls: { type: 'number' },
        successful: { type: 'number' },
        failed: { type: 'number' },
        total_credits: { type: 'number' },
        execution_time_ms: { type: 'number' },
      },
      required: ['total_urls', 'successful', 'failed', 'total_credits', 'execution_time_ms'],
    },
  },
  required: ['content', 'metadata'],
};
