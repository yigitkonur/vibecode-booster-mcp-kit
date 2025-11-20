import OpenAI from 'openai';
import type { OpenRouterResponse } from '../types/api-types';
import { API_CONFIG } from '../utils/constants';

/**
 * Parameters for deep research API requests
 */
export interface DeepSearchParams {
  deep_research_question: string;
  system_prompt?: string;
  reasoning_effort?: 'low' | 'medium' | 'high';
  budget_tokens?: number;
  max_attempts?: number;
  team_size?: number;
  no_direct_answer?: boolean;
  max_returned_urls?: number;
  [key: string]: unknown;
}

export async function makeApiRequest(params: DeepSearchParams): Promise<OpenRouterResponse> {
  const openai = new OpenAI({
    baseURL: API_CONFIG.BASE_URL,
    apiKey: API_CONFIG.API_KEY,
    timeout: API_CONFIG.TIMEOUT_MS,
  });

  const { 
    deep_research_question, 
    system_prompt, 
    max_returned_urls, 
    reasoning_effort,
    // Remove invalid OpenRouter params
    budget_tokens,
    max_attempts,
    team_size,
    no_direct_answer,
    ...otherParams 
  } = params;
  
  // Build messages array with system prompt if provided
  const messages: Array<{ role: string; content: string }> = [];
  if (system_prompt) {
    messages.push({ role: 'system', content: system_prompt });
  }
  messages.push({ role: 'user', content: deep_research_question });
  
  // Build OpenRouter request with search_parameters
  // Note: xAI/Grok limits max_search_results to 30
  const maxSearchResults = Math.min(max_returned_urls || 100, 30);
  
  const requestPayload = {
    model: API_CONFIG.MODEL,
    messages,
    temperature: 0.3,
    reasoning_effort: reasoning_effort || 'high',
    max_completion_tokens: 1000000,
    search_parameters: {
      mode: 'on',
      max_search_results: maxSearchResults,
      return_citations: true,
      sources: [{ type: 'web' }],
    },
    ...otherParams,
  };

  if (process.env.MCP_DEBUG === 'true') {
    console.error('[DEBUG] API Request:', JSON.stringify(requestPayload, null, 2));
  }

  try {
    const response = await openai.chat.completions.create(requestPayload as any);
    return response as unknown as OpenRouterResponse;
  } catch (error: any) {
    console.error('[ERROR] API Request failed:', error.message);
    if (error.response) {
      console.error('[ERROR] Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('[ERROR] Response status:', error.response.status);
    }
    throw error;
  }
}
