import { type ScrapeDoResponse, scrapeDoClient } from './scrape-do-client';

/**
 * Raw response from Scrape.do API (PascalCase format)
 */
interface RawCreditsResponse {
  IsActive: boolean;
  ConcurrentRequest: number;
  MaxMonthlyRequest: number;
  RemainingConcurrentRequest: number;
  RemainingMonthlyRequest: number;
}

/**
 * Normalized credits response (snake_case format)
 */
interface CreditsResponse {
  is_active: boolean;
  concurrency_limit: number;
  remaining_concurrency: number;
  monthly_limit: number;
  remaining_monthly_requests: number;
}

/**
 * Parameters for simple scraping with datacenter proxy
 */
interface ScrapeSimpleParams {
  url: string;
  follow_redirects?: boolean;
}

/**
 * Parameters for premium scraping with residential proxy
 */
interface ScrapePremiumParams {
  url: string;
  country?: string;
}

/**
 * Parameters for JavaScript-enabled scraping
 */
interface ScrapeJavascriptParams {
  url: string;
  wait_ms?: number;
  wait_for_selector?: string;
  use_residential_proxy?: boolean;
}

/**
 * Browser automation action definition
 */
interface BrowserAction {
  type: 'click' | 'fill' | 'wait';
  selector?: string;
  value?: string;
}

/**
 * Parameters for interactive scraping with browser actions
 */
interface ScrapeInteractiveParams {
  url: string;
  actions: BrowserAction[];
}

/**
 * Request parameters sent to Scrape.do API
 */
interface ScrapeDoRequestParams {
  url: string;
  disableRedirection?: boolean;
  super?: boolean;
  geoCode?: string;
  render?: boolean;
  customWait?: number;
  waitSelector?: string;
  playWithBrowser?: string;
  [key: string]: unknown;
}

/**
 * Formats scraped content with metadata header for better readability
 * @param response - Response from scrape-do-client (either string or enhanced response)
 * @param url - Original URL for fallback metadata
 * @returns Formatted content with metadata header
 */
function formatScrapedContent(response: string | ScrapeDoResponse, url?: string): string {
  // Handle backward compatibility - if response is just a string
  if (typeof response === 'string') {
    const content = response;
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch?.[1];

    // Build simple header with available information
    const header = [
      title ? `# Title: ${title}` : `# Page Content`,
      `Status: 200 | Content-Type: text/markdown | Size: ${content.length} bytes`,
      url ? `URL: ${url}` : '',
      '---',
      '',
    ].join('\n');

    return header + content;
  }

  // Handle enhanced response format
  const { content, metadata } = response;
  const { statusCode, contentType, contentLength, finalUrl, title } = metadata;

  // Format content size for human readability
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Build header with metadata
  const header = [
    title ? `# Title: ${title}` : `# Page Content`,
    `Status: ${statusCode} | Content-Type: ${contentType} | Size: ${formatSize(contentLength)}`,
    `URL: ${finalUrl}`,
    '---',
    '',
  ].join('\n');

  return header + content;
}

/**
 * Checks the current Scrape.do account credits and limits
 * @returns Transformed credits information in snake_case format
 */
export async function check_credits(): Promise<CreditsResponse> {
  // Make request to info endpoint (no additional params needed)
  const response = await scrapeDoClient({}, '/info/');

  // Transform PascalCase keys to snake_case as per PRD requirement
  const rawData = response as unknown as RawCreditsResponse;

  return {
    is_active: rawData.IsActive,
    concurrency_limit: rawData.ConcurrentRequest,
    remaining_concurrency: rawData.RemainingConcurrentRequest,
    monthly_limit: rawData.MaxMonthlyRequest,
    remaining_monthly_requests: rawData.RemainingMonthlyRequest,
  };
}

/**
 * Scrapes a single URL using a standard datacenter proxy.
 * Returns content as Markdown with metadata header. Cost: 1 credit.
 * @param params - Scraping parameters
 * @returns Scraped content in Markdown format with metadata header
 */
export async function scrape_simple(params: ScrapeSimpleParams): Promise<string> {
  const { url, follow_redirects = true } = params;

  const requestParams: ScrapeDoRequestParams = {
    url,
    disableRedirection: !follow_redirects,
  };

  const response = await scrapeDoClient(requestParams);
  return formatScrapedContent(response, url);
}

/**
 * Scrapes a URL using a high-quality residential proxy from a specific country.
 * Use this for protected or geo-restricted sites. Returns content as Markdown with metadata header. Cost: 10 credits.
 * @param params - Scraping parameters
 * @returns Scraped content in Markdown format with metadata header
 */
export async function scrape_premium(params: ScrapePremiumParams): Promise<string> {
  const { url, country = 'US' } = params;

  const requestParams: ScrapeDoRequestParams = {
    url,
    super: true,
    geoCode: country,
  };

  const response = await scrapeDoClient(requestParams);
  return formatScrapedContent(response, url);
}

/**
 * Renders a URL in a real headless browser to capture dynamically loaded content.
 * Returns content as Markdown with metadata header. Cost: 5 credits (standard) or 25 credits (if combined with a residential proxy).
 * @param params - Scraping parameters
 * @returns Scraped content in Markdown format with metadata header
 */
export async function scrape_javascript(params: ScrapeJavascriptParams): Promise<string> {
  const { url, wait_ms = 0, wait_for_selector, use_residential_proxy = false } = params;

  const requestParams: ScrapeDoRequestParams = {
    url,
    render: true,
    ...(wait_ms > 0 && { customWait: wait_ms }),
    ...(wait_for_selector && { waitSelector: wait_for_selector }),
    ...(use_residential_proxy && { super: true }),
  };

  const response = await scrapeDoClient(requestParams);
  return formatScrapedContent(response, url);
}

/**
 * Performs a sequence of browser actions (click, fill, wait) and then scrapes the final page state.
 * Returns content as Markdown with metadata header. Cost: 5-25 credits.
 * @param params - Scraping parameters including actions to perform
 * @returns Scraped content in Markdown format with metadata header
 */
export async function scrape_interactive(params: ScrapeInteractiveParams): Promise<string> {
  const { url, actions } = params;

  const translatedActions = actions.map((action) => {
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

  const requestParams: ScrapeDoRequestParams = {
    url,
    render: true,
    playWithBrowser: JSON.stringify(translatedActions),
  };

  const response = await scrapeDoClient(requestParams);
  return formatScrapedContent(response, url);
}
