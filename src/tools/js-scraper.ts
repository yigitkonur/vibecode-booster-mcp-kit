/**
 * JavaScript-enabled browser scraping tool
 */

import { enhanceResponse } from '../services/response-enhancer';
import { makeApiRequest } from '../services/scrape-client';
import type { ScrapeDoRequestParams, ScrapeJavascriptParams } from '../types/tool-types';
import { API_CONFIG } from '../utils/constants';
import { formatScrapedContent } from '../utils/formatters';

/**
 * Renders a URL in a real headless browser to capture dynamically loaded content.
 * Returns content as Markdown with metadata header. Cost: 5 credits (standard) or 25 credits (if combined with a residential proxy).
 * @param params - Scraping parameters
 * @returns Scraped content in Markdown format with metadata header
 */
export async function scrapeJavascript(params: ScrapeJavascriptParams): Promise<string> {
  const {
    url,
    wait_ms = API_CONFIG.DEFAULT_WAIT_MS,
    wait_for_selector,
    use_residential_proxy = false,
  } = params;

  const requestParams: ScrapeDoRequestParams = {
    url,
    render: true,
    ...(wait_ms > 0 && { customWait: wait_ms }),
    ...(wait_for_selector && { waitSelector: wait_for_selector }),
    ...(use_residential_proxy && { super: true }),
  };

  const response = await makeApiRequest(requestParams);
  const enhancedResponse = enhanceResponse(response, url);

  return formatScrapedContent(enhancedResponse, url);
}
