import { LLMService } from './llm-service.js';
import { createLLMConfigs, isLLMAvailable } from '../config/index.js';

export interface ProcessingConfig {
  use_llm: boolean;
  what_to_extract: string | undefined;
  max_tokens?: number; // Dynamic token allocation per URL
}

export interface LLMResult {
  content: string;
  processed: boolean;
  error?: string;
}

export function createLLMProcessor(): LLMService | null {
  if (!isLLMAvailable()) return null;

  const configs = createLLMConfigs();
  return configs.length > 0 ? new LLMService(configs) : null;
}

export async function processContentWithLLM(
  content: string,
  config: ProcessingConfig,
  processor?: LLMService | null
): Promise<LLMResult> {
  if (!config.use_llm || !processor || !content?.trim()) {
    return { content, processed: false };
  }

  try {
    const result = await processor.processContent({
      content,
      instruction: config.what_to_extract,
      maxRetries: 3,
      timeout: 300000,
    });

    if (result.success && result.processedContent) {
      return { content: result.processedContent, processed: true };
    } else {
      return { content, processed: false, error: result.error || 'Unknown error' };
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { content, processed: false, error };
  }
}
