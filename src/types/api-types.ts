/**
 * OpenRouter/Perplexity API response structure (OpenAI-compatible)
 */
export interface ChatCompletionResponse {
  id?: string;
  model?: string;
  created?: number;
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  visitedURLs?: string[];
  readURLs?: string[];
}

// Legacy alias for backward compatibility
export type JINAResponse = ChatCompletionResponse;
