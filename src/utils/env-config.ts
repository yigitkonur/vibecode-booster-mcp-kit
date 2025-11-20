import * as dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  SCRAPEDO_API_KEY: string;
  SERPER_API_KEY: string | undefined;
  OPENAI_API_KEY: string | undefined;
  OPENAI_BASE_URL: string;
  OPENAI_MODEL: string;
  OPENAI_MODEL_SECONDARY: string | undefined;
  OPENAI_MODEL_TERTIARY: string | undefined;
  LLM_ENABLED: boolean;
  LLM_TIMEOUT_MS: number;
  LLM_MAX_CONCURRENT: number;
  LLM_MAX_RETRIES: number;
}

export function parseEnvironmentVariables(): EnvConfig {
  return {
    SCRAPEDO_API_KEY: process.env.SCRAPEDO_API_KEY || '',
    SERPER_API_KEY: process.env.SERPER_API_KEY || undefined,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'anthropic/claude-3.5-sonnet',
    OPENAI_MODEL_SECONDARY: process.env.OPENAI_MODEL_SECONDARY || undefined,
    OPENAI_MODEL_TERTIARY: process.env.OPENAI_MODEL_TERTIARY || undefined,
    LLM_ENABLED: process.env.LLM_ENABLED === 'true',
    LLM_TIMEOUT_MS: parseInt(process.env.LLM_TIMEOUT_MS || '300000', 10),
    LLM_MAX_CONCURRENT: parseInt(process.env.LLM_MAX_CONCURRENT || '5', 10),
    LLM_MAX_RETRIES: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
  };
}

export function validateScrapeDoConfig(): void {
  const config = parseEnvironmentVariables();
  if (!config.SCRAPEDO_API_KEY) {
    throw new Error('SCRAPEDO_API_KEY is required in environment variables');
  }
}
