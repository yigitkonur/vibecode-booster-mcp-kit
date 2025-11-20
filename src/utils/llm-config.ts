import { parseEnvironmentVariables } from './env-config';

export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  timeout: number;
  maxConcurrent: number;
  maxRetries: number;
}

export function createLLMConfigsFromEnvironment(): LLMConfig[] {
  const env = parseEnvironmentVariables();
  const configs: LLMConfig[] = [];

  if (!env.OPENAI_API_KEY) {
    return [];
  }

  const baseConfig = {
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
    timeout: env.LLM_TIMEOUT_MS,
    maxConcurrent: env.LLM_MAX_CONCURRENT,
    maxRetries: env.LLM_MAX_RETRIES,
  };

  configs.push({ ...baseConfig, model: env.OPENAI_MODEL });

  if (env.OPENAI_MODEL_SECONDARY) {
    configs.push({ ...baseConfig, model: env.OPENAI_MODEL_SECONDARY });
  }

  if (env.OPENAI_MODEL_TERTIARY) {
    configs.push({ ...baseConfig, model: env.OPENAI_MODEL_TERTIARY });
  }

  return configs;
}

export function isLLMAvailable(): boolean {
  const configs = createLLMConfigsFromEnvironment();
  return configs.length > 0;
}

export function isLLMEnabledByDefault(): boolean {
  const env = parseEnvironmentVariables();
  return env.LLM_ENABLED && isLLMAvailable();
}
