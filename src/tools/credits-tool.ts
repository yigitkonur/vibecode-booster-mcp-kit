/**
 * Credits checking tool
 */

import { makeApiRequest } from '../services/scrape-client';
import type { CreditsResponse, RawCreditsResponse } from '../types/api-types';
import { API_CONFIG } from '../utils/constants';

/**
 * Checks the current Scrape.do account credits and limits
 * @returns Transformed credits information in snake_case format
 */
export async function checkCredits(): Promise<CreditsResponse> {
  // Make request to info endpoint (no additional params needed)
  const response = await makeApiRequest({}, API_CONFIG.INFO_ENDPOINT);

  // Transform PascalCase keys to snake_case as per PRD requirement
  const rawData = response.data as RawCreditsResponse;

  return {
    is_active: rawData.IsActive,
    concurrency_limit: rawData.ConcurrentRequest,
    remaining_concurrency: rawData.RemainingConcurrentRequest,
    monthly_limit: rawData.MaxMonthlyRequest,
    remaining_monthly_requests: rawData.RemainingMonthlyRequest,
  };
}
