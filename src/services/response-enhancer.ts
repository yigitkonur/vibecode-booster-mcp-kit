/**
 * Response enhancement service for adding metadata to scraping responses
 */

import type { AxiosResponse } from 'axios';
import type { ScrapeDoResponse } from '../types/response-types';
import { API_CONFIG } from '../utils/constants';
import { extractTitle } from '../utils/formatters';

/**
 * Enhances a raw API response with metadata
 * @param response - Raw axios response from Scrape.do API
 * @param originalUrl - The original URL that was scraped
 * @returns Enhanced response with metadata or raw data for info endpoints
 */
export function enhanceResponse(
  response: AxiosResponse,
  originalUrl?: string
): string | ScrapeDoResponse {
  // For info endpoint, return raw data
  if (response.config.url?.includes(API_CONFIG.INFO_ENDPOINT)) {
    return response.data;
  }

  // For scraping endpoints, extract metadata and return enhanced response
  const content = response.data as string;
  const statusCode = response.status || 200;
  const contentType = response.headers?.['content-type'] || 'text/html';
  const contentLength = typeof content === 'string' ? content.length : 0;
  const finalUrl = originalUrl || '';

  // Extract title from markdown content if available (only if content is a string)
  const title = typeof content === 'string' ? extractTitle(content) : undefined;

  const metadata: ScrapeDoResponse['metadata'] = {
    statusCode,
    contentType,
    contentLength,
    finalUrl,
  };

  if (title) {
    metadata.title = title;
  }

  return {
    content,
    metadata,
  };
}
