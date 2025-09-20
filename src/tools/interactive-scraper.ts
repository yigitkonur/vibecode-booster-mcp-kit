/**
 * Interactive browser automation scraping tool
 */

import { enhanceResponse } from '../services/response-enhancer';
import { makeApiRequest } from '../services/scrape-client';
import type {
  BrowserAction,
  ScrapeDoRequestParams,
  ScrapeInteractiveParams,
} from '../types/tool-types';
import { formatScrapedContent } from '../utils/formatters';

/**
 * Translates browser actions from tool format to Scrape.do API format
 * @param actions - Array of browser actions in tool format
 * @returns Array of actions in Scrape.do API format
 */
function translateBrowserActions(actions: BrowserAction[]) {
  return actions.map((action) => {
    switch (action.type) {
      case 'click':
        return { Action: 'Click', Selector: action.selector };
      case 'fill':
        return { Action: 'Fill', Selector: action.selector, Value: action.value };
      case 'wait':
        return { Action: 'Wait', Timeout: parseInt(action.value || '1000', 10) };
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  });
}

/**
 * Performs a sequence of browser actions (click, fill, wait) and then scrapes the final page state.
 * Returns content as Markdown with metadata header. Cost: 5-25 credits.
 * @param params - Scraping parameters including actions to perform
 * @returns Scraped content in Markdown format with metadata header
 */
export async function scrapeInteractive(params: ScrapeInteractiveParams): Promise<string> {
  const { url, actions } = params;

  const translatedActions = translateBrowserActions(actions);

  const requestParams: ScrapeDoRequestParams = {
    url,
    render: true,
    playWithBrowser: JSON.stringify(translatedActions),
  };

  const response = await makeApiRequest(requestParams);
  const enhancedResponse = enhanceResponse(response, url);

  return formatScrapedContent(enhancedResponse, url);
}
