/**
 * Configuration constants with environment variable support
 */

import * as dotenv from 'dotenv';

// Load environment variables before any configuration
dotenv.config();

// API Configuration with fallbacks
export const API_CONFIG = {
  BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  MODEL: process.env.RESEARCH_MODEL || 'perplexity/sonar-deep-research',
  API_KEY: process.env.OPENROUTER_API_KEY || '',
  TIMEOUT_MS: Number.parseInt(process.env.API_TIMEOUT_MS || '1800000', 10), // Default: 30 minutes
} as const;

// Research defaults
export const RESEARCH_DEFAULTS = {
  REASONING_EFFORT: (process.env.DEFAULT_REASONING_EFFORT as 'low' | 'medium' | 'high') || 'high',
  BUDGET_TOKENS: Number.parseInt(process.env.DEFAULT_BUDGET_TOKENS || '100000', 10),
  MAX_ATTEMPTS: Number.parseInt(process.env.DEFAULT_MAX_ATTEMPTS || '3', 10),
  TEAM_SIZE: Number.parseInt(process.env.DEFAULT_TEAM_SIZE || '5', 10),
  MAX_URLS: Number.parseInt(process.env.DEFAULT_MAX_URLS || '100', 10),
} as const;

// MCP Server configuration
export const MCP_CONFIG = {
  SERVER_NAME: process.env.MCP_SERVER_NAME || 'perplexity.deepresearch.core',
  SERVER_VERSION: process.env.MCP_SERVER_VERSION || '2.0.0',
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
  TOOLS_CONFIG_PATH: process.env.TOOLS_CONFIG_PATH || 'config/tools.yaml',
} as const;
