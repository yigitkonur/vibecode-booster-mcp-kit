/**
 * JINA DeepSearch Zod Schemas
 *
 * Type-safe validation with intelligent defaults and clear error messages.
 * Replaces verbose JSON schemas with concise, maintainable code.
 */

import { z } from 'zod';

/**
 * Reasoning effort levels with performance implications
 */
export const reasoningEffortSchema = z.enum(['low', 'medium', 'high'], {
  description: 'Analysis depth: low (~30s), medium (~60s), high (may timeout)',
});

/**
 * Core DeepSearch parameters with intelligent validation
 */
export const deepSearchParamsSchema = z.object({
  query: z.string()
    .min(1, 'Query cannot be empty')
    .max(1000, 'Query too long (max 1000 chars)')
    .describe('Research question - be specific for better results'),

  reasoning_effort: reasoningEffortSchema
    .default('medium')
    .describe('Analysis depth vs speed tradeoff'),

  budget_tokens: z.number()
    .int('Must be whole number')
    .min(1000, 'Minimum 1000 tokens')
    .max(50000, 'Maximum 50000 tokens')
    .default(20000)
    .describe('Token budget - more tokens = deeper research'),

  team_size: z.number()
    .int('Must be whole number')
    .min(1, 'Need at least 1 agent')
    .max(5, 'Maximum 5 agents')
    .default(2)
    .describe('Number of AI agents - more agents = broader coverage'),

  max_attempts: z.number()
    .int('Must be whole number')
    .min(1, 'Need at least 1 attempt')
    .max(10, 'Maximum 10 attempts')
    .default(3)
    .describe('Retry attempts for quality improvement'),

  no_direct_answer: z.boolean()
    .default(false)
    .describe('Force web search even for simple questions'),

  arxiv_optimized_search: z.boolean()
    .default(false)
    .describe('Optimize for academic papers and research'),

  good_domains: z.array(z.string().url('Invalid domain URL'))
    .optional()
    .describe('Preferred domains (e.g., ["scholar.google.com"])'),

  bad_domains: z.array(z.string().url('Invalid domain URL'))
    .optional()
    .describe('Domains to avoid during research'),

  only_domains: z.array(z.string().url('Invalid domain URL'))
    .optional()
    .describe('Restrict search to these domains only'),

  max_returned_urls: z.number()
    .int('Must be whole number')
    .min(1, 'Need at least 1 URL')
    .max(50, 'Maximum 50 URLs')
    .default(10)
    .describe('Maximum URLs to include in results'),

  search_query_language: z.string()
    .regex(/^[a-z]{2}$/, 'Must be 2-letter language code (e.g., "en")')
    .default('en')
    .describe('Language for search queries'),

  answer_and_think_language: z.string()
    .regex(/^[a-z]{2}$/, 'Must be 2-letter language code (e.g., "en")')
    .default('en')
    .describe('Language for response and analysis'),
}).refine(
  (data) => {
    // Intelligent validation: ensure parameters don't cause timeouts
    const { reasoning_effort, team_size, budget_tokens } = data;

    if (reasoning_effort === 'high' && team_size > 2 && budget_tokens > 30000) {
      return false; // Very likely to timeout
    }

    if (team_size > 3 && budget_tokens < 15000) {
      return false; // Too many agents, not enough tokens
    }

    return true;
  },
  {
    message: 'Parameter combination likely to timeout. Try: reasoning_effort="low", team_size=1, budget_tokens=15000',
  }
);

/**
 * Query complexity analyzer for smart defaults
 */
export function analyzeQueryComplexity(query: string): 'simple' | 'medium' | 'complex' {
  const wordCount = query.trim().split(/\s+/).length;
  const hasComplexTerms = /\b(analyze|compare|evaluate|comprehensive|detailed|research)\b/i.test(query);
  const hasAcademicTerms = /\b(paper|study|analysis|theory|framework|methodology)\b/i.test(query);

  if (wordCount > 20 || hasComplexTerms || hasAcademicTerms) {
    return 'complex';
  }
  if (wordCount > 5 || query.includes('?')) {
    return 'medium';
  }
  return 'simple';
}

/**
 * Apply intelligent defaults based on query complexity
 */
export function optimizeParameters(query: string, userParams: Record<string, unknown> = {}) {
  const complexity = analyzeQueryComplexity(query);

  const defaults = {
    simple: { reasoning_effort: 'low', team_size: 1, budget_tokens: 10000 },
    medium: { reasoning_effort: 'medium', team_size: 2, budget_tokens: 20000 },
    complex: { reasoning_effort: 'medium', team_size: 2, budget_tokens: 25000 }, // Conservative for timeout
  };

  return {
    query,
    ...defaults[complexity],
    ...userParams, // User overrides take precedence
  };
}

export type DeepSearchParams = z.infer<typeof deepSearchParamsSchema>;