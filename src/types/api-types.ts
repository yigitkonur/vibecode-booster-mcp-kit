/**
 * OpenRouter/Perplexity API response structure
 */
export interface JINAResponse {
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
