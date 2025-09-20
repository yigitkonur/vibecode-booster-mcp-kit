/**
 * Premium residential proxy scraping tool
 */

import { enhanceResponse } from '../services/response-enhancer';
import { makeApiRequest } from '../services/scrape-client';
import type { ScrapeDoRequestParams, ScrapePremiumParams } from '../types/tool-types';
import { API_CONFIG } from '../utils/constants';
import { formatScrapedContent } from '../utils/formatters';

/**
 * Scrapes a URL using a high-quality residential proxy from a specific country.
 * Use this for protected or geo-restricted sites. Returns content as Markdown with metadata header. Cost: 10 credits.
 * @param params - Scraping parameters
 * @returns Scraped content in Markdown format with metadata header
 */
export async function scrapePremium(params: ScrapePremiumParams): Promise<string> {
  const { url, country = API_CONFIG.DEFAULT_COUNTRY } = params;

  const requestParams: ScrapeDoRequestParams = {
    url,
    super: true,
    geoCode: country,
  };

  const response = await makeApiRequest(requestParams);
  const enhancedResponse = enhanceResponse(response, url);

  return formatScrapedContent(enhancedResponse, url);
}
