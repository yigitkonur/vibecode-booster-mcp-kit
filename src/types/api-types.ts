/**
 * URL citation annotation from search results
 */
export interface UrlCitation {
  url: string;
  start_index: number;
  end_index: number;
  title: string;
}

/**
 * Annotation object in response
 */
export interface Annotation {
  type: 'url_citation';
  url_citation: UrlCitation;
}

/**
 * Chat completion response from OpenRouter (OpenAI-compatible format)
 * Used by models like xAI Grok and Perplexity Sonar with web search capabilities
 */
export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      refusal?: null;
      reasoning?: null;
      annotations?: Annotation[];
    };
    finish_reason: string;
    logprobs?: null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: {
      text_tokens?: number;
      cached_tokens?: number;
    };
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
    num_sources_used?: number;
  };
  system_fingerprint?: string;
}
