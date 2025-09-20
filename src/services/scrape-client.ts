/**
 * JINA DeepSearch API Client
 *
 * This client provides direct integration with JINA's DeepSearch API for comprehensive research tasks.
 * Features ultra-simple timeout handling and clear error management.
 */

import axios from 'axios';
import type { JINAApiParams, JINAResponse } from '../types/api-types';
import { API_CONFIG } from '../utils/constants';
import { validateEnvVar } from '../utils/validators';

/**
 * Makes a request to the JINA DeepSearch API
 *
 * JINA DeepSearch API specifics:
 * - Uses POST requests with JSON payload
 * - Requires Bearer token authentication
 * - Has 95-second timeout limit for complex queries
 * - Returns comprehensive research results with visited URLs
 *
 * @param params - Research parameters including query and optional settings
 * @returns Promise resolving to JINA API response
 */
export async function makeApiRequest(params: JINAApiParams): Promise<JINAResponse> {
  // STEP 1: Validate required authentication
  const apiKey = validateEnvVar('JINA_API_KEY');

  // STEP 2: Build JINA API payload with required structure
  const payload = {
    model: 'jina-deepsearch-v1',
    messages: [{ role: 'user', content: params.query }],
    // Include all optional JINA parameters
    ...(params.reasoning_effort && { reasoning_effort: params.reasoning_effort }),
    ...(params.budget_tokens && { budget_tokens: params.budget_tokens }),
    ...(params.max_attempts && { max_attempts: params.max_attempts }),
    ...(params.team_size && { team_size: params.team_size }),
    ...(params.no_direct_answer && { no_direct_answer: params.no_direct_answer }),
    ...(params.arxiv_optimized_search && { arxiv_optimized_search: params.arxiv_optimized_search }),
    ...(params.good_domains && { good_domains: params.good_domains }),
    ...(params.bad_domains && { bad_domains: params.bad_domains }),
    ...(params.only_domains && { only_domains: params.only_domains }),
    ...(params.max_returned_urls && { max_returned_urls: params.max_returned_urls }),
    ...(params.search_query_language && { search_query_language: params.search_query_language }),
    ...(params.answer_and_think_language && {
      answer_and_think_language: params.answer_and_think_language,
    }),
  };

  // STEP 3: Make the HTTP request with timeout
  try {
    const response = await axios.post(API_CONFIG.BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: API_CONFIG.TIMEOUT_MS,
    });

    return response.data as JINAResponse;
  } catch (error) {
    // Handle timeout specifically
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error(
        'Request timed out after 95 seconds. Try optimized settings: reasoning_effort="low", team_size=1, budget_tokens=15000'
      );
    }

    // Handle API errors
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as { error?: { message?: string } };
      throw new Error(errorData.error?.message || `API error: ${error.response.status}`);
    }

    // Re-throw unexpected errors
    throw error;
  }
}
