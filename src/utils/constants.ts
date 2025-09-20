/**
 * JINA DeepSearch MCP Server Configuration
 *
 * This file centralizes all configuration for the JINA DeepSearch integration.
 * Features ultra-simple timeout handling and comprehensive research parameters.
 */

/**
 * JINA DeepSearch API configuration
 */
export const API_CONFIG = {
  // JINA DeepSearch API endpoint
  BASE_URL: 'https://deepsearch.jina.ai/v1/chat/completions',

  // Timeout configuration (95 seconds as per JINA requirements)
  TIMEOUT_MS: 95 * 1000,

  // Default research parameters for optimal performance
  DEFAULT_REASONING_EFFORT: 'medium' as const,
  DEFAULT_BUDGET_TOKENS: 20000,
  DEFAULT_TEAM_SIZE: 2,
  DEFAULT_MAX_ATTEMPTS: 3,
  DEFAULT_MAX_RETURNED_URLS: 10,

  // Language defaults
  DEFAULT_SEARCH_LANGUAGE: 'en',
  DEFAULT_ANSWER_LANGUAGE: 'en',
} as const;

/**
 * MCP server configuration
 */
export const MCP_CONFIG = {
  SERVER_NAME: 'jina-deepsearch',
  SERVER_VERSION: '1.0.0',
  DESCRIPTION:
    'JINA DeepSearch MCP Server - Ultra Simple, Direct API calls with clear timeout guidance',
} as const;

/**
 * Optimization presets for different use cases
 *
 * These presets help users get results within the 95-second timeout
 */
export const OPTIMIZATION_PRESETS = {
  // Fast preset for simple queries (completes in ~30-45 seconds)
  FAST: {
    reasoning_effort: 'low' as const,
    budget_tokens: 10000,
    team_size: 1,
    max_attempts: 2,
  },

  // Balanced preset for most queries (completes in ~60-75 seconds)
  BALANCED: {
    reasoning_effort: 'medium' as const,
    budget_tokens: 20000,
    team_size: 2,
    max_attempts: 3,
  },

  // Deep preset for complex research (may timeout, use with caution)
  DEEP: {
    reasoning_effort: 'high' as const,
    budget_tokens: 40000,
    team_size: 3,
    max_attempts: 5,
  },
} as const;

/**
 * Timeout guidance messages
 */
export const TIMEOUT_GUIDANCE = {
  WARNING_MESSAGE: 'Query timed out after 95 seconds',
  OPTIMIZATION_TIPS: [
    'reasoning_effort: "low"',
    'team_size: 1',
    'budget_tokens: 15000',
    'Make query more specific',
  ],
  SUCCESS_MESSAGE: 'These settings will complete within 95 seconds',
} as const;
