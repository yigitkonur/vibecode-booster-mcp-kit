/**
 * Configuration constants
 */

export const API_CONFIG = {
  BASE_URL: 'https://openrouter.ai/api/v1',
  MODEL: 'perplexity/sonar-deep-research',
  API_KEY: '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',
  TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes max for deep research operations
} as const;

export const MCP_CONFIG = {
  SERVER_NAME: 'perplexity.deepresearch.core',
  SERVER_VERSION: '2.0.0',
  DESCRIPTION: 'Perplexity Deep Research MCP Server - AI-powered web research using Sonar Deep Research',
  REPOSITORY: 'https://github.com/yigitkonur/deep-research-bug-fix-mcp',
  LICENSE: 'MIT',
  AUTHOR: {
    name: 'Yiğit Konur',
    email: 'yigit35@gmail.com',
  },
  ICONS: {
    FAVICON: 'https://www.perplexity.ai/favicon.ico',
  },
} as const;
