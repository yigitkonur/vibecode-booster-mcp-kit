/**
 * Configuration constants
 */

export const API_CONFIG = {
  BASE_URL: 'https://deepsearch.jina.ai/v1/chat/completions',
  TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes max for deep research operations
} as const;

export const MCP_CONFIG = {
  SERVER_NAME: 'jina.deepsearch.core',
  SERVER_VERSION: '1.0.0',
  DESCRIPTION: 'JINA DeepSearch MCP Server - AI-powered web research',
  REPOSITORY: 'https://github.com/yigitkonur/jina-deepsearch-mcp',
  LICENSE: 'MIT',
  AUTHOR: {
    name: 'Yiğit Konur',
    email: 'yigit35@gmail.com',
  },
  ICONS: {
    FAVICON: 'https://jina.ai/favicon.ico',
  },
} as const;
