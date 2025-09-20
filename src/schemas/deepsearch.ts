/**
 * JINA DeepSearch schemas
 */

import { z } from 'zod';

export const deepSearchParamsShape = {
  query: z.string().min(1).describe('Research question'),
  reasoning_effort: z.enum(['low', 'medium', 'high']).default('medium').describe('Quality vs speed control'),
  budget_tokens: z.number().int().optional().describe('Token limit for entire research process'),
  max_attempts: z.number().int().default(1).describe('Number of self-correction loops'),
  team_size: z.number().int().default(1).describe('Number of parallel research agents'),
  no_direct_answer: z.boolean().default(false).describe('Force web search for all queries'),
  arxiv_optimized_search: z.boolean().default(false).describe('Restrict to arxiv.org domain only'),
  good_domains: z.array(z.string()).optional().describe('Prioritize these domains'),
  bad_domains: z.array(z.string()).optional().describe('Exclude these domains'),
  only_domains: z.array(z.string()).optional().describe('Search only these domains'),
  max_returned_urls: z.number().int().default(10).describe('Maximum URLs in citations'),
  search_query_language: z.string().regex(/^[a-z]{2}$/).optional().describe('Search language (ISO 639-1)'),
  answer_and_think_language: z.string().regex(/^[a-z]{2}$/).optional().describe('Response language (ISO 639-1)'),
};

export const deepSearchParamsSchema = z.object(deepSearchParamsShape);

export type DeepSearchParams = z.infer<typeof deepSearchParamsSchema>;

// Output schema for JINA DeepSearch API responses
export const deepSearchOutputShape = {
  content: z.string().describe('Research findings and analysis in markdown format'),
  metadata: z.object({
    id: z.string().describe('Unique request identifier'),
    model: z.string().describe('JINA model used for research'),
    created: z.number().describe('Unix timestamp of request creation'),
    finish_reason: z.string().optional().describe('Reason for completion'),
  }).describe('Request metadata'),
  usage: z.object({
    prompt_tokens: z.number().int().describe('Tokens used in the prompt'),
    completion_tokens: z.number().int().describe('Tokens generated in response'),
    total_tokens: z.number().int().describe('Total tokens consumed'),
  }).optional().describe('Token usage statistics'),
  sources: z.object({
    visited_urls: z.array(z.string()).describe('URLs visited during research'),
    read_urls: z.array(z.string()).describe('URLs successfully processed'),
    total_sources: z.number().int().describe('Total number of sources analyzed'),
  }).optional().describe('Source analysis information'),
  research_quality: z.object({
    reasoning_effort: z.enum(['low', 'medium', 'high']).describe('Level of reasoning applied'),
    team_size: z.number().int().describe('Number of agents used'),
    confidence_score: z.number().min(0).max(1).optional().describe('Research confidence level'),
  }).optional().describe('Research quality metrics'),
};

export const deepSearchOutputSchema = z.object(deepSearchOutputShape);

export type DeepSearchOutput = z.infer<typeof deepSearchOutputSchema>;