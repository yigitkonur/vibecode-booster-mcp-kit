/**
 * Consolidated configuration
 * All environment variables, constants, and LLM config in one place
 */

// ============================================================================
// Environment Parsing
// ============================================================================

export interface EnvConfig {
  SCRAPER_API_KEY: string;
  SEARCH_API_KEY: string | undefined;
  LLM_API_KEY: string | undefined;
  LLM_BASE_URL: string;
  LLM_MODEL: string;
  LLM_MODEL_SECONDARY: string | undefined;
  LLM_MODEL_TERTIARY: string | undefined;
  LLM_ENABLED: boolean;
  LLM_TIMEOUT_MS: number;
  LLM_MAX_CONCURRENT: number;
  LLM_MAX_RETRIES: number;
  REDDIT_CLIENT_ID: string | undefined;
  REDDIT_CLIENT_SECRET: string | undefined;
  RESEARCH_API_KEY: string | undefined;
}

export function parseEnv(): EnvConfig {
  return {
    SCRAPER_API_KEY: process.env.SCRAPEDO_API_KEY || '',
    SEARCH_API_KEY: process.env.SERPER_API_KEY || undefined,
    LLM_API_KEY: process.env.OPENAI_API_KEY || undefined,
    LLM_BASE_URL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    LLM_MODEL: process.env.OPENAI_MODEL || 'anthropic/claude-3.5-sonnet',
    LLM_MODEL_SECONDARY: process.env.OPENAI_MODEL_SECONDARY || undefined,
    LLM_MODEL_TERTIARY: process.env.OPENAI_MODEL_TERTIARY || undefined,
    LLM_ENABLED: process.env.LLM_ENABLED === 'true',
    LLM_TIMEOUT_MS: parseInt(process.env.LLM_TIMEOUT_MS || '300000', 10),
    LLM_MAX_CONCURRENT: parseInt(process.env.LLM_MAX_CONCURRENT || '5', 10),
    LLM_MAX_RETRIES: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID || undefined,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET || undefined,
    RESEARCH_API_KEY: process.env.OPENROUTER_API_KEY || undefined,
  };
}

// ============================================================================
// Research API Configuration
// ============================================================================

export const RESEARCH = {
  BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  MODEL: process.env.RESEARCH_MODEL || 'perplexity/sonar-deep-research',
  API_KEY: process.env.OPENROUTER_API_KEY || '',
  TIMEOUT_MS: parseInt(process.env.API_TIMEOUT_MS || '1800000', 10),
  REASONING_EFFORT: (process.env.DEFAULT_REASONING_EFFORT as 'low' | 'medium' | 'high') || 'high',
  BUDGET_TOKENS: parseInt(process.env.DEFAULT_BUDGET_TOKENS || '100000', 10),
  MAX_ATTEMPTS: parseInt(process.env.DEFAULT_MAX_ATTEMPTS || '3', 10),
  TEAM_SIZE: parseInt(process.env.DEFAULT_TEAM_SIZE || '5', 10),
  MAX_URLS: parseInt(process.env.DEFAULT_MAX_URLS || '100', 10),
} as const;

// ============================================================================
// MCP Server Configuration
// ============================================================================

export const SERVER = {
  NAME: 'reddit-research-mcp',
  VERSION: '3.0.0',
  DESCRIPTION: 'Reddit Research MCP Server with Deep Research, Web Scraping and Search',
} as const;

// ============================================================================
// Scraper Configuration (Scrape.do implementation)
// ============================================================================

export const SCRAPER = {
  MAX_CONCURRENT: 30,
  BATCH_SIZE: 30,
  MAX_TOKENS_BUDGET: 32000,
  MIN_URLS: 3,
  MAX_URLS: 50,
  RETRY_COUNT: 3,
  RETRY_DELAYS: [2000, 4000, 8000] as const,
  EXTRACTION_SUFFIX: 'Try to answer this information as comprehensive as possible while keeping info density super high without adding unnecessary words but satisfy the scope defined by previous instructions even more.',
} as const;

// ============================================================================
// Reddit Configuration
// ============================================================================

export const REDDIT = {
  MAX_CONCURRENT: 10,
  BATCH_SIZE: 10,
  MAX_COMMENT_BUDGET: 1000,
  MAX_COMMENTS_PER_POST: 200,
  MIN_POSTS: 2,
  MAX_POSTS: 50,
  RETRY_COUNT: 5,
  RETRY_DELAYS: [2000, 4000, 8000, 16000, 32000] as const,
} as const;

// ============================================================================
// CTR Weights for URL Ranking
// ============================================================================

export const CTR_WEIGHTS: Record<number, number> = {
  1: 100.00,
  2: 60.00,
  3: 48.89,
  4: 33.33,
  5: 28.89,
  6: 26.44,
  7: 24.44,
  8: 17.78,
  9: 13.33,
  10: 12.56,
} as const;

// ============================================================================
// LLM Configuration Helpers
// ============================================================================

export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  timeout: number;
  maxConcurrent: number;
  maxRetries: number;
}

export function createLLMConfigs(): LLMConfig[] {
  const env = parseEnv();
  const configs: LLMConfig[] = [];

  if (!env.LLM_API_KEY) {
    return [];
  }

  const baseConfig = {
    apiKey: env.LLM_API_KEY,
    baseURL: env.LLM_BASE_URL,
    timeout: env.LLM_TIMEOUT_MS,
    maxConcurrent: env.LLM_MAX_CONCURRENT,
    maxRetries: env.LLM_MAX_RETRIES,
  };

  configs.push({ ...baseConfig, model: env.LLM_MODEL });

  if (env.LLM_MODEL_SECONDARY) {
    configs.push({ ...baseConfig, model: env.LLM_MODEL_SECONDARY });
  }

  if (env.LLM_MODEL_TERTIARY) {
    configs.push({ ...baseConfig, model: env.LLM_MODEL_TERTIARY });
  }

  return configs;
}

export function isLLMAvailable(): boolean {
  return createLLMConfigs().length > 0;
}

export function isLLMEnabledByDefault(): boolean {
  const env = parseEnv();
  return env.LLM_ENABLED && isLLMAvailable();
}
