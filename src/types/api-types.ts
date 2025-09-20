export interface JINAApiParams {
  query: string;
  reasoning_effort?: 'low' | 'medium' | 'high';
  budget_tokens?: number;
  max_attempts?: number;
  team_size?: number;
  no_direct_answer?: boolean;
  arxiv_optimized_search?: boolean;
  good_domains?: string[];
  bad_domains?: string[];
  only_domains?: string[];
  max_returned_urls?: number;
  search_query_language?: string;
  answer_and_think_language?: string;
}

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
