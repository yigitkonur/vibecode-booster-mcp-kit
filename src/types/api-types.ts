/**
 * JINA DeepSearch API Types and Interfaces
 *
 * This file defines all TypeScript interfaces for interacting with the JINA DeepSearch API.
 * The API provides comprehensive research capabilities with customizable parameters.
 */

/**
 * Parameters for JINA DeepSearch API requests
 *
 * All parameters except 'query' are optional and allow fine-tuning of the research process.
 */
export interface JINAApiParams {
  // Required parameter
  query: string; // The research query to process

  // Performance tuning parameters
  reasoning_effort?: 'low' | 'medium' | 'high'; // Controls depth of analysis
  budget_tokens?: number; // Token budget for the research
  max_attempts?: number; // Maximum search attempts
  team_size?: number; // Number of AI agents to use

  // Search behavior controls
  no_direct_answer?: boolean; // Focus on research vs direct answers
  arxiv_optimized_search?: boolean; // Optimize for academic papers

  // Domain filtering
  good_domains?: string[]; // Preferred domains to search
  bad_domains?: string[]; // Domains to avoid
  only_domains?: string[]; // Restrict search to specific domains

  // Output controls
  max_returned_urls?: number; // Limit number of URLs returned
  search_query_language?: string; // Language for search queries (2-letter code)
  answer_and_think_language?: string; // Language for response (2-letter code)
}

/**
 * Response from JINA DeepSearch API
 *
 * Contains the research results along with metadata about URLs visited and tokens used.
 */
export interface JINAResponse {
  // Main response content
  choices?: Array<{
    message?: {
      content?: string; // The main research response
    };
  }>;

  // Usage statistics
  usage?: {
    total_tokens?: number; // Total tokens consumed
  };

  // URL tracking
  visitedURLs?: string[]; // URLs that were visited during research
  readURLs?: string[]; // URLs that were successfully read
}
