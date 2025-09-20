/**
 * JINA DeepSearch Research Tool
 *
 * Provides comprehensive research capabilities using JINA's DeepSearch API.
 * Features ultra-simple timeout handling and clear optimization guidance.
 */

import { makeApiRequest } from '../services/scrape-client';
import type { JINAApiParams } from '../types/api-types';
import { TIMEOUT_GUIDANCE } from '../utils/constants';
import { formatResearchResponse } from '../utils/formatters';

/**
 * Performs comprehensive research using JINA DeepSearch
 *
 * @param params - Research parameters including query and optimization settings
 * @returns Formatted research results with URLs and metadata
 */
export async function performResearch(params: JINAApiParams): Promise<string> {
  try {
    // Make the API request with all provided parameters
    const response = await makeApiRequest(params);

    // Format and return the research results
    return formatResearchResponse(response, params);
  } catch (error) {
    // Handle timeout errors with specific guidance
    if (error instanceof Error && error.message.includes('timeout')) {
      return formatTimeoutError(params.query);
    }

    // Handle other API errors
    if (error instanceof Error) {
      return `❌ Research failed: ${error.message}`;
    }

    // Handle unexpected errors
    return '❌ An unexpected error occurred during research';
  }
}

/**
 * Formats timeout errors with optimization suggestions
 */
function formatTimeoutError(query: string): string {
  return [
    `⏰ **${TIMEOUT_GUIDANCE.WARNING_MESSAGE}**`,
    '',
    `🔧 **To complete this query, retry with optimized settings:**`,
    '',
    ...TIMEOUT_GUIDANCE.OPTIMIZATION_TIPS.map((tip) => `• ${tip}`),
    '',
    `💡 **${TIMEOUT_GUIDANCE.SUCCESS_MESSAGE}**`,
    '',
    `**Original query:** ${query}`,
  ].join('\n');
}
